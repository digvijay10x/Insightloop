"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getProject, getAnalyses, getThemes } from "@/lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface AnalysisData {
  id: string;
  type: string;
  sourceType: string;
  reviewCount: number;
  themeCount: number;
  createdAt: string;
  p1Count?: number;
}

export default function HistoryPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [analyses, setAnalyses] = useState<AnalysisData[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const proj = await getProject(projectId);
        setProject(proj);

        const allAnalyses = await getAnalyses(projectId);
        const enriched: AnalysisData[] = [];

        for (const a of allAnalyses) {
          try {
            const themes = await getThemes(projectId, a.id);
            const p1Count = themes.filter(
              (t: any) => t.priority === "P1",
            ).length;
            enriched.push({ ...a, p1Count });
          } catch {
            enriched.push({ ...a, p1Count: 0 });
          }
        }

        setAnalyses(enriched);

        const chart = enriched
          .slice()
          .reverse()
          .map((a) => ({
            date: new Date(a.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            p1: a.p1Count || 0,
          }));
        setChartData(chart);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId]);

  const getDelta = (index: number) => {
    if (index >= analyses.length - 1) return null;
    const current = analyses[index].p1Count || 0;
    const previous = analyses[index + 1].p1Count || 0;
    const diff = current - previous;
    if (diff === 0) return null;
    return diff;
  };

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Sidebar */}
      <aside className="w-56 border-r border-border p-6 flex flex-col gap-2">
        <Link href="/" className="text-lg font-bold text-text mb-8">
          Insight<span className="text-accent">Loop</span>
        </Link>
        <Link
          href="/dashboard"
          className="text-sm text-muted hover:text-text px-3 py-2 rounded-lg transition-colors"
        >
          Dashboard
        </Link>
        <Link
          href="/projects"
          className="text-sm text-muted hover:text-text px-3 py-2 rounded-lg transition-colors"
        >
          Projects
        </Link>
        {project && (
          <>
            <div className="mt-6 mb-2 text-xs text-muted uppercase tracking-wider">
              Current Project
            </div>
            <div className="text-sm text-text font-medium px-3 py-2">
              {project.name}
            </div>
            <Link
              href={`/projects/${projectId}/analyze`}
              className="text-sm text-muted hover:text-text px-3 py-2 rounded-lg transition-colors"
            >
              Analyze
            </Link>
            <Link
              href={`/projects/${projectId}/history`}
              className="text-sm text-accent font-medium px-3 py-2 bg-accent/10 rounded-lg"
            >
              History
            </Link>
          </>
        )}
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-text mb-2">
          {project?.name || "Loading..."}
        </h1>
        <p className="text-muted text-sm mb-8">Analysis History</p>

        {loading ? (
          <div className="bg-card border border-border rounded-xl p-10 text-center">
            <p className="text-muted">Loading history...</p>
          </div>
        ) : analyses.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-10 text-center">
            <p className="text-muted mb-4">No analyses yet for this project.</p>
            <Link
              href={`/projects/${projectId}/analyze`}
              className="px-5 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all"
            >
              Run Analysis
            </Link>
          </div>
        ) : (
          <>
            {/* P1 Trend Chart */}
            {chartData.length > 1 && (
              <div className="bg-card border border-border rounded-xl p-6 mb-8">
                <h2 className="text-lg font-semibold text-text mb-4">
                  P1 Issues Over Time
                </h2>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                    <YAxis
                      stroke="#64748b"
                      fontSize={12}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111111",
                        border: "1px solid #1e1e1e",
                        borderRadius: "8px",
                        color: "#f1f5f9",
                        fontSize: "12px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="p1"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={{ fill: "#2563eb", r: 4 }}
                      name="P1 Count"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Timeline */}
            <h2 className="text-lg font-semibold text-text mb-4">
              Past Analyses
            </h2>
            <div className="space-y-4">
              {analyses.map((a, index) => {
                const delta = getDelta(index);
                return (
                  <div
                    key={a.id}
                    className="bg-card border border-border rounded-xl p-5 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-text font-medium text-sm">
                          {a.type === "competitor"
                            ? "Competitor Benchmarking"
                            : "Feedback Analysis"}
                        </span>
                        <span className="text-muted text-xs px-2 py-0.5 bg-bg border border-border rounded">
                          {a.sourceType}
                        </span>
                        {delta !== null && (
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded ${
                              delta > 0
                                ? "bg-red-500/20 text-red-400"
                                : "bg-green-500/20 text-green-400"
                            }`}
                          >
                            {delta > 0 ? `+${delta}` : delta} P1
                          </span>
                        )}
                      </div>
                      <p className="text-muted text-xs">
                        {a.reviewCount} reviews, {a.themeCount} themes extracted
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted text-xs">
                        {new Date(a.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <div className="flex gap-3 mt-2 justify-end">
                        <span className="text-red-400 text-xs font-medium">
                          P1: {a.p1Count}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
