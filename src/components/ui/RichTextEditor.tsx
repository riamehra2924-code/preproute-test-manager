import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
}

export function RichTextEditor({ value, onChange, label, error }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        allowBase64: true,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  const addImage = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div>
      {label && <label className="block text-sm font-medium text-ink-700 mb-1.5">{label}</label>}
      <div className="border border-ink-200 rounded-lg overflow-hidden">
        <div className="flex flex-wrap gap-1 bg-ink-50 p-2 border-b border-ink-200">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={`p-2 rounded text-sm font-medium transition ${
              editor.isActive("bold") ? "bg-brand-500 text-white" : "bg-white text-ink-700 hover:bg-ink-100"
            }`}
            title="Bold (Ctrl+B)"
            type="button"
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={`p-2 rounded text-sm font-medium transition ${
              editor.isActive("italic") ? "bg-brand-500 text-white" : "bg-white text-ink-700 hover:bg-ink-100"
            }`}
            title="Italic (Ctrl+I)"
            type="button"
          >
            <em>I</em>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            disabled={!editor.can().chain().focus().toggleCode().run()}
            className={`p-2 rounded text-sm font-medium font-mono transition ${
              editor.isActive("code") ? "bg-brand-500 text-white" : "bg-white text-ink-700 hover:bg-ink-100"
            }`}
            title="Code"
            type="button"
          >
            &lt;/&gt;
          </button>
          <div className="w-px bg-ink-200" />
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded text-sm transition ${
              editor.isActive("bulletList") ? "bg-brand-500 text-white" : "bg-white text-ink-700 hover:bg-ink-100"
            }`}
            title="Bullet List"
            type="button"
          >
            • List
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded text-sm transition ${
              editor.isActive("orderedList") ? "bg-brand-500 text-white" : "bg-white text-ink-700 hover:bg-ink-100"
            }`}
            title="Ordered List"
            type="button"
          >
            1. List
          </button>
          <div className="w-px bg-ink-200" />
          <button
            onClick={addImage}
            className="p-2 rounded text-sm bg-white text-ink-700 hover:bg-ink-100 transition"
            title="Insert Image"
            type="button"
          >
            🖼️ Image
          </button>
        </div>
        <EditorContent
          editor={editor}
          className={`prose prose-sm max-w-none p-3 min-h-[120px] focus:outline-none ${error ? "border-danger-500" : ""}`}
        />
      </div>
      {error && <p className="text-sm text-danger-500 mt-1">{error}</p>}
    </div>
  );
}