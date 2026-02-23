"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { Project, FORMAT_LABELS, STATUS_LABELS, STATUS_COLORS, ProjectStatus } from "@/lib/types";
import { getProject, saveProject } from "@/lib/store";

const statuses: ProjectStatus[] = ["idea", "drafting", "editing", "ready", "published"];

export default function WritePage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    const p = getProject(params.id as string);
    if (!p) {
      router.push("/");
      return;
    }
    setProject(p);
    setContent(p.content);
  }, [params.id, router]);

  function handleSave() {
    if (!project) return;
    const updated = { ...project, content, updatedAt: new Date().toISOString() };
    saveProject(updated);
    setProject(updated);
    setSaved(true);
  }

  function handleStatusChange(status: ProjectStatus) {
    if (!project) return;
    const updated = { ...project, status, updatedAt: new Date().toISOString() };
    saveProject(updated);
    setProject(updated);
  }

  if (!project) return null;

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-stone-200 bg-white px-6 py-3">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-stone-500 hover:bg-stone-100 hover:text-stone-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Library
          </Link>
          <div className="h-5 w-px bg-stone-200" />
          <h2 className="text-sm font-semibold text-stone-900">{project.title}</h2>
          <span className="text-xs text-stone-400">{FORMAT_LABELS[project.format]}</span>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={project.status}
            onChange={(e) => handleStatusChange(e.target.value as ProjectStatus)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[project.status]} border-none focus:outline-none focus:ring-2 focus:ring-violet-500/20`}
          >
            {statuses.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              saved
                ? "text-stone-400"
                : "bg-violet-600 text-white hover:bg-violet-700"
            }`}
          >
            <Save className="h-3.5 w-3.5" />
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      {/* Main workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor */}
        <div className="flex-1 overflow-y-auto bg-white p-8">
          <div className="mx-auto max-w-2xl">
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setSaved(false);
              }}
              placeholder="Start writing..."
              className="min-h-[calc(100vh-200px)] w-full resize-none border-none text-base leading-relaxed text-stone-800 placeholder:text-stone-300 focus:outline-none"
            />
          </div>
        </div>

        {/* AI Chat Panel placeholder */}
        <div className="w-96 border-l border-stone-200 bg-stone-50 flex flex-col">
          <div className="border-b border-stone-200 px-4 py-3">
            <h3 className="text-sm font-semibold text-stone-700">AI Assistant</h3>
            <p className="text-xs text-stone-400">Ask for help with your writing</p>
          </div>
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100">
                <span className="text-xl">✨</span>
              </div>
              <p className="mt-3 text-sm font-medium text-stone-600">AI chat coming soon</p>
              <p className="mt-1 text-xs text-stone-400">
                This panel will let you brainstorm, rewrite, and refine your piece with AI.
              </p>
            </div>
          </div>
          <div className="border-t border-stone-200 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask the AI for help..."
                disabled
                className="flex-1 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm placeholder:text-stone-400 disabled:opacity-50"
              />
              <button
                disabled
                className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
