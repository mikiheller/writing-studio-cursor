"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, MessageCircle, MessagesSquare, FileText, BookOpen } from "lucide-react";
import { ProjectFormat } from "@/lib/types";

const formats: { value: ProjectFormat; label: string; description: string; icon: typeof MessageCircle }[] = [
  { value: "tweet", label: "Tweet", description: "A single, punchy thought", icon: MessageCircle },
  { value: "thread", label: "Thread", description: "A series of connected tweets", icon: MessagesSquare },
  { value: "short-post", label: "Short Post", description: "A quick blog post or essay", icon: FileText },
  { value: "long-post", label: "Long Post", description: "An in-depth article or story", icon: BookOpen },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (title: string, format: ProjectFormat, summary: string) => void;
}

export default function NewProjectModal({ open, onClose, onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [format, setFormat] = useState<ProjectFormat>("short-post");
  const [summary, setSummary] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!open || !mounted) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate(title.trim(), format, summary.trim());
    setTitle("");
    setFormat("short-post");
    setSummary("");
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-semibold text-stone-900">New piece</h2>
        <p className="mt-1 text-sm text-stone-500">What do you want to write?</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-stone-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Why GLP-1s are the diet of honesty"
              className="mt-1.5 w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700">Format</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {formats.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFormat(f.value)}
                  className={`flex items-center gap-3 rounded-lg border-2 px-3.5 py-3 text-left transition-all ${
                    format === f.value
                      ? "border-violet-500 bg-violet-50"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <f.icon className={`h-5 w-5 ${format === f.value ? "text-violet-600" : "text-stone-400"}`} />
                  <div>
                    <div className={`text-sm font-medium ${format === f.value ? "text-violet-700" : "text-stone-700"}`}>
                      {f.label}
                    </div>
                    <div className="text-xs text-stone-500">{f.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700">
              Quick notes <span className="font-normal text-stone-400">(optional)</span>
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Jot down your initial idea, angle, or key points..."
              rows={3}
              className="mt-1.5 w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
