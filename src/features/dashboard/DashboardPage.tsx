import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppShell, Breadcrumb } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge, statusToBadge } from "@/components/ui/Badge";
import { useTests, useDeleteTest } from "@/lib/queries";
import { useToastStore } from "@/store/toastStore";
import { getErrorMessage } from "@/api/client";
import { useTestDraftStore } from "@/store/testDraftStore";

type StatusFilter = "all" | "draft" | "live";

export function DashboardPage() {
  const { data: tests, isLoading, isError, error } = useTests();
  const deleteTest = useDeleteTest();
  const push = useToastStore((s) => s.push);
  const navigate = useNavigate();
  const resetDraft = useTestDraftStore((s) => s.reset);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!tests) return [];
    return tests.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.subject?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tests, search, statusFilter]);

  function handleCreateNew() {
    resetDraft();
    navigate("/tests/new");
  }

  async function handleDelete(id: string) {
    try {
      await deleteTest.mutateAsync(id);
      push("Test deleted successfully.", "success");
    } catch (err) {
      push(getErrorMessage(err, "Could not delete this test."), "error");
    } finally {
      setConfirmDeleteId(null);
    }
  }

  return (
    <AppShell breadcrumb={<Breadcrumb items={["Dashboard"]} />}>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">Your tests</h1>
          <p className="text-sm text-ink-400 mt-0.5">Create, manage, and publish tests for your learners.</p>
        </div>
        <Button onClick={handleCreateNew}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Test
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <circle cx="11" cy="11" r="7" strokeWidth={2} />
            <path strokeLinecap="round" strokeWidth={2} d="M21 21l-4.35-4.35" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by test name or subject"
            className="w-full rounded-lg border border-ink-200 bg-white pl-9 pr-3.5 py-2.5 text-sm placeholder:text-ink-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div className="flex gap-1.5">
          {(["all", "draft", "live"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                statusFilter === s ? "bg-brand-50 text-brand-600" : "text-ink-400 hover:bg-ink-100"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-card bg-white border border-ink-100 animate-pulse" />
          ))}
        </div>
      )}

      {isError && (
        <Card className="p-8 text-center">
          <p className="text-sm text-danger-500">{getErrorMessage(error, "Could not load tests.")}</p>
        </Card>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-ink-700 font-medium">No tests yet</p>
          <p className="text-sm text-ink-400 mt-1">Create your first test to get started.</p>
          <Button className="mt-4" onClick={handleCreateNew}>
            Create New Test
          </Button>
        </Card>
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="grid gap-3">
          {filtered.map((test) => {
            const badge = statusToBadge(test.status as string);
            return (
              <Card key={test.id} className="p-5 flex items-center justify-between gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-ink-900 truncate">{test.name}</h3>
                    <Badge tone={badge.tone}>{badge.label}</Badge>
                  </div>
                  <div className="mt-1.5 flex items-center gap-3 text-xs text-ink-400 flex-wrap">
                    <span>{test.subject}</span>
                    {test.topics?.length ? (
                      <span className="flex items-center gap-1">
                        {test.topics.slice(0, 3).map((t) => (
                          <span key={t} className="rounded-full border border-warn-500 text-warn-700 px-2 py-0.5">
                            {t}
                          </span>
                        ))}
                      </span>
                    ) : null}
                    <span>
                      Created{" "}
                      {new Date(test.created_at).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link to={`/tests/${test.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                  <Link to={`/tests/${test.id}/edit`}>
                    <Button variant="secondary" size="sm">
                      Edit
                    </Button>
                  </Link>
                  {confirmDeleteId === test.id ? (
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="danger"
                        size="sm"
                        loading={deleteTest.isPending}
                        onClick={() => handleDelete(test.id)}
                      >
                        Confirm
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(null)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(test.id)}>
                      Delete
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
