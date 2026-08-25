import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { AppShell, Breadcrumb } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import { useTest, useUpdateTest } from "@/lib/queries";
import { useTestDraftStore } from "@/store/testDraftStore";
import { useNotificationStore } from "@/store/notificationStore";
import { useToastStore } from "@/store/toastStore";
import { getErrorMessage } from "@/api/client";

type PublishMode = "now" | "schedule";
type LiveUntil = "always" | "1w" | "2w" | "3w" | "1m" | "custom";

const liveUntilOptions: { value: LiveUntil; label: string }[] = [
  { value: "always", label: "Always Available" },
  { value: "1w", label: "1 Week" },
  { value: "2w", label: "2 Weeks" },
  { value: "3w", label: "3 Weeks" },
  { value: "1m", label: "1 Month" },
  { value: "custom", label: "Custom Duration" },
];

export function PreviewPublishPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const push = useToastStore((s) => s.push);

  const { data: test, isLoading } = useTest(id);
  const { questions, reset: resetDraft } = useTestDraftStore();
  const updateTest = useUpdateTest();

  const [publishMode, setPublishMode] = useState<PublishMode>("now");
  const [liveUntil, setLiveUntil] = useState<LiveUntil>("always");
  const [published, setPublished] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const addNotification = useNotificationStore((s) => s.addNotification);

  async function handleConfirmPublish() {
    if (!id || !test) return;
    setPublishing(true);
    try {
      await updateTest.mutateAsync({ id, payload: { status: "live" } });
      push("Test published.", "success");
      addNotification(
        "Test Published ✓",
        `${test.name} is now live and available to learners`,
        "success"
      );
      setPublished(true);
      resetDraft();
      setTimeout(() => {
        navigate(`/tests/${id}`);
      }, 2000);
    } catch (err) {
      push(getErrorMessage(err, "Could not publish test."), "error");
    } finally {
      setPublishing(false);
    }
  }

  if (isLoading || !test) {
    return (
      <AppShell breadcrumb={<Breadcrumb items={["Test Creation", "Preview & Publish"]} />}>
        <Card className="p-10 text-center text-sm text-ink-400">Loading test…</Card>
      </AppShell>
    );
  }

  return (
    <AppShell breadcrumb={<Breadcrumb items={["Test Creation", "Preview & Publish"]} />}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm text-ink-400">Test creation</p>
          <div className="flex items-center gap-2 mt-1">
            <h1 className="text-lg font-semibold text-ink-900">Test created</h1>
            <Badge tone="success">All {questions.length || test.total_questions} Questions done</Badge>
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
            <h2 className="text-lg font-semibold text-ink-900 mt-2">{test.name}</h2>
            <div className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
              <span className="text-ink-400">Subject</span>
              <span className="text-ink-900 font-medium">{test.subject}</span>
              <span className="text-ink-400">Topic</span>
              <span className="flex flex-wrap gap-1.5">
                {(test.topics || []).map((t) => (
                  <span key={t} className="rounded-full border border-warn-500 text-warn-700 px-2 py-0.5 text-xs">
                    {t}
                  </span>
                ))}
              </span>
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
        <h3 className="font-semibold text-ink-900 mb-4">All Questions ({questions.length})</h3>
        {questions.length === 0 ? (
          <p className="text-sm text-ink-400">
            No questions found in this session.{" "}
            <Link to={`/tests/${id}/questions`} className="text-brand-500 hover:underline">
              Go add questions
            </Link>
            .
          </p>
        ) : (
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={q.clientId} className="border border-ink-100 rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink-900">
                      {idx + 1}. {q.question}
                    </p>
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
                  </div>
                  <Link
                    to={`/tests/${id}/questions`}
                    className="text-xs text-brand-500 hover:underline shrink-0"
                  >
                    Edit
                  </Link>
                </div>
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
  </div>
            ))}
          </div>
        )}
      </Card>

      {!published ? (
        <Card className="p-6">
          <SegmentedTabs
            value={publishMode}
            onChange={setPublishMode}
            options={[
              { value: "now", label: "Publish Now" },
              { value: "schedule", label: "Schedule Publish" },
            ]}
          />

          {publishMode === "schedule" && (
            <div className="mt-5 grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Select Date</label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Select Time</label>
                <input
                  type="time"
                  className="w-full rounded-lg border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>
          )}

          <div className="mt-6">
            <p className="text-sm font-medium text-ink-700 mb-1">Live Until</p>
            <p className="text-xs text-ink-400 mb-3">Choose how long this test should remain available on the platform.</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {liveUntilOptions.map((opt) => (
                <label key={opt.value} className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="liveUntil"
                    checked={liveUntil === opt.value}
                    onChange={() => setLiveUntil(opt.value)}
                    className="h-4 w-4 text-brand-500 focus:ring-brand-500"
                  />
                  <span className="text-sm text-ink-800">{opt.label}</span>
                </label>
              ))}
            </div>
            {liveUntil === "custom" && (
              <div className="mt-4 grid sm:grid-cols-2 gap-4">
                <input
                  type="date"
                  placeholder="Select End Date"
                  className="w-full rounded-lg border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
                <input
                  type="time"
                  placeholder="Select End Time"
                  className="w-full rounded-lg border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-ink-100">
            <Button variant="secondary" onClick={() => navigate("/dashboard")}>
              Cancel
            </Button>
            <Button onClick={handleConfirmPublish} loading={publishing}>
              Confirm
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-10 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-success-50 flex items-center justify-center mb-3">
            <svg className="h-6 w-6 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="font-semibold text-ink-900">Test published successfully</h3>
          <p className="text-sm text-ink-400 mt-1">Redirecting you to the dashboard…</p>
        </Card>
      )}
    </AppShell>
  );
}
