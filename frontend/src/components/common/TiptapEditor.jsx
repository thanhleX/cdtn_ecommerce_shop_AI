import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Button, Space, Tooltip } from 'antd';
import {
  BoldOutlined, ItalicOutlined, UnderlineOutlined, StrikethroughOutlined,
  AlignLeftOutlined, AlignCenterOutlined, AlignRightOutlined,
  OrderedListOutlined, UnorderedListOutlined, LinkOutlined, PictureOutlined
} from '@ant-design/icons';
import { useEffect, useCallback } from 'react';

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    const url = window.prompt('URL Ảnh');

    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  return (
    <div style={{ padding: '8px', borderBottom: '1px solid #d9d9d9', background: '#fafafa', display: 'flex', flexWrap: 'wrap', gap: '8px', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
      <Space.Compact size="small">
        <Tooltip title="In đậm"><Button type={editor.isActive('bold') ? 'primary' : 'default'} icon={<BoldOutlined />} onClick={() => editor.chain().focus().toggleBold().run()} /></Tooltip>
        <Tooltip title="In nghiêng"><Button type={editor.isActive('italic') ? 'primary' : 'default'} icon={<ItalicOutlined />} onClick={() => editor.chain().focus().toggleItalic().run()} /></Tooltip>
        <Tooltip title="Gạch chân"><Button type={editor.isActive('underline') ? 'primary' : 'default'} icon={<UnderlineOutlined />} onClick={() => editor.chain().focus().toggleUnderline().run()} /></Tooltip>
        <Tooltip title="Gạch ngang"><Button type={editor.isActive('strike') ? 'primary' : 'default'} icon={<StrikethroughOutlined />} onClick={() => editor.chain().focus().toggleStrike().run()} /></Tooltip>
      </Space.Compact>
      
      <Space.Compact size="small">
        <Tooltip title="Căn trái"><Button type={editor.isActive({ textAlign: 'left' }) ? 'primary' : 'default'} icon={<AlignLeftOutlined />} onClick={() => editor.chain().focus().setTextAlign('left').run()} /></Tooltip>
        <Tooltip title="Căn giữa"><Button type={editor.isActive({ textAlign: 'center' }) ? 'primary' : 'default'} icon={<AlignCenterOutlined />} onClick={() => editor.chain().focus().setTextAlign('center').run()} /></Tooltip>
        <Tooltip title="Căn phải"><Button type={editor.isActive({ textAlign: 'right' }) ? 'primary' : 'default'} icon={<AlignRightOutlined />} onClick={() => editor.chain().focus().setTextAlign('right').run()} /></Tooltip>
      </Space.Compact>

      <Space.Compact size="small">
        <Tooltip title="Danh sách số"><Button type={editor.isActive('orderedList') ? 'primary' : 'default'} icon={<OrderedListOutlined />} onClick={() => editor.chain().focus().toggleOrderedList().run()} /></Tooltip>
        <Tooltip title="Danh sách chấm"><Button type={editor.isActive('bulletList') ? 'primary' : 'default'} icon={<UnorderedListOutlined />} onClick={() => editor.chain().focus().toggleBulletList().run()} /></Tooltip>
      </Space.Compact>

      <Space.Compact size="small">
        <Tooltip title="Tiêu đề 1"><Button type={editor.isActive('heading', { level: 1 }) ? 'primary' : 'default'} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</Button></Tooltip>
        <Tooltip title="Tiêu đề 2"><Button type={editor.isActive('heading', { level: 2 }) ? 'primary' : 'default'} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</Button></Tooltip>
        <Tooltip title="Tiêu đề 3"><Button type={editor.isActive('heading', { level: 3 }) ? 'primary' : 'default'} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</Button></Tooltip>
      </Space.Compact>

      <Space.Compact size="small">
        <Tooltip title="Chèn Link"><Button type={editor.isActive('link') ? 'primary' : 'default'} icon={<LinkOutlined />} onClick={setLink} /></Tooltip>
        <Tooltip title="Chèn Ảnh"><Button icon={<PictureOutlined />} onClick={addImage} /></Tooltip>
      </Space.Compact>
    </div>
  );
};

const TiptapEditor = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
  });

  // Cập nhật giá trị khi có thay đổi từ bên ngoài (e.g. initial load)
  useEffect(() => {
    if (editor && value !== undefined && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return (
    <>
      <style>{`
        .ProseMirror {
          min-height: 300px;
          outline: none;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #bfbfbf;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
        }
        .ProseMirror h1,
        .ProseMirror h2,
        .ProseMirror h3 {
          color: #000;
        }
      `}</style>
      <div style={{ border: '1px solid #d9d9d9', borderRadius: '8px', overflow: 'hidden' }}>
        <MenuBar editor={editor} />
        <div 
          style={{ padding: '16px', minHeight: '300px', maxHeight: '500px', overflowY: 'auto', background: '#fff', cursor: 'text' }} 
          onClick={() => editor?.commands.focus()}
        >
          <EditorContent editor={editor} />
        </div>
      </div>
    </>
  );
};

export default TiptapEditor;
