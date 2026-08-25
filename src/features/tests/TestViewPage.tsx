import { useParams, Link } from "react-router-dom";
import { AppShell, Breadcrumb } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge, statusToBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useTest, useFetchBulkQuestions } from "@/lib/queries";

export function TestViewPage() {
  const { id } = useParams<{ id: string }>();
  const { data: test, isLoading: testLoading } = useTest(id);
  const { data: questions, isLoading: questionsLoading } = useFetchBulkQuestions(test?.questions || []);

  if (testLoading || !test) {
    return (
      <AppShell breadcrumb={<Breadcrumb items={["Test Creation", "View Test"]} />}>
        <Card className="p-10 text-center text-sm text-ink-400">Loading test…</Card>
      </AppShell>
    );
  }

  const { tone, label } = statusToBadge(test.status);

  return (
    <AppShell breadcrumb={<Breadcrumb items={["Test Tracking", test.name]} />}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm text-ink-400">Test details</p>
          <div className="flex items-center gap-2 mt-1">
            <h1 className="text-lg font-semibold text-ink-900">{test.name}</h1>
            <Badge tone={tone}>{label}</Badge>
          </div>
        </div>
        <Link to={`/tests/${id}/edit`}>
          <Button variant="outline" size="sm">
            Edit Test
          </Button>
        </Link>
      </div>

      <Card className="p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <Badge tone="navy">{(test.type || "chapterwise").replace(/^\w/, (c) => c.toUpperCase())} Wise</Badge>
            <div className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
              <span className="text-ink-400">Subject</span>
              <span className="text-ink-900 font-medium">{test.subject}</span>
              <span className="text-ink-400">Topics</span>
              <span className="flex flex-wrap gap-1.5">
                {(test.topics || []).map((t) => (
                  <span key={t} className="rounded-full border border-warn-500 text-warn-700 px-2 py-0.5 text-xs">
                    {t}
                  </span>
                ))}
              </span>
              <span className="text-ink-400">Sub-topics</span>
              <span className="flex flex-wrap gap-1.5">
                {(test.sub_topics || []).map((s) => (
                  <span key={s} className="rounded-full border border-brand-500 text-brand-700 px-2 py-0.5 text-xs">
                    {s}
                  </span>
                ))}
              </span>
              <span className="text-ink-400">Difficulty</span>
              <span className="text-ink-900 font-medium capitalize">{test.difficulty}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-ink-500 bg-ink-50 rounded-lg px-4 py-2">
            <span>⏱ {test.total_time} Min</span>
            <span className="w-px h-4 bg-ink-200" />
            <span>{test.total_questions} Q's</span>
            <span className="w-px h-4 bg-ink-200" />
            <span>{test.total_marks} Marks</span>
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <h3 className="font-semibold text-ink-900 mb-4">Marking Scheme</h3>
        <div className="grid sm:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="text-ink-400">Correct Answer</p>
            <p className="text-lg font-semibold text-success-600 mt-1">+{test.correct_marks}</p>
          </div>
          <div>
            <p className="text-ink-400">Wrong Answer</p>
            <p className="text-lg font-semibold text-danger-600 mt-1">{test.wrong_marks}</p>
          </div>
          <div>
            <p className="text-ink-400">Unattempted</p>
            <p className="text-lg font-semibold text-ink-600 mt-1">{test.unattempt_marks}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-ink-900 mb-4">All Questions ({test.total_questions})</h3>
        {questionsLoading ? (
          <p className="text-sm text-ink-400">Loading questions…</p>
        ) : !questions || questions.length === 0 ? (
          <p className="text-sm text-ink-400">No questions added yet.</p>
        ) : (
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={q.id} className="border border-ink-100 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-sm font-medium text-ink-500">{idx + 1}.</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink-900">{q.question}</p>
                    {q.media_url && (
                      <img
                        src={q.media_url}
                        alt={`Question ${idx + 1}`}
                        className="mt-3 max-w-xs rounded-lg border border-ink-200"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                    <div className="mt-2.5 grid sm:grid-cols-2 gap-1.5">
                      {(["option1", "option2", "option3", "option4"] as const).map((opt) => (
                        <div
                          key={opt}
                          className={`text-xs rounded-md px-2.5 py-1.5 ${
                            q.correct_option === opt
                              ? "bg-success-50 text-success-700 font-medium"
                              : "bg-ink-50 text-ink-500"
                          }`}
                        >
                          {q[opt]}
                        </div>
                      ))}
                    </div>
                    {q.explanation && (
                      <p className="text-xs text-ink-500 mt-2.5 italic">
                        <span className="font-medium">Explanation:</span> {q.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </AppShell>
  );
}
