import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';
import './RichTextEditor.css';

const RichTextEditor = ({
  label,
  value = '',
  onChange,
  placeholder = 'Commencez à écrire...',
  helperText,
  error,
  className = '',
}) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none min-h-[150px] px-3 py-2',
      },
    },
  });

  // Update editor content when value changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const MenuButton = ({ onClick, isActive, children, title }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
        isActive
          ? 'bg-blue-100 text-blue-700'
          : 'hover:bg-gray-100 text-gray-700'
      }`}
      title={title}
    >
      {children}
    </button>
  );

  if (!editor) {
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-baie-navy)' }}>
          {label}
        </label>
      )}

      <div
        className={`border rounded-md overflow-hidden ${
          error ? 'border-red-500' : 'border-gray-300 focus-within:border-blue-500'
        }`}
      >
        {/* Toolbar */}
        <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-200">
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Gras"
          >
            <strong>G</strong>
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italique"
          >
            <em>I</em>
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Barré"
          >
            <s>S</s>
          </MenuButton>

          <div className="w-px bg-gray-300 mx-1" />

          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Titre 2"
          >
            H2
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="Titre 3"
          >
            H3
          </MenuButton>

          <div className="w-px bg-gray-300 mx-1" />

          <MenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Liste à puces"
          >
            •••
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Liste numérotée"
          >
            123
          </MenuButton>

          <div className="w-px bg-gray-300 mx-1" />

          <MenuButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Citation"
          >
            " "
          </MenuButton>

          <div className="w-px bg-gray-300 mx-1" />

          <MenuButton
            onClick={() => editor.chain().focus().undo().run()}
            isActive={false}
            title="Annuler"
          >
            ↶
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().redo().run()}
            isActive={false}
            title="Refaire"
          >
            ↷
          </MenuButton>
        </div>

        {/* Editor */}
        <div className="bg-white">
          <EditorContent editor={editor} />
          {!value && placeholder && (
            <div className="text-gray-400 text-sm px-3 py-2 pointer-events-none absolute">
              {placeholder}
            </div>
          )}
        </div>
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default RichTextEditor;
