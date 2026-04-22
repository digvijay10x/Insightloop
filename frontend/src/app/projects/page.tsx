"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProjects, createProject, deleteProject } from "@/lib/api";

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const loadProjects = () => {
    getProjects().then(setProjects).catch(console.error);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await createProject(name, description);
      setName("");
      setDescription("");
      setShowModal(false);
      loadProjects();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id);
      loadProjects();
    } catch (e) {
      console.error(e);
    }
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
          className="text-sm text-accent font-medium px-3 py-2 bg-accent/10 rounded-lg"
        >
          Projects
        </Link>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-text">Projects</h1>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all"
          >
            New Project
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-10 text-center">
            <p className="text-muted">
              No projects yet. Click "New Project" to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => (
              <div
                key={p.id}
                className="bg-card border border-border rounded-xl p-6 flex flex-col"
              >
                <Link href={`/projects/${p.id}/analyze`} className="flex-1">
                  <h3 className="text-text font-semibold mb-2">{p.name}</h3>
                  <p className="text-muted text-sm line-clamp-2">
                    {p.description}
                  </p>
                </Link>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <p className="text-muted text-xs">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex gap-3">
                    <Link
                      href={`/projects/${p.id}/analyze`}
                      className="text-accent text-xs font-medium hover:underline"
                    >
                      Analyze
                    </Link>
                    <Link
                      href={`/projects/${p.id}/history`}
                      className="text-muted text-xs font-medium hover:text-text"
                    >
                      History
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-red-500 text-xs font-medium hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-card border border-border rounded-xl p-8 w-full max-w-md">
              <h2 className="text-xl font-bold text-text mb-6">
                Create New Project
              </h2>
              <div className="mb-4">
                <label className="text-sm text-muted block mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mobile App Feedback"
                  className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text text-sm focus:outline-none focus:border-accent"
                />
              </div>
              <div className="mb-6">
                <label className="text-sm text-muted block mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the project..."
                  rows={3}
                  className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text text-sm focus:outline-none focus:border-accent resize-none"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-muted text-sm hover:text-text transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={loading || !name.trim()}
                  className="px-5 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
