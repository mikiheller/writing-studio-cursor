"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo,
  Redo,
} from "lucide-react";

interface EditorProps {
  content: string;
  onUpdate: (content: string) => void;
  placeholder?: string;
  format?: "tweet" | "thread" | "short-post" | "long-post";
}

export interface EditorHandle {
  insertAtEnd: (text: string) => void;
  replaceAll: (text: string) => void;
}

const FORMAT_GUIDANCE: Record<string, { charLimit?: number; wordTarget?: string; label: string }> = {
  tweet: { charLimit: 280, label: "Tweet" },
  thread: { wordTarget: "100-200 per tweet", label: "Thread" },
  "short-post": { wordTarget: "300-800", label: "Short Post" },
  "long-post": { wordTarget: "1000+", label: "Long Post" },
};

const Editor = forwardRef<EditorHandle, EditorProps>(
  function Editor({ content, onUpdate, placeholder, format }, ref) {
    const editor = useEditor({
      immediatelyRender: false,
      extensions: [
        StarterKit,
        Placeholder.configure({
          placeholder: placeholder || "Start writing...",
        }),
        CharacterCount,
      ],
      content,
      editorProps: {
        attributes: {
          class:
            "prose prose-stone prose-lg max-w-none focus:outline-none min-h-[calc(100vh-200px)]",
        },
      },
      onUpdate: ({ editor }) => {
        onUpdate(editor.getHTML());
      },
    });

    useEffect(() => {
      if (editor && content !== editor.getHTML()) {
        editor.commands.setContent(content);
      }
    }, [content, editor]);

    useImperativeHandle(ref, () => ({
      insertAtEnd(text: string) {
        if (!editor) return;
        const paragraphs = text.split("\n\n").filter(Boolean);
        const html = paragraphs.map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("");

        editor.chain().focus("end").insertContent("<p></p>" + html).run();
      },
      replaceAll(text: string) {
        if (!editor) return;
        const paragraphs = text.split("\n\n").filter(Boolean);
        const html = paragraphs.map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("");

        editor.commands.setContent(html);
      },
    }), [editor]);

    const ToolbarButton = useCallback(
      ({
        onClick,
        active,
        children,
        title,
      }: {
        onClick: () => void;
        active?: boolean;
        children: React.ReactNode;
        title: string;
      }) => (
        <button
          type="button"
          onClick={onClick}
          title={title}
          className={`rounded-md p-1.5 transition-colors ${
            active
              ? "bg-violet-100 text-violet-700"
              : "text-stone-400 hover:bg-stone-100 hover:text-stone-600"
          }`}
        >
          {children}
        </button>
      ),
      []
    );

    if (!editor) return null;

    const chars = editor.storage.characterCount.characters();
    const words = editor.storage.characterCount.words();

    return (
      <div className="flex h-full flex-col">
        {/* Toolbar */}
        <div className="flex items-center gap-0.5 border-b border-stone-200 bg-white px-4 py-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>

          <div className="mx-1.5 h-5 w-px bg-stone-200" />

          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            active={editor.isActive("heading", { level: 1 })}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            active={editor.isActive("heading", { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>

          <div className="mx-1.5 h-5 w-px bg-stone-200" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Divider"
          >
            <Minus className="h-4 w-4" />
          </ToolbarButton>

          <div className="mx-1.5 h-5 w-px bg-stone-200" />

          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </ToolbarButton>

          <div className="ml-auto flex items-center gap-3 text-xs">
            {format === "tweet" && (
              <span className={chars > 280 ? "font-medium text-red-500" : chars > 250 ? "text-amber-500" : "text-stone-400"}>
                {chars}/280
              </span>
            )}
            {format !== "tweet" && (
              <>
                <span className="text-stone-400">{words} words</span>
                {format && FORMAT_GUIDANCE[format]?.wordTarget && (
                  <span className="text-stone-300">target: {FORMAT_GUIDANCE[format].wordTarget}</span>
                )}
              </>
            )}
            {format === "tweet" && (
              <span className="text-stone-400">{words} words</span>
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-y-auto bg-white px-8 py-6">
          <div className="mx-auto max-w-2xl">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    );
  }
);

export default Editor;
