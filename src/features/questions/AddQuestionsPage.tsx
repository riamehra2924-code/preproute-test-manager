import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell, Breadcrumb } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useTest, useSubjects, useTopics, useSubTopics, useBulkCreateQuestions } from "@/lib/queries";
import { parseCSV } from "@/lib/csvParser";
import { useTestDraftStore } from "@/store/testDraftStore";
import { useToastStore } from "@/store/toastStore";
import { getErrorMessage } from "@/api/client";
import type { CorrectOption, Difficulty, QuestionDraft } from "@/types";

interface QuestionFormValues {
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct_option: CorrectOption;
  explanation: string;
  difficulty: Difficulty | "";
  topic: string;
  sub_topic: string;
  media_url: string;
}

const emptyQuestion: QuestionFormValues = {
  question: "",
  option1: "",
  option2: "",
  option3: "",
  option4: "",
  correct_option: "option1",
  explanation: "",
  difficulty: "",
  topic: "",
  sub_topic: "",
  media_url: "",
};

export function AddQuestionsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const push = useToastStore((s) => s.push);

  const { data: test } = useTest(id);
  const { data: subjects } = useSubjects();

  const resolvedSubjectId = useMemo(
    () => subjects?.find((s) => s.name === test?.subject)?.id,
    [subjects, test?.subject]
  );
  const { data: topics } = useTopics(resolvedSubjectId);
  const resolvedTopicIds = useMemo(
    () => (topics && test?.topics ? topics.filter((t) => test.topics!.includes(t.name)).map((t) => t.id) : []),
    [topics, test?.topics]
  );
  const { data: subTopics } = useSubTopics(resolvedTopicIds);

  const { questions, addQuestion, updateQuestion, removeQuestion, setTestId } = useTestDraftStore();
  const bulkCreate = useBulkCreateQuestions();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (test?.id) setTestId(test.id, test.name);
  }, [test, setTestId]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<QuestionFormValues>({ defaultValues: emptyQuestion, mode: "onBlur" });

  const correctOption = watch("correct_option");

  function onAddOrUpdate(values: QuestionFormValues) {
    const payload: QuestionDraft = {
      clientId: editingId || crypto.randomUUID(),
      type: "mcq",
      question: values.question,
      option1: values.option1,
      option2: values.option2,
      option3: values.option3,
      option4: values.option4,
      correct_option: values.correct_option,
      explanation: values.explanation || undefined,
      difficulty: (values.difficulty as Difficulty) || undefined,
      topic: values.topic || undefined,
      sub_topic: values.sub_topic || undefined,
      media_url: values.media_url || undefined,
      test_id: id,
    };

    if (editingId) {
      updateQuestion(editingId, payload);
      setEditingId(null);
      push("Question updated.", "success");
    } else {
      addQuestion(payload);
      push("Question added.", "success");
    }
    reset(emptyQuestion);
  }

  function handleEdit(q: QuestionDraft) {
    setEditingId(q.clientId);
    reset({
      question: q.question,
      option1: q.option1,
      option2: q.option2,
      option3: q.option3,
      option4: q.option4,
      correct_option: q.correct_option,
      explanation: q.explanation || "",
      difficulty: q.difficulty || "",
      topic: q.topic || "",
      sub_topic: q.sub_topic || "",
      media_url: q.media_url || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setEditingId(null);
    reset(emptyQuestion);
  }

  async function handleSaveAndContinue() {
  if (questions.length === 0) {
    push("Add at least one question before continuing.", "error");
    return;
  }
  if (!id) return;
  setSubmitting(true);
  try {
    const payload = questions.map(({ clientId: _clientId, ...rest }) => {
      // Reverse-map topic and sub_topic UUIDs back to their names for the backend
      const topicName = rest.topic ? topics?.find((t) => t.id === rest.topic)?.name : undefined;
      const subTopicName = rest.sub_topic ? subTopics?.find((s) => s.id === rest.sub_topic)?.name : undefined;

      return {
        ...rest,
        test_id: id,
        subject: test?.subject, // Send the subject name, not UUID
        topic: topicName || rest.topic, // Use name if found, fallback to original
        sub_topic: subTopicName || rest.sub_topic, // Use name if found, fallback to original
      };
    });
    await bulkCreate.mutateAsync({ questions: payload });
    push("Questions saved.", "success");
    navigate(`/tests/${id}/preview`);
  } catch (err) {
    push(getErrorMessage(err, "Could not save questions."), "error");
  } finally {
    setSubmitting(false);
  }
}

async function handleCSVUpload(event: React.ChangeEvent<HTMLInputElement>) {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const { questions: parsedQuestions, errors } = parseCSV(text, id || "");

    if (errors.length > 0) {
      errors.forEach((err) => push(err, "error"));
      return;
    }

    if (parsedQuestions.length === 0) {
      push("No valid questions found in CSV", "error");
      return;
    }

    // Add all parsed questions to the draft store
    parsedQuestions.forEach((q) => addQuestion(q));
    push(`${parsedQuestions.length} questions imported from CSV`, "success");
    
    // Reset file input
    event.target.value = "";
  } catch (error) {
    push("Failed to parse CSV file", "error");
  }
}

  return (
    <AppShell breadcrumb={<Breadcrumb items={["Test Creation", "Create Test", "Add Questions"]} />}>
      {test && (
        <Card className="p-5 mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge tone="navy">{(test.type || "chapterwise").replace(/^\w/, (c) => c.toUpperCase())} Wise</Badge>
              <h2 className="font-semibold text-ink-900">{test.name}</h2>
            </div>
            <p className="text-xs text-ink-400 mt-1">Subject: {test.subject}</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-ink-500">
            <span>{test.total_time} Min</span>
            <span>{questions.length}/{test.total_questions ?? "—"} Q's</span>
            <span>{test.total_marks} Marks</span>
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-[1fr_280px] gap-6">
        <Card className="p-8">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-ink-900">
              {editingId ? "Edit Question" : `Question ${questions.length + 1}`}
            </h3>
            <div className="flex items-center gap-2">
              <label className="text-sm text-brand-500 hover:text-brand-600 cursor-pointer font-medium">
                Import CSV
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                  className="hidden"
                  aria-label="Import questions from CSV"
                />
              </label>
              {editingId && (
                <button onClick={handleCancelEdit} className="text-sm text-ink-400 hover:text-ink-700">
                  Cancel edit
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit(onAddOrUpdate)} className="space-y-5" noValidate>
            <Textarea
              label="Question"
              placeholder="Type here"
              rows={3}
              error={errors.question?.message}
              {...register("question", { required: "Question text is required" })}
            />

            <div>
              <Input 
                label="Media URL (optional)" 
                placeholder="https://example.com/image.jpg" 
                {...register("media_url")}
              />
                {watch("media_url") && (
                  <div className="mt-3 max-w-xs">
                    <img 
                      src={watch("media_url")} 
                      alt="Question media"
                      className="w-full rounded-lg border border-ink-200"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        push("Could not load image from URL", "error");
                      }}
                    />
                  </div>
                )}
              </div>

            <div>
              <p className="text-sm font-medium text-ink-700 mb-2">Type the options below</p>
              <div className="space-y-2.5">
                {(["option1", "option2", "option3", "option4"] as const).map((opt, idx) => (
                  <div key={opt} className="flex items-center gap-3">
                    <input
                      type="radio"
                      checked={correctOption === opt}
                      {...register("correct_option")}
                      value={opt}
                      className="h-4 w-4 text-brand-500 focus:ring-brand-500"
                      aria-label={`Mark option ${idx + 1} as correct`}
                    />
                    <Input
                      placeholder={`Type Option ${idx + 1} here`}
                      className="flex-1"
                      error={errors[opt]?.message}
                      {...register(opt, { required: "Required" })}
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-ink-400 mt-1.5">Select the radio button next to the correct option.</p>
            </div>

            <Controller
              name="explanation"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  label="Add Solution (Explanation)"
                  placeholder="Type here or use formatting tools"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            <div className="border-t border-ink-100 pt-5">
              <p className="text-sm font-medium text-ink-700 mb-3">Question settings</p>
              <div className="grid md:grid-cols-3 gap-4">
                <Controller
                  name="difficulty"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Level of Difficulty"
                      placeholder="Select from Drop-down"
                      options={[
                        { value: "easy", label: "Easy" },
                        { value: "medium", label: "Medium" },
                        { value: "difficult", label: "Difficult" },
                      ]}
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  )}
                />
                <Controller
                  name="topic"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Topic"
                      placeholder="Select from Drop-down"
                      options={(topics || []).map((t) => ({ value: t.id, label: t.name }))}
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  )}
                />
                <Controller
                  name="sub_topic"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Sub-topic"
                      placeholder="Select from Drop-down"
                      options={(subTopics || []).map((s) => ({ value: s.id, label: s.name }))}
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant={editingId ? "primary" : "secondary"}>
                {editingId ? "Save Changes" : "Add Another Question"}
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <p className="text-sm text-ink-400">Question creation</p>
            <p className="text-sm font-medium text-ink-900 mt-1">Total Questions · {questions.length}</p>
            <div className="mt-4 space-y-2 max-h-[420px] overflow-auto pr-1">
              {questions.length === 0 && (
                <p className="text-xs text-ink-300">No questions added yet.</p>
              )}
              {questions.map((q, idx) => (
                <div
                  key={q.clientId}
                  className="flex items-center justify-between gap-2 rounded-full border border-success-500 bg-success-50 px-3.5 py-2"
                >
                  <button
                    onClick={() => handleEdit(q)}
                    className="flex items-center gap-2 text-sm text-success-700 font-medium truncate text-left"
                  >
                    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="truncate">Question {idx + 1}</span>
                  </button>
                  <button
                    onClick={() => removeQuestion(q.clientId)}
                    aria-label="Delete question"
                    className="text-success-700/60 hover:text-danger-500 shrink-0"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Button
            className="w-full"
            onClick={handleSaveAndContinue}
            loading={submitting}
            disabled={questions.length === 0}
          >
            Save & Continue
          </Button>
          <p className="text-xs text-ink-400 text-center">Minimum 1 question required to continue.</p>
        </div>
      </div>
    </AppShell>
  );
}