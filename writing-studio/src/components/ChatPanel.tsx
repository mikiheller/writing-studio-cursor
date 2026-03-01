"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  Plus,
  MessageSquare,
  ClipboardCopy,
  ArrowDownToLine,
  Replace,
  Check,
} from "lucide-react";
import { ChatMessage, ChatThread } from "@/lib/types";

interface ChatPanelProps {
  threads: ChatThread[];
  activeThread: ChatThread | null;
  onSendMessage: (message: string) => void;
  onNewThread: (name?: string) => void;
  onSelectThread: (threadId: string) => void;
  onInsertToEditor: (text: string) => void;
  onReplaceEditor: (text: string) => void;
  isLoading?: boolean;
}

export default function ChatPanel({
  threads,
  activeThread,
  onSendMessage,
  onNewThread,
  onSelectThread,
  onInsertToEditor,
  onReplaceEditor,
  isLoading,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [showThreads, setShowThreads] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages]);

  const messages = activeThread?.messages || [];

  return (
    <div className="flex h-full flex-col border-l border-stone-200 bg-stone-50">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-500" />
          <h3 className="text-sm font-semibold text-stone-700">AI Assistant</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowThreads(!showThreads)}
            className="rounded-md p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-600"
            title="Chat threads"
          >
            <MessageSquare className="h-4 w-4" />
          </button>
          <button
            onClick={() => onNewThread()}
            className="rounded-md p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-600"
            title="New thread"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Thread switcher */}
      {showThreads && threads.length > 0 && (
        <div className="border-b border-stone-200 bg-white p-2">
          <div className="space-y-0.5">
            {threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => {
                  onSelectThread(thread.id);
                  setShowThreads(false);
                }}
                className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  activeThread?.id === thread.id
                    ? "bg-violet-50 text-violet-700 font-medium"
                    : "text-stone-600 hover:bg-stone-50"
                }`}
              >
                {thread.name}
                <span className="ml-2 text-xs text-stone-400">
                  ({thread.messages.length} messages)
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100">
              <Sparkles className="h-6 w-6 text-violet-500" />
            </div>
            <p className="mt-3 text-sm font-medium text-stone-600">
              How can I help?
            </p>
            <p className="mt-1 max-w-[220px] text-xs text-stone-400">
              Ask me to brainstorm, rewrite a section, expand on an idea, or
              help with tone and structure.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {[
                "Help me outline this",
                "Make the opening punchier",
                "Brainstorm angles",
                "Check the flow",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                  }}
                  className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-500 hover:border-violet-300 hover:text-violet-600 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onInsert={onInsertToEditor}
                onReplace={onReplaceEditor}
              />
            ))}
            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100">
                  <Sparkles className="h-3.5 w-3.5 text-violet-600" />
                </div>
                <div className="rounded-xl rounded-tl-none bg-white px-4 py-3 shadow-sm border border-stone-100">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-stone-300" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-stone-300" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-stone-300" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-stone-200 bg-white p-3">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                if (input.trim() && !isLoading) {
                  onSendMessage(input.trim());
                  setInput("");
                }
              }
            }}
            placeholder="Ask the AI for help... (⌘+Enter to send)"
            rows={3}
            className="flex-1 rounded-lg border border-stone-200 px-3 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 resize-none leading-relaxed"
          />
          <button
            type="button"
            onClick={() => {
              if (input.trim() && !isLoading) {
                onSendMessage(input.trim());
                setInput("");
              }
            }}
            disabled={!input.trim() || isLoading}
            className="self-end rounded-lg bg-violet-600 px-3 py-2.5 text-white hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1.5 text-[11px] text-stone-400">⌘+Enter to send</p>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  onInsert,
  onReplace,
}: {
  message: ChatMessage;
  onInsert: (text: string) => void;
  onReplace: (text: string) => void;
}) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={`group flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          isUser ? "bg-stone-200" : "bg-violet-100"
        }`}
      >
        {isUser ? (
          <span className="text-xs font-medium text-stone-600">You</span>
        ) : (
          <Sparkles className="h-3.5 w-3.5 text-violet-600" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={`rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? "rounded-tr-none bg-violet-600 text-white ml-8"
              : "rounded-tl-none bg-white text-stone-700 shadow-sm border border-stone-100"
          }`}
        >
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>

        {!isUser && (
          <div className="mt-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onInsert(message.content)}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-stone-500 hover:bg-violet-50 hover:text-violet-600 transition-colors"
              title="Append this text to the end of your draft"
            >
              <ArrowDownToLine className="h-3 w-3" />
              Insert into draft
            </button>
            <button
              onClick={() => onReplace(message.content)}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-stone-500 hover:bg-amber-50 hover:text-amber-600 transition-colors"
              title="Replace your entire draft with this text"
            >
              <Replace className="h-3 w-3" />
              Replace draft
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-stone-500 hover:bg-stone-100 hover:text-stone-600 transition-colors"
              title="Copy to clipboard"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <ClipboardCopy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
