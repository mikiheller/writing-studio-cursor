"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Project, ProjectFormat, ProjectStatus, STATUS_LABELS } from "@/lib/types";
import { getProjects, saveProject, deleteProject } from "@/lib/store";
import ProjectCard from "@/components/ProjectCard";
import NewProjectModal from "@/components/NewProjectModal";

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  function handleCreate(title: string, format: ProjectFormat, summary: string) {
    const now = new Date().toISOString();
    const project: Project = {
      id: uuidv4(),
      title,
      summary,
      format,
      status: "idea",
      content: "",
      tags: [],
      createdAt: now,
      updatedAt: now,
    };
    saveProject(project);
    setProjects(getProjects());
    setModalOpen(false);
  }

  const filtered = projects
    .filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.summary.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const statusCounts = projects.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-5xl px-8 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Your Library</h1>
          <p className="mt-1 text-sm text-stone-500">
            {projects.length === 0
              ? "Start by creating your first piece"
              : `${projects.length} piece${projects.length === 1 ? "" : "s"} in your library`}
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-violet-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New piece
        </button>
      </div>

      {projects.length > 0 && (
        <div className="mt-6 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your pieces..."
              className="w-full rounded-lg border border-stone-200 bg-white py-2.5 pl-10 pr-4 text-sm text-stone-900 placeholder:text-stone-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-stone-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | "all")}
              className="rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-600 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            >
              <option value="all">All statuses</option>
              {(Object.entries(STATUS_LABELS) as [ProjectStatus, string][]).map(([value, label]) => (
                <option key={value} value={value}>
                  {label} {statusCounts[value] ? `(${statusCounts[value]})` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {filtered.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={(id) => {
                deleteProject(id);
                setProjects(getProjects());
              }}
            />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100">
            <Plus className="h-8 w-8 text-violet-600" />
          </div>
          <h3 className="mt-5 text-lg font-semibold text-stone-900">No pieces yet</h3>
          <p className="mt-2 max-w-sm text-sm text-stone-500">
            Create your first piece to get started. It can be a tweet, a blog post, a short story — whatever&apos;s on your mind.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-6 flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create your first piece
          </button>
        </div>
      ) : (
        <div className="mt-16 text-center">
          <p className="text-sm text-stone-500">No pieces match your filters</p>
        </div>
      )}

      <NewProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
