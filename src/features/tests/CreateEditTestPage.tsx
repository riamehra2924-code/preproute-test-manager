import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell, Breadcrumb } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { StepperInput } from "@/components/ui/StepperInput";
import { Button } from "@/components/ui/Button";
import { useSubjects, useTopics, useSubTopics, useCreateTest, useUpdateTest, useTest } from "@/lib/queries";
import { useTestDraftStore } from "@/store/testDraftStore";
import { useToastStore } from "@/store/toastStore";
import { getErrorMessage } from "@/api/client";
import type { CreateTestPayload, Difficulty, TestType } from "@/types";

interface TestFormValues {
  type: TestType;
  subject: string;
  name: string;
  topics: string[];
  sub_topics: string[];
  total_time: number | "";
  difficulty: Difficulty;
  wrong_marks: number;
  unattempt_marks: number;
  correct_marks: number;
  total_questions: number | "";
  total_marks: number | "";
}

const defaultValues: TestFormValues = {
  type: "chapterwise",
  subject: "",
  name: "",
  topics: [],
  sub_topics: [],
  total_time: "",
  difficulty: "easy",
  wrong_marks: -1,
  unattempt_marks: 0,
  correct_marks: 5,
  total_questions: "",
  total_marks: "",
};

export function CreateEditTestPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const push = useToastStore((s) => s.push);

  const { data: subjects, isLoading: subjectsLoading } = useSubjects();
  const { data: existingTest, isLoading: testLoading } = useTest(id);
  const createTest = useCreateTest();
  const updateTest = useUpdateTest();
  const setDraftTestId = useTestDraftStore((s) => s.setTestId);

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TestFormValues>({ defaultValues, mode: "onBlur" });

  const selectedSubject = watch("subject");
  const selectedTopics = watch("topics");

  const { data: topics, isLoading: topicsLoading } = useTopics(selectedSubject || undefined);
  const { data: subTopics, isLoading: subTopicsLoading } = useSubTopics(selectedTopics || []);

  const prefillStage = useRef({ testId: undefined as string | undefined, subject: false, topics: false, subTopics: false });
  useEffect(() => {
    if (prefillStage.current.testId !== id) {
      prefillStage.current = { testId: id, subject: false, topics: false, subTopics: false };
    }
  }, [id]);
  useEffect(() => {
    if (!isEdit || !existingTest || !subjects || prefillStage.current.subject)
      return;
    const matchedSubject = subjects.find((s) => s.name === existingTest.subject);
    if (!matchedSubject) {
      push(`Could not match subject "${existingTest.subject}" to a known subject.`, "error");
    }
    reset({
      type: (existingTest.type as TestType) || "chapterwise",
      subject: matchedSubject?.id || "",
      name: existingTest.name || "",
      topics: [],
      sub_topics: [],
      total_time: existingTest.total_time ?? "",
      difficulty: existingTest.difficulty || "easy",
      wrong_marks: existingTest.wrong_marks ?? -1,
      unattempt_marks: existingTest.unattempt_marks ?? 0,
      correct_marks: existingTest.correct_marks ?? 5,
      total_questions: existingTest.total_questions ?? "",
      total_marks: existingTest.total_marks ?? "",
    });
    prefillStage.current.subject = true;
  }, [isEdit, existingTest, subjects, reset, push]);

  useEffect(() => {
    if (!isEdit || !prefillStage.current.subject || prefillStage.current.topics)
      return;
    if (!existingTest?.topics?.length || !topics)
      return;
    const matchedIds = topics.filter((t) => existingTest.topics!.includes(t.name)).map((t) => t.id);
    setValue("topics", matchedIds, { shouldValidate: true });
    prefillStage.current.topics = true;
  }, [isEdit, existingTest, topics, setValue]);

  useEffect(() => {
    if (!isEdit || !prefillStage.current.topics || prefillStage.current.subTopics)
      return;
    if (!existingTest?.sub_topics?.length || !subTopics)
      return;
    const matchedIds = subTopics.filter((st) => existingTest.sub_topics!.includes(st.name)).map((st) => st.id);
    setValue("sub_topics", matchedIds);
    prefillStage.current.subTopics = true;
  }, [isEdit, existingTest, subTopics, setValue]);

  function buildPayload(values: TestFormValues): CreateTestPayload {
    return {
      name: values.name,
      type: values.type,
      subject: values.subject,
      topics: values.topics,
      sub_topics: values.sub_topics,
      correct_marks: Number(values.correct_marks),
      wrong_marks: Number(values.wrong_marks),
      unattempt_marks: Number(values.unattempt_marks),
      difficulty: values.difficulty,
      total_time: Number(values.total_time),
      total_marks: Number(values.total_marks),
      total_questions: Number(values.total_questions),
      status: "draft",
    };
  }

  async function saveTest(values: TestFormValues, goNext: boolean) {
    const payload = buildPayload(values);
    try {
      if (isEdit && id) {
        await updateTest.mutateAsync({
          id,
          payload: {
            name: payload.name,
            subject: payload.subject,
            topics: payload.topics,
            sub_topics: payload.sub_topics,
            correct_marks: payload.correct_marks,
            wrong_marks: payload.wrong_marks,
            unattempt_marks: payload.unattempt_marks,
            difficulty: payload.difficulty,
            total_time: payload.total_time,
            total_questions: payload.total_questions,
            total_marks: payload.total_marks,
          },
        });
        setDraftTestId(id, payload.name);
        push(goNext ? "Test details saved." : "Draft saved.", "success");
        if (goNext) navigate(`/tests/${id}/questions`);
        else navigate("/dashboard");
      } else {
        const created = await createTest.mutateAsync(payload);
        setDraftTestId(created.id, created.name);
        push(goNext ? "Test created. Now add your questions." : "Saved as draft.", "success");
        if (goNext) navigate(`/tests/${created.id}/questions`);
        else navigate("/dashboard");
      }
    } catch (err) {
      push(getErrorMessage(err, "Could not save this test."), "error");
    }
  }

  const isSaving = createTest.isPending || updateTest.isPending;

  if (isEdit && testLoading) {
    return (
      <AppShell breadcrumb={<Breadcrumb items={["Test Creation", "Edit Test"]} />}>
        <Card className="p-10 text-center text-sm text-ink-400">Loading test details…</Card>
      </AppShell>
    );
  }

  return (
    <AppShell
      breadcrumb={<Breadcrumb items={["Test Creation", isEdit ? "Edit Test" : "Create Test", "Chapter Wise"]} />}
    >
      <Card className="p-8">
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <SegmentedTabs
              value={field.value}
              onChange={field.onChange}
              options={[
                { value: "chapterwise", label: "Chapterwise" },
                { value: "pyq", label: "PYQ" },
                { value: "mock", label: "Mock Test" },
              ]}
            />
          )}
        />

        <form onSubmit={handleSubmit((v) => saveTest(v, true))} className="mt-8 space-y-6" noValidate>
          <div className="grid md:grid-cols-2 gap-6">
            <Controller
              name="subject"
              control={control}
              rules={{ required: "Subject is required" }}
              render={({ field }) => (
                <Select
                  label="Subject"
                  disabled={subjectsLoading}
                  options={(subjects || []).map((s) => ({ value: s.id, label: s.name }))}
                  error={errors.subject?.message}
                  {...field}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              )}
            />
            <Input
              label="Name of Test"
              placeholder="Enter name of Test"
              error={errors.name?.message}
              {...register("name", { required: "Test name is required" })}
            />

            <Controller
              name="topics"
              control={control}
              rules={{ validate: (v) => v.length > 0 || "Select at least one topic" }}
              render={({ field }) => (
                <MultiSelect
                  label="Topic"
                  disabled={!selectedSubject || topicsLoading}
                  options={(topics || []).map((t) => ({ value: t.id, label: t.name }))}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.topics?.message}
                />
              )}
            />
            <Controller
              name="sub_topics"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  label="Sub Topic"
                  disabled={selectedTopics.length === 0 || subTopicsLoading}
                  options={(subTopics || []).map((s) => ({ value: s.id, label: s.name }))}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            <Input
              label="Duration (Minutes)"
              type="number"
              placeholder="Enter the time"
              error={errors.total_time?.message}
              {...register("total_time", { required: "Duration is required", min: { value: 1, message: "Must be at least 1 minute" } })}
            />

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Test Difficulty Level</label>
              <Controller
                name="difficulty"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    name="difficulty"
                    value={field.value}
                    onChange={field.onChange}
                    options={[
                      { value: "easy", label: "Easy" },
                      { value: "medium", label: "Medium" },
                      { value: "difficult", label: "Difficult" },
                    ]}
                  />
                )}
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-ink-700 mb-3">Marking Scheme:</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Controller
                name="wrong_marks"
                control={control}
                render={({ field }) => <StepperInput label="Wrong Answer" value={field.value} onChange={field.onChange} />}
              />
              <Controller
                name="unattempt_marks"
                control={control}
                render={({ field }) => <StepperInput label="Unattempted" value={field.value} onChange={field.onChange} />}
              />
              <Controller
                name="correct_marks"
                control={control}
                render={({ field }) => <StepperInput label="Correct Answer" value={field.value} onChange={field.onChange} />}
              />
              <Input
                label="No of Questions"
                type="number"
                placeholder="Ex:50"
                error={errors.total_questions?.message}
                {...register("total_questions", { required: "Required", min: { value: 1, message: "Min 1" } })}
              />
              <Input
                label="Total Marks"
                type="number"
                placeholder="Ex:250 Marks"
                error={errors.total_marks?.message}
                {...register("total_marks", { required: "Required", min: { value: 1, message: "Min 1" } })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-ink-100">
            <Button type="button" variant="secondary" onClick={() => navigate("/dashboard")}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              loading={isSaving}
              onClick={handleSubmit((v) => saveTest(v, false))}
            >
              Save as Draft
            </Button>
            <Button type="submit" loading={isSaving}>
              Next: Add Questions
            </Button>
          </div>
        </form>
      </Card>
    </AppShell>
  );
}
