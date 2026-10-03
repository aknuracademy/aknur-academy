"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function RichTextEditor({
  value,
  onChange,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
  StarterKit,
  Link.configure({
    openOnClick: false,
    autolink: true,
    linkOnPaste: true,
    HTMLAttributes: {
      target: "_blank",
      rel: "noopener noreferrer",
      class: "text-blue-600 underline",
    },
  }),
],

    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;

    const currentHtml = editor.getHTML();

    if (currentHtml !== value) {
      editor.commands.setContent(value || "<p></p>");
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-300 bg-white">
      <div className="flex flex-wrap gap-2 border-b bg-gray-50 p-3">
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleBold().run()
          }
          className={`rounded-md px-3 py-1.5 text-sm ${
            editor.isActive("bold")
              ? "bg-gray-900 text-white"
              : "bg-white"
          }`}
        >
          B
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleItalic().run()
          }
          className={`rounded-md px-3 py-1.5 text-sm italic ${
            editor.isActive("italic")
              ? "bg-gray-900 text-white"
              : "bg-white"
          }`}
        >
          I
        </button>

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({ level: 2 })
              .run()
          }
          className={`rounded-md px-3 py-1.5 text-sm ${
            editor.isActive("heading", { level: 2 })
              ? "bg-gray-900 text-white"
              : "bg-white"
          }`}
        >
          H2
        </button>

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({ level: 3 })
              .run()
          }
          className={`rounded-md px-3 py-1.5 text-sm ${
            editor.isActive("heading", { level: 3 })
              ? "bg-gray-900 text-white"
              : "bg-white"
          }`}
        >
          H3
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleBulletList().run()
          }
          className={`rounded-md px-3 py-1.5 text-sm ${
            editor.isActive("bulletList")
              ? "bg-gray-900 text-white"
              : "bg-white"
          }`}
        >
          • Тізім
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleOrderedList().run()
          }
          className={`rounded-md px-3 py-1.5 text-sm ${
            editor.isActive("orderedList")
              ? "bg-gray-900 text-white"
              : "bg-white"
          }`}
        >
          1. Тізім
        </button>

        <button
  type="button"
  onClick={() => {
    const previousUrl =
      editor.getAttributes("link").href || "";

    const url = window.prompt(
      "Сілтемені енгізіңіз:",
      previousUrl
    );

    if (url === null) {
      return;
    }

    if (!url.trim()) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .unsetLink()
        .run();

      return;
    }

    const finalUrl =
      url.startsWith("http://") ||
      url.startsWith("https://")
        ? url
        : `https://${url}`;

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: finalUrl })
      .run();
  }}
  className={`rounded-md px-3 py-1.5 text-sm ${
    editor.isActive("link")
      ? "bg-gray-900 text-white"
      : "bg-white"
  }`}
>
  🔗 Сілтеме
</button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().undo().run()
          }
          className="rounded-md bg-white px-3 py-1.5 text-sm"
        >
          ↶
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().redo().run()
          }
          className="rounded-md bg-white px-3 py-1.5 text-sm"
        >
          ↷
        </button>
      </div>

      <EditorContent
        editor={editor}
        className="min-h-[220px] p-4 [&_.ProseMirror]:min-h-[220px] [&_.ProseMirror]:outline-none"
      />
    </div>
  );
}