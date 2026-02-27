"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { ArrowLeft, Save, ChevronDown, History } from "lucide-react";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import {
  Project,
  Version,
  FORMAT_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
  ProjectStatus,
  ChatThread,
  ChatMessage,
} from "@/lib/types";
import {
  getProject,
  saveProject,
  getProjectChatThreads,
  saveChatThread,
  getVoiceProfile,
  getProjectVersions,
  saveVersion,
  getVersions,
} from "@/lib/store";
import Editor, { EditorHandle } from "@/components/Editor";
import ChatPanel from "@/components/ChatPanel";
import VersionPanel from "@/components/VersionPanel";

const statuses: ProjectStatus[] = [
  "idea",
  "drafting",
  "editing",
  "ready",
  "published",
];

export default function WritePage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(true);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const editorRef = useRef<EditorHandle>(null);

  const [versions, setVersions] = useState<Version[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [previewingVersionId, setPreviewingVersionId] = useState<string | null>(null);
  const [contentBeforePreview, setContentBeforePreview] = useState<string | null>(null);

  useEffect(() => {
    const p = getProject(params.id as string);
    if (!p) {
      router.push("/");
      return;
    }
    setProject(p);
    setContent(p.content);

    const projectThreads = getProjectChatThreads(p.id);
    setThreads(projectThreads);
    if (projectThreads.length > 0) {
      setActiveThreadId(projectThreads[0].id);
    }

    setVersions(getProjectVersions(p.id));
  }, [params.id, router]);

  const handleSave = useCallback(() => {
    if (!project) return;

    if (previewingVersionId) return;

    const updated = {
      ...project,
      content,
      updatedAt: new Date().toISOString(),
    };
    saveProject(updated);
    setProject(updated);
    setSaved(true);

    const versionCount = getProjectVersions(project.id).length;
    const version: Version = {
      id: uuidv4(),
      projectId: project.id,
      content,
      name: `Version ${versionCount + 1}`,
      createdAt: new Date().toISOString(),
    };
    saveVersion(version);
    setVersions(getProjectVersions(project.id));
  }, [project, content, previewingVersionId]);

  useEffect(() => {
    if (!project) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave, project]);

  function handleContentUpdate(html: string) {
    setContent(html);
    setSaved(false);
    if (project && project.status === "idea") {
      const updated = {
        ...project,
        status: "drafting" as ProjectStatus,
        updatedAt: new Date().toISOString(),
      };
      saveProject(updated);
      setProject(updated);
    }
  }

  function handleStatusChange(status: ProjectStatus) {
    if (!project) return;
    const updated = { ...project, status, updatedAt: new Date().toISOString() };
    saveProject(updated);
    setProject(updated);
  }

  function handlePreviewVersion(version: Version | null) {
    if (version) {
      if (!previewingVersionId) {
        setContentBeforePreview(content);
      }
      setPreviewingVersionId(version.id);
      setContent(version.content);
    } else {
      if (contentBeforePreview !== null) {
        setContent(contentBeforePreview);
      }
      setPreviewingVersionId(null);
      setContentBeforePreview(null);
    }
  }

  function handleRestoreVersion(version: Version) {
    if (!project) return;
    setContent(version.content);
    setPreviewingVersionId(null);
    setContentBeforePreview(null);
    setSaved(false);
  }

  function handleRenameVersion(versionId: string, name: string) {
    const allVersions = getVersions();
    const idx = allVersions.findIndex((v) => v.id === versionId);
    if (idx >= 0) {
      allVersions[idx] = { ...allVersions[idx], name };
      localStorage.setItem("writing-studio-versions", JSON.stringify(allVersions));
      if (project) {
        setVersions(getProjectVersions(project.id));
      }
    }
  }

  function createThread(name?: string) {
    if (!project) return;
    const thread: ChatThread = {
      id: uuidv4(),
      projectId: project.id,
      name: name || `Chat ${threads.length + 1}`,
      messages: [],
      createdAt: new Date().toISOString(),
    };
    saveChatThread(thread);
    const updated = [...threads, thread];
    setThreads(updated);
    setActiveThreadId(thread.id);
  }

  async function handleSendMessage(message: string) {
    if (!project) return;

    let thread = threads.find((t) => t.id === activeThreadId);
    if (!thread) {
      const newThread: ChatThread = {
        id: uuidv4(),
        projectId: project.id,
        name: "Chat 1",
        messages: [],
        createdAt: new Date().toISOString(),
      };
      saveChatThread(newThread);
      setThreads((prev) => [...prev, newThread]);
      setActiveThreadId(newThread.id);
      thread = newThread;
    }

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: "user",
      content: message,
      createdAt: new Date().toISOString(),
    };

    const updatedThread = {
      ...thread,
      messages: [...thread.messages, userMessage],
    };
    saveChatThread(updatedThread);
    setThreads((prev) =>
      prev.map((t) => (t.id === updatedThread.id ? updatedThread : t))
    );

    setChatLoading(true);

    try {
      const voiceProfile = getVoiceProfile();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedThread.messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          draftContent: content,
          projectFormat: project.format,
          projectTitle: project.title,
          voiceProfile,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const aiMessage: ChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: data.content,
        createdAt: new Date().toISOString(),
      };
      const withReply = {
        ...updatedThread,
        messages: [...updatedThread.messages, aiMessage],
      };
      saveChatThread(withReply);
      setThreads((prev) =>
        prev.map((t) => (t.id === withReply.id ? withReply : t))
      );
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: `Sorry, something went wrong: ${error instanceof Error ? error.message : "Unknown error"}`,
        createdAt: new Date().toISOString(),
      };
      const withError = {
        ...updatedThread,
        messages: [...updatedThread.messages, errorMessage],
      };
      saveChatThread(withError);
      setThreads((prev) =>
        prev.map((t) => (t.id === withError.id ? withError : t))
      );
    } finally {
      setChatLoading(false);
    }
  }

  if (!project) return null;

  const activeThread = threads.find((t) => t.id === activeThreadId) || null;

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-2.5">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-stone-500 hover:bg-stone-100 hover:text-stone-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Library
          </Link>
          <div className="h-5 w-px bg-stone-200" />
          <div>
            <h2 className="text-sm font-semibold text-stone-900">
              {project.title}
            </h2>
            <span className="text-xs text-stone-400">
              {FORMAT_LABELS[project.format]}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (previewingVersionId) {
                handlePreviewVersion(null);
              }
              setShowVersions(!showVersions);
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              showVersions
                ? "bg-stone-100 text-stone-700"
                : "text-stone-400 hover:bg-stone-100 hover:text-stone-600"
            }`}
            title="Version history"
          >
            <History className="h-3.5 w-3.5" />
            History
            {versions.length > 0 && (
              <span className="text-xs text-stone-400">({versions.length})</span>
            )}
          </button>
          <div className="h-5 w-px bg-stone-200" />
          <div className="relative">
            <select
              value={project.status}
              onChange={(e) =>
                handleStatusChange(e.target.value as ProjectStatus)
              }
              className={`appearance-none rounded-full py-1 pl-3 pr-7 text-xs font-medium ${STATUS_COLORS[project.status]} border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500/20`}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 opacity-50" />
          </div>
          <button
            onClick={handleSave}
            disabled={!!previewingVersionId}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              previewingVersionId
                ? "text-stone-300 cursor-not-allowed"
                : saved
                  ? "text-stone-400"
                  : "bg-violet-600 text-white hover:bg-violet-700"
            }`}
          >
            <Save className="h-3.5 w-3.5" />
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      {/* Preview banner */}
      {previewingVersionId && (
        <div className="flex items-center justify-between bg-amber-50 border-b border-amber-200 px-4 py-2">
          <p className="text-sm text-amber-700">
            Previewing an older version — your current draft is safe.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const version = versions.find((v) => v.id === previewingVersionId);
                if (version) handleRestoreVersion(version);
              }}
              className="rounded-lg bg-violet-600 px-3 py-1 text-xs font-medium text-white hover:bg-violet-700"
            >
              Restore this version
            </button>
            <button
              onClick={() => handlePreviewVersion(null)}
              className="rounded-lg px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100"
            >
              Back to current
            </button>
          </div>
        </div>
      )}

      {/* Main workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          <Editor
            ref={editorRef}
            content={content}
            onUpdate={handleContentUpdate}
            placeholder={
              project.format === "tweet"
                ? "What's on your mind?"
                : "Start writing..."
            }
          />
        </div>

        {/* Version History Panel */}
        {showVersions && (
          <VersionPanel
            open={showVersions}
            onClose={() => {
              if (previewingVersionId) {
                handlePreviewVersion(null);
              }
              setShowVersions(false);
            }}
            versions={versions}
            onRestore={handleRestoreVersion}
            onPreview={handlePreviewVersion}
            onRenameVersion={handleRenameVersion}
            previewingId={previewingVersionId}
          />
        )}

        {/* AI Chat Panel */}
        <div className="w-[380px] shrink-0">
          <ChatPanel
            threads={threads}
            activeThread={activeThread}
            onSendMessage={handleSendMessage}
            onNewThread={createThread}
            onSelectThread={setActiveThreadId}
            onInsertToEditor={(text) => {
              editorRef.current?.insertAtEnd(text);
              setSaved(false);
            }}
            onReplaceEditor={(text) => {
              editorRef.current?.replaceAll(text);
              setSaved(false);
            }}
            isLoading={chatLoading}
          />
        </div>
      </div>
    </div>
  );
}
