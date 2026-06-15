import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { CreateTaskModal } from "../components/workflow/CreateTaskModal";
import { TaskCard } from "../components/workflow/TaskCard";
import { TaskDetailPanel } from "../components/workflow/TaskDetailPanel";
import { TeamWorkload } from "../components/workflow/TeamWorkload";
import { fetchTaskSummary, fetchTasks } from "../services/tasksApi";
import type { ReviewTask, TaskSummary } from "../types/workflow";

type FilterTab = "mine" | "team" | "escalations" | "completed";

export function WorkflowPage() {
  const { matterId = "" } = useParams();
  const { user, users } = useUser();
  const [tasks, setTasks] = useState<ReviewTask[]>([]);
  const [summary, setSummary] = useState<TaskSummary | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>("mine");
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!matterId) return;
    Promise.all([fetchTasks(matterId), fetchTaskSummary(matterId)])
      .then(([t, s]) => {
        setTasks(t);
        setSummary(s);
      })
      .finally(() => setLoading(false));
  }, [matterId]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  const filtered = tasks.filter((t) => {
    if (filter === "mine") return user && t.assignedTo === user.id && t.status !== "completed";
    if (filter === "escalations")
      return (t.type === "escalation" || t.type === "clause_review") && t.status !== "completed";
    if (filter === "completed") return t.status === "completed";
    return t.status !== "completed";
  });

  const selected = tasks.find((t) => t.id === selectedId) ?? null;

  const handleUpdated = (task: ReviewTask) => {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    setSelectedId(task.id);
    void fetchTaskSummary(matterId).then(setSummary);
  };

  const tabs: { id: FilterTab; label: string; count?: number }[] = [
    {
      id: "mine",
      label: "My tasks",
      count: user ? tasks.filter((t) => t.assignedTo === user.id && t.status !== "completed").length : 0,
    },
    { id: "team", label: "Team inbox" },
    {
      id: "escalations",
      label: "Escalations",
      count: tasks.filter(
        (t) => (t.type === "escalation" || t.type === "clause_review") && t.status !== "completed"
      ).length,
    },
    { id: "completed", label: "Completed" },
  ];

  if (loading) {
    return <p className="text-sm text-ink-muted">Loading workflow…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="section-label">Deal team</p>
          <h1 className="mt-1 page-title">Workflow</h1>
          <p className="page-subtitle">
            {user ? `Signed in as ${user.name}` : "Assign and track review tasks"}
          </p>
        </div>
        <button type="button" onClick={() => setShowCreate(true)} className="btn-primary">
          New assignment
        </button>
      </div>

      {summary ? (
        <TeamWorkload
          summary={summary}
          currentUserId={user?.id}
          onSelectUser={(id) => setFilter(id === user?.id ? "mine" : "team")}
        />
      ) : null}

      <div className="card grid min-h-[480px] grid-cols-1 overflow-hidden lg:grid-cols-[1fr_360px]">
        <div className="flex min-h-0 flex-col border-b border-line lg:border-b-0 lg:border-r">
          <div className="flex flex-wrap gap-1 border-b border-line p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={[
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition",
                  filter === tab.id
                    ? "bg-brand-soft text-brand"
                    : "text-ink-muted hover:bg-surface-muted hover:text-ink",
                ].join(" ")}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 ? (
                  <span className="ml-1 text-brand">({tab.count})</span>
                ) : null}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-auto p-3">
            {filtered.length === 0 ? (
              <p className="p-8 text-center text-sm text-ink-muted">No tasks in this view</p>
            ) : (
              filtered.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  currentUserId={user?.id}
                  selected={selectedId === task.id}
                  onSelect={() => setSelectedId(task.id)}
                />
              ))
            )}
          </div>
        </div>

        <TaskDetailPanel
          matterId={matterId}
          task={selected}
          users={users}
          onUpdated={handleUpdated}
        />
      </div>

      {showCreate ? (
        <CreateTaskModal
          matterId={matterId}
          users={users}
          onClose={() => setShowCreate(false)}
          onCreated={(task) => {
            setTasks((prev) => [task, ...prev]);
            setSelectedId(task.id);
            void fetchTaskSummary(matterId).then(setSummary);
          }}
        />
      ) : null}
    </div>
  );
}
