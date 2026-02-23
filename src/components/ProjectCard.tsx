"use client";

import Link from "next/link";
import {
  MessageCircle,
  MessagesSquare,
  FileText,
  BookOpen,
  Clock,
} from "lucide-react";
import {
  Project,
  FORMAT_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
  ProjectFormat,
} from "@/lib/types";

const formatIcons: Record<ProjectFormat, typeof MessageCircle> = {
  tweet: MessageCircle,
  thread: MessagesSquare,
  "short-post": FileText,
  "long-post": BookOpen,
};

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ProjectCard({ project }: { project: Project }) {
  const Icon = formatIcons[project.format];

  return (
    <Link href={`/write/${project.id}`}>
      <div className="group rounded-xl border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-md">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 text-stone-500 group-hover:bg-violet-50 group-hover:text-violet-600 transition-colors">
              <Icon className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium text-stone-400">
              {FORMAT_LABELS[project.format]}
            </span>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[project.status]}`}
          >
            {STATUS_LABELS[project.status]}
          </span>
        </div>

        <h3 className="mt-3 text-base font-semibold text-stone-900 group-hover:text-violet-700 transition-colors">
          {project.title}
        </h3>

        {project.summary && (
          <p className="mt-1.5 text-sm text-stone-500 line-clamp-2">
            {project.summary}
          </p>
        )}

        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-stone-400">
            <Clock className="h-3.5 w-3.5" />
            {timeAgo(project.updatedAt)}
          </div>
          {project.tags.length > 0 && (
            <div className="flex gap-1.5">
              {project.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-stone-100 px-2 py-0.5 text-xs text-stone-500"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
