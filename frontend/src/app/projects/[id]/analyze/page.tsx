"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  getProject,
  streamAnalysis,
  streamCompetitorAnalysis,
  getExportUrl,
} from "@/lib/api";

interface ThemeData {
  id: string;
  title: string;
  priority: string;
  mentionCount: number;
  sentiment: string;
  priorityScore: number;
  aiReasoning: string;
  source?: string;
  quotes: string[];
}

interface StatusData {
  step: string;
  message: string;
}

export default function AnalyzePage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [tab, setTab] = useState<"feedback" | "competitor">("feedback");

  const [sourceType, setSourceType] = useState("app-store");
  const [rawInput, setRawInput] = useState("");
  const [themes, setThemes] = useState<ThemeData[]>([]);
  const [status, setStatus] = useState<StatusData | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [expandedTheme, setExpandedTheme] = useState<string | null>(null);

  const [ownReviews, setOwnReviews] = useState("");
  const [competitorReviews, setCompetitorReviews] = useState("");
  const [compThemes, setCompThemes] = useState<ThemeData[]>([]);
  const [compStatus, setCompStatus] = useState<StatusData | null>(null);
  const [compAnalyzing, setCompAnalyzing] = useState(false);
  const [compSummary, setCompSummary] = useState("");
  const [compAnalysisId, setCompAnalysisId] = useState<string | null>(null);

  useEffect(() => {
    getProject(projectId).then(setProject).catch(console.error);
  }, [projectId]);

  const sources = [
    "app-store",
    "play-store",
    "survey",
    "support",
    "social",
    "manual",
  ];

  const handleAnalyze = () => {
    if (!rawInput.trim() || analyzing) return;
    setThemes([]);
    setStatus(null);
    setAnalysisId(null);
    setAnalyzing(true);

    streamAnalysis(projectId, rawInput, sourceType, (event, data) => {
      if (event === "status") setStatus(data);
      if (event === "theme") setThemes((prev) => [...prev, data]);
      if (event === "complete") {
        setAnalysisId(data.analysisId);
        setAnalyzing(false);
        setStatus(null);
      }
      if (event === "error") {
        setAnalyzing(false);
        setStatus({ step: "error", message: data.message });
      }
    });
  };

  const handleCompetitor = () => {
    if (!ownReviews.trim() || !competitorReviews.trim() || compAnalyzing)
      return;
    setCompThemes([]);
    setCompStatus(null);
    setCompSummary("");
    setCompAnalysisId(null);
    setCompAnalyzing(true);

    streamCompetitorAnalysis(
      projectId,
      ownReviews,
      competitorReviews,
      (event, data) => {
        if (event === "status") setCompStatus(data);
        if (event === "theme") setCompThemes((prev) => [...prev, data]);
        if (event === "complete") {
          setCompAnalysisId(data.analysisId);
          setCompSummary(data.summary || "");
          setCompAnalyzing(false);
          setCompStatus(null);
        }
        if (event === "error") {
          setCompAnalyzing(false);
          setCompStatus({ step: "error", message: data.message });
        }
      },
    );
  };

  const priorityColor = (p: string) => {
    if (p === "P1") return "bg-red-500/20 text-red-400 border-red-500/30";
    if (p === "P2")
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-green-500/20 text-green-400 border-green-500/30";
  };

  const sentimentColor = (s: string) => {
    if (s === "positive") return "text-green-400";
    if (s === "negative") return "text-red-400";
    return "text-yellow-400";
  };

  const renderThemeCard = (theme: ThemeData) => (
    <div
      key={theme.id}
      className="bg-card border border-border rounded-xl p-5 mb-4"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-text font-semibold">{theme.title}</h3>
        <span
          className={`text-xs font-bold px-2 py-1 rounded border ${priorityColor(theme.priority)}`}
        >
          {theme.priority}
        </span>
      </div>
      <div className="flex gap-4 mb-3">
        <span className="text-muted text-xs">
          Mentions: {theme.mentionCount}
        </span>
        <span
          className={`text-xs font-medium ${sentimentColor(theme.sentiment)}`}
        >
          {theme.sentiment}
        </span>
        <span className="text-muted text-xs">
          Score: {theme.priorityScore.toFixed(2)}
        </span>
      </div>
      <p className="text-muted text-sm mb-3">{theme.aiReasoning}</p>
      <button
        onClick={() =>
          setExpandedTheme(expandedTheme === theme.id ? null : theme.id)
        }
        className="text-accent text-xs font-medium hover:underline"
      >
        {expandedTheme === theme.id
          ? "Hide Quotes"
          : `Show Quotes (${theme.quotes.length})`}
      </button>
      {expandedTheme === theme.id && (
        <div className="mt-3 space-y-2">
          {theme.quotes.map((q, i) => (
            <div key={i} className="bg-bg border border-border rounded-lg p-3">
              <p className="text-muted text-xs italic">&quot;{q}&quot;</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-bg">
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
              className="text-sm text-accent font-medium px-3 py-2 bg-accent/10 rounded-lg"
            >
              Analyze
            </Link>
            <Link
              href={`/projects/${projectId}/history`}
              className="text-sm text-muted hover:text-text px-3 py-2 rounded-lg transition-colors"
            >
              History
            </Link>
          </>
        )}
      </aside>

      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-text mb-2">
          {project?.name || "Loading..."}
        </h1>
        <p className="text-muted text-sm mb-8">{project?.description}</p>

        <div className="flex gap-1 mb-8 bg-card border border-border rounded-lg p-1 w-fit">
          <button
            onClick={() => setTab("feedback")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === "feedback"
                ? "bg-accent text-white"
                : "text-muted hover:text-text"
            }`}
          >
            Feedback Analysis
          </button>
          <button
            onClick={() => setTab("competitor")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === "competitor"
                ? "bg-accent text-white"
                : "text-muted hover:text-text"
            }`}
          >
            Competitor Benchmarking
          </button>
        </div>

        {tab === "feedback" && (
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {sources.map((s) => (
                <button
                  key={s}
                  onClick={() => setSourceType(s)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                    sourceType === s
                      ? "bg-accent/20 text-accent border-accent/40"
                      : "bg-card text-muted border-border hover:border-accent/30"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <textarea
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="Paste user reviews here, one per line..."
              rows={8}
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text text-sm focus:outline-none focus:border-accent resize-none mb-4"
            />

            <button
              onClick={handleAnalyze}
              disabled={analyzing || !rawInput.trim()}
              className="px-6 py-2.5 bg-accent text-white text-sm font-medium rounded-lg hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all disabled:opacity-50 mb-6"
            >
              {analyzing ? "Analyzing..." : "Analyze Feedback"}
            </button>

            {status && (
              <div className="bg-card border border-border rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                  <p className="text-text text-sm">{status.message}</p>
                </div>
              </div>
            )}

            {themes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-text">
                    Extracted Themes ({themes.length})
                  </h2>
                  {analysisId && (
                    <div className="flex gap-3">
                      <a
                        href={getExportUrl(analysisId, "csv")}
                        className="text-accent text-xs font-medium hover:underline"
                      >
                        Export CSV
                      </a>
                      <a
                        href={getExportUrl(analysisId, "markdown")}
                        className="text-accent text-xs font-medium hover:underline"
                      >
                        Export Markdown
                      </a>
                    </div>
                  )}
                </div>
                {themes.map(renderThemeCard)}
              </div>
            )}
          </div>
        )}

        {tab === "competitor" && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <label className="text-sm text-muted block mb-2">
                  Your Product Reviews
                </label>
                <textarea
                  value={ownReviews}
                  onChange={(e) => setOwnReviews(e.target.value)}
                  placeholder="Paste your product reviews here..."
                  rows={8}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text text-sm focus:outline-none focus:border-accent resize-none"
                />
              </div>
              <div>
                <label className="text-sm text-muted block mb-2">
                  Competitor Reviews
                </label>
                <textarea
                  value={competitorReviews}
                  onChange={(e) => setCompetitorReviews(e.target.value)}
                  placeholder="Paste competitor reviews here..."
                  rows={8}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text text-sm focus:outline-none focus:border-accent resize-none"
                />
              </div>
            </div>

            <button
              onClick={handleCompetitor}
              disabled={
                compAnalyzing || !ownReviews.trim() || !competitorReviews.trim()
              }
              className="px-6 py-2.5 bg-accent text-white text-sm font-medium rounded-lg hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all disabled:opacity-50 mb-6"
            >
              {compAnalyzing ? "Comparing..." : "Compare Products"}
            </button>

            {compStatus && (
              <div className="bg-card border border-border rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                  <p className="text-text text-sm">{compStatus.message}</p>
                </div>
              </div>
            )}

            {compSummary && (
              <div className="bg-card border border-accent/30 rounded-xl p-4 mb-6">
                <p className="text-text text-sm">{compSummary}</p>
              </div>
            )}

            {compThemes.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-green-400 font-semibold text-sm mb-4 uppercase tracking-wider">
                    Your Strengths
                  </h3>
                  {compThemes
                    .filter((t) => t.source === "own")
                    .map(renderThemeCard)}
                </div>
                <div>
                  <h3 className="text-red-400 font-semibold text-sm mb-4 uppercase tracking-wider">
                    Competitor Strengths
                  </h3>
                  {compThemes
                    .filter((t) => t.source === "competitor")
                    .map(renderThemeCard)}
                </div>
                <div>
                  <h3 className="text-yellow-400 font-semibold text-sm mb-4 uppercase tracking-wider">
                    Shared Pain Points
                  </h3>
                  {compThemes
                    .filter((t) => t.source === "shared")
                    .map(renderThemeCard)}
                </div>
              </div>
            )}

            {compAnalysisId && (
              <div className="flex gap-3 mt-6">
                <a
                  href={getExportUrl(compAnalysisId, "csv")}
                  className="text-accent text-xs font-medium hover:underline"
                >
                  Export CSV
                </a>
                <a
                  href={getExportUrl(compAnalysisId, "markdown")}
                  className="text-accent text-xs font-medium hover:underline"
                >
                  Export Markdown
                </a>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
