"use client";

import { useState } from "react";
import { History, X, RotateCcw, Eye, Pencil, Check } from "lucide-react";
import { Version } from "@/lib/types";

interface VersionPanelProps {
  open: boolean;
  onClose: () => void;
  versions: Version[];
  onRestore: (version: Version) => void;
  onPreview: (version: Version | null) => void;
  onRenameVersion: (versionId: string, name: string) => void;
  previewingId: string | null;
}

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
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

export default function VersionPanel({
  open,
  onClose,
  versions,
  onRestore,
  onPreview,
  onRenameVersion,
  previewingId,
}: VersionPanelProps) {
  if (!open) return null;

  return (
    <div className="flex h-full w-80 flex-col border-l border-stone-200 bg-white">
      <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-stone-500" />
          <h3 className="text-sm font-semibold text-stone-700">
            Version History
          </h3>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {versions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <History className="h-8 w-8 text-stone-300" />
            <p className="mt-3 text-sm font-medium text-stone-500">
              No versions yet
            </p>
            <p className="mt-1 text-xs text-stone-400">
              Versions are saved each time you press Cmd+S or click Save.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {versions.map((version, index) => (
              <VersionItem
                key={version.id}
                version={version}
                isLatest={index === 0}
                isPreviewing={previewingId === version.id}
                onRestore={() => onRestore(version)}
                onPreview={() =>
                  onPreview(previewingId === version.id ? null : version)
                }
                onRename={(name) => onRenameVersion(version.id, name)}
              />
            ))}
          </div>
        )}
      </div>

      {previewingId && (
        <div className="border-t border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-medium text-amber-700">
            Previewing old version
          </p>
          <p className="mt-0.5 text-xs text-amber-600">
            Click &ldquo;Restore&rdquo; to use it, or close the preview to go back to
            your current draft.
          </p>
        </div>
      )}
    </div>
  );
}

function VersionItem({
  version,
  isLatest,
  isPreviewing,
  onRestore,
  onPreview,
  onRename,
}: {
  version: Version;
  isLatest: boolean;
  isPreviewing: boolean;
  onRestore: () => void;
  onPreview: () => void;
  onRename: (name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(version.name);

  const preview = stripHtml(version.content).slice(0, 120);

  function handleSaveName() {
    if (editName.trim()) {
      onRename(editName.trim());
    }
    setEditing(false);
  }

  return (
    <div
      className={`group px-4 py-3 transition-colors ${
        isPreviewing ? "bg-amber-50" : "hover:bg-stone-50"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName();
                  if (e.key === "Escape") setEditing(false);
                }}
                className="w-full rounded border border-stone-300 px-2 py-0.5 text-xs text-stone-800 focus:border-violet-500 focus:outline-none"
                autoFocus
              />
              <button
                onClick={handleSaveName}
                className="rounded p-0.5 text-emerald-600 hover:bg-emerald-50"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-stone-800 truncate">
                {version.name}
              </span>
              {isLatest && (
                <span className="shrink-0 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                  Latest
                </span>
              )}
              <button
                onClick={() => {
                  setEditName(version.name);
                  setEditing(true);
                }}
                className="shrink-0 rounded p-0.5 text-stone-300 opacity-0 group-hover:opacity-100 hover:text-stone-500"
                title="Rename version"
              >
                <Pencil className="h-3 w-3" />
              </button>
            </div>
          )}
          <p className="mt-0.5 text-xs text-stone-400">
            {timeAgo(version.createdAt)}
          </p>
        </div>
      </div>

      {preview && (
        <p className="mt-1.5 text-xs text-stone-400 line-clamp-2">{preview}</p>
      )}

      <div className="mt-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onPreview}
          className={`flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition-colors ${
            isPreviewing
              ? "bg-amber-100 text-amber-700"
              : "text-stone-500 hover:bg-stone-100 hover:text-stone-700"
          }`}
        >
          <Eye className="h-3 w-3" />
          {isPreviewing ? "Viewing" : "Preview"}
        </button>
        {!isLatest && (
          <button
            onClick={onRestore}
            className="flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium text-stone-500 hover:bg-violet-50 hover:text-violet-600 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Restore
          </button>
        )}
      </div>
    </div>
  );
}
