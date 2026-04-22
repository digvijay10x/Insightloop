"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStats, getProjects } from "@/lib/api";

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalAnalyses: 0,
    totalThemes: 0,
  });
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    getStats().then(setStats).catch(console.error);
    getProjects().then(setProjects).catch(console.error);
  }, []);

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Sidebar */}
      <aside className="w-56 border-r border-border p-6 flex flex-col gap-2">
        <Link href="/" className="text-lg font-bold text-text mb-8">
          Insight<span className="text-accent">Loop</span>
        </Link>
        <Link
          href="/dashboard"
          className="text-sm text-accent font-medium px-3 py-2 bg-accent/10 rounded-lg"
        >
          Dashboard
        </Link>
        <Link
          href="/projects"
          className="text-sm text-muted hover:text-text px-3 py-2 rounded-lg transition-colors"
        >
          Projects
        </Link>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-text mb-8">Dashboard</h1>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: "Total Projects", value: stats.totalProjects },
            { label: "Total Analyses", value: stats.totalAnalyses },
            { label: "Themes Extracted", value: stats.totalThemes },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-card border border-border rounded-xl p-6"
            >
              <p className="text-muted text-sm mb-1">{s.label}</p>
              <p className="text-3xl font-bold text-text">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Recent Projects */}
        <h2 className="text-lg font-semibold text-text mb-4">
          Recent Projects
        </h2>
        {projects.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-10 text-center">
            <p className="text-muted mb-4">
              No projects yet. Create your first project to get started.
            </p>
            <Link
              href="/projects"
              className="px-5 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all"
            >
              Create Project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.slice(0, 6).map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}/analyze`}
                className="bg-card border border-border rounded-xl p-6 hover:border-accent/50 transition-colors"
              >
                <h3 className="text-text font-semibold mb-2">{p.name}</h3>
                <p className="text-muted text-sm line-clamp-2">
                  {p.description}
                </p>
                <p className="text-muted text-xs mt-4">
                  {new Date(p.createdAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
