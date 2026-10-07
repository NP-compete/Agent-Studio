"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import AppShell from "@/components/AppShell";

interface SystemStatus {
  api: "ok" | "error" | "loading";
  version: string;
}

export default function ConsolePage() {
  const router = useRouter();
  const [status, setStatus] = useState<SystemStatus>({
    api: "loading",
    version: "",
  });
  const [stats, setStats] = useState({
    workflows: 0,
    runs: 0,
    providers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && !isAuthenticated()) {
      window.location.href = "/login";
      return;
    }
    loadConsoleData();
  }, []);

  async function loadConsoleData() {
    const apiBase =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8088";
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
      const healthRes = await fetch(`${apiBase}/health`);
      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setStatus({
          api: "ok",
          version: healthData.version || "1.0.0",
        });
      } else {
        setStatus({ api: "error", version: "" });
      }
    } catch {
      setStatus({ api: "error", version: "" });
    }

    try {
      const [wfRes, runsRes, provRes] = await Promise.all([
        fetch(`${apiBase}/api/v1/workflows`, { headers }).then((r) =>
          r.ok ? r.json() : []
        ),
        fetch(`${apiBase}/api/v1/runs`, { headers }).then((r) =>
          r.ok ? r.json() : []
        ),
        fetch(`${apiBase}/api/v1/settings/providers`, { headers }).then((r) =>
          r.ok ? r.json() : []
        ),
      ]);
      setStats({
        workflows: Array.isArray(wfRes) ? wfRes.length : 0,
        runs: Array.isArray(runsRes) ? runsRes.length : 0,
        providers: Array.isArray(provRes) ? provRes.length : 0,
      });
    } catch {
      /* stats are best-effort */
    } finally {
      setLoading(false);
    }
  }

  const quickActions = [
    {
      title: "Create a Workflow",
      description: "Design an AI agent pipeline with the visual editor",
      href: "/workflows/new",
      icon: "M12 2L3 7v10l9 5 9-5V7l-9-5z",
      color: "bg-accent/10 text-accent",
    },
    {
      title: "View Runs",
      description: "Monitor execution history and results",
      href: "/runs",
      icon: "M5 3l7 5-7 5V3z",
      color: "bg-emerald-500/10 text-emerald-600",
    },
    {
      title: "Configure Providers",
      description: "Add your OpenAI or Anthropic API keys",
      href: "/settings",
      icon: "M12 8a4 4 0 100 8 4 4 0 000-8z",
      color: "bg-amber-500/10 text-amber-600",
    },
    {
      title: "Browse Workflows",
      description: "View and manage your saved workflows",
      href: "/workflows",
      icon: "M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7z",
      color: "bg-violet-500/10 text-violet-600",
    },
  ];

  const features = [
    {
      title: "Visual Workflow Builder",
      description:
        "Drag-and-drop canvas to compose LLM calls, tools, branching logic, and memory into multi-step agent pipelines.",
    },
    {
      title: "Multi-Provider Support",
      description:
        "Connect OpenAI, Anthropic, and more. Switch models per node — use the right LLM for each task.",
    },
    {
      title: "One-Click Deploy",
      description:
        "Compile workflows to executable code and deploy to Kubernetes with a single click.",
    },
    {
      title: "Real-Time Monitoring",
      description:
        "Stream execution logs, inspect node-level results, and track run history across all workflows.",
    },
    {
      title: "Safety Guardrails",
      description:
        "Built-in content filtering, SSRF protection, and human-in-the-loop approval nodes for sensitive operations.",
    },
    {
      title: "Open Source",
      description:
        "MIT licensed, fully self-hosted on Kubernetes. Your data, your infrastructure, your rules.",
    },
  ];

  return (
    <AppShell>
      <div className="px-10 py-8">
        {/* Header */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold tracking-tight text-text">
            Console
          </h2>
          <p className="mt-1.5 text-sm text-text-muted">
            Your Agent Studio dashboard — system status, quick actions, and
            platform overview.
          </p>
        </div>

        {/* System Status */}
        <div className="mb-8 rounded-xl border border-border/60 bg-surface-card p-6">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
            System Status
          </h3>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="flex items-center gap-3">
              <div
                className={`h-2.5 w-2.5 rounded-full ${
                  status.api === "ok"
                    ? "bg-emerald-500"
                    : status.api === "loading"
                      ? "bg-amber-400 animate-pulse"
                      : "bg-red-500"
                }`}
              />
              <div>
                <p className="text-sm font-medium text-text">API Server</p>
                <p className="text-xs text-text-muted">
                  {status.api === "ok"
                    ? "Healthy"
                    : status.api === "loading"
                      ? "Checking..."
                      : "Unreachable"}
                </p>
              </div>
            </div>
            {status.version && (
              <div className="flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-accent" />
                <div>
                  <p className="text-sm font-medium text-text">Version</p>
                  <p className="text-xs text-text-muted">{status.version}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <div>
                <p className="text-sm font-medium text-text">Web Console</p>
                <p className="text-xs text-text-muted">Running</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "Workflows",
              value: stats.workflows,
              color: "text-accent",
            },
            {
              label: "Total Runs",
              value: stats.runs,
              color: "text-emerald-600",
            },
            {
              label: "Providers",
              value: stats.providers,
              color: "text-amber-600",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border/60 bg-surface-card p-5"
            >
              <p className="text-xs font-medium text-text-muted">{s.label}</p>
              <p className={`mt-1 text-2xl font-semibold ${s.color}`}>
                {loading ? "—" : s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Quick Actions
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <button
                key={action.title}
                onClick={() => router.push(action.href)}
                className="group rounded-xl border border-border/60 bg-surface-card p-5 text-left transition-all hover:border-accent/40 hover:shadow-sm"
              >
                <div
                  className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${action.color}`}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={action.icon} />
                  </svg>
                </div>
                <h4 className="text-sm font-medium text-text group-hover:text-accent transition-colors">
                  {action.title}
                </h4>
                <p className="mt-1 text-xs text-text-muted">
                  {action.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Platform Features */}
        <div>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Platform Features
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-border/60 bg-surface-card p-5"
              >
                <h4 className="text-sm font-medium text-text">{f.title}</h4>
                <p className="mt-1.5 text-xs leading-relaxed text-text-muted">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Getting Started */}
        <div className="mt-8 rounded-xl border border-accent/20 bg-accent/5 p-6">
          <h3 className="text-sm font-semibold text-text">Getting Started</h3>
          <ol className="mt-3 space-y-2 text-xs text-text-muted">
            <li className="flex gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[10px] font-bold text-accent">
                1
              </span>
              <span>
                <strong className="text-text">Add a provider</strong> — go to{" "}
                <button
                  onClick={() => router.push("/settings")}
                  className="text-accent hover:underline"
                >
                  Settings
                </button>{" "}
                and configure your OpenAI or Anthropic API key.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[10px] font-bold text-accent">
                2
              </span>
              <span>
                <strong className="text-text">Create a workflow</strong> — open
                the{" "}
                <button
                  onClick={() => router.push("/workflows/new")}
                  className="text-accent hover:underline"
                >
                  visual editor
                </button>{" "}
                and drag nodes onto the canvas.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[10px] font-bold text-accent">
                3
              </span>
              <span>
                <strong className="text-text">Run it</strong> — hit the Run
                button and watch your agent execute in real time.
              </span>
            </li>
          </ol>
        </div>
      </div>
    </AppShell>
  );
}
