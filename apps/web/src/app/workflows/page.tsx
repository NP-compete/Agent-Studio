"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { listWorkflows, deleteWorkflow } from "@/lib/api";
import AppShell from "@/components/AppShell";

interface WorkflowItem {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export default function WorkflowsListPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && !isAuthenticated()) {
      window.location.href = "/login";
      return;
    }
    loadWorkflows();
  }, []);

  async function loadWorkflows() {
    try {
      const list = (await listWorkflows()) as WorkflowItem[];
      setWorkflows(list);
    } catch {
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete workflow "${name}"?`)) return;
    try {
      await deleteWorkflow(id);
      setWorkflows((prev) => prev.filter((w) => w.id !== id));
    } catch {
      /* ignored */
    }
  }

  function timeAgo(ts?: string) {
    if (!ts) return "";
    const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  return (
    <AppShell>
      <div className="px-10 py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-text">
              Workflows
            </h2>
            <p className="mt-1.5 text-sm text-text-muted">
              Create and manage your agent workflows.
            </p>
          </div>
          <button
            onClick={() => router.push("/workflows/new")}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-accent/20 transition-all hover:bg-accent-hover hover:shadow-md hover:shadow-accent/25 active:scale-[0.98]"
          >
            New Workflow
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
          </div>
        ) : workflows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-16 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent/8 text-accent">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-text">No workflows yet</p>
            <p className="mt-1 text-xs text-text-muted">
              Create your first agent workflow to get started
            </p>
            <button
              onClick={() => router.push("/workflows/new")}
              className="mt-4 rounded-lg bg-accent px-4 py-2 text-xs font-medium text-white hover:bg-accent-hover"
            >
              New Workflow
            </button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {workflows.map((w) => (
              <div
                key={w.id}
                onClick={() => router.push(`/workflows/${w.id}`)}
                className="group cursor-pointer rounded-xl border border-border/60 bg-surface-card p-5 transition-all hover:border-accent/40 hover:shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-medium text-text group-hover:text-accent transition-colors">
                      {w.name}
                    </h3>
                    {w.updated_at && (
                      <p className="mt-1 text-xs text-text-muted">
                        Updated {timeAgo(w.updated_at)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(w.id, w.name);
                    }}
                    className="ml-2 rounded-md p-1.5 text-text-muted/30 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-red-500/10"
                    title="Delete"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M3 3.5h8M5.5 3.5V2.5a1 1 0 011-1h1a1 1 0 011 1v1M6 6v3.5M8 6v3.5M3.5 3.5l.5 8a1 1 0 001 1h4a1 1 0 001-1l.5-8"
                        stroke="currentColor"
                        strokeWidth="1.1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
