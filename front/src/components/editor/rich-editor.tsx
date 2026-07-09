"use client";

import React, {useRef, useState} from "react";
import {EditorContent, NodeViewWrapper, ReactNodeViewRenderer, useEditor} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {mergeAttributes, Node} from "@tiptap/core";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import {TextStyle} from "@tiptap/extension-text-style";
import {Color} from "@tiptap/extension-color";
import {Highlight} from "@tiptap/extension-highlight";
import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    Bold,
    ChevronDown,
    GripVertical,
    Heading1,
    Heading2,
    Heading3,
    Image as LucideImage,
    Italic,
    List,
    ListOrdered,
    Minus,
    Quote,
    Redo,
    Strikethrough,
    Underline as UnderlineIcon,
    Undo,
    X,
} from "lucide-react";
import {cn} from "@/lib/utils";
import {apiUpload, resolveMediaUrl} from "@/lib/api";

// ─── 구분선 커스텀 노드 ───────────────────────────────────────────────────────

const CustomHR = Node.create({
  name: "horizontalRule",
  group: "block",
    parseHTML() {
        return [{tag: "hr"}];
    },
  addAttributes() {
    return {
      style: {
        default: null,
        parseHTML: (el) => el.getAttribute("style"),
        renderHTML: (attrs) => attrs.style ? { style: attrs.style } : {},
      },
    };
  },
  renderHTML({ HTMLAttributes }) {
    return ["hr", mergeAttributes(HTMLAttributes)];
  },
  addCommands() {
    return {
        setHorizontalRule: (attrs: Record<string, any>) => ({chain}: any) =>
            chain().insertContent({type: this.name, attrs}).run(),
    } as any;
  },
});

// ─── 미디어 공통 노드 뷰 (이미지 + 영상) ──────────────────────────────────────

const WIDTH_PRESETS = ["25%", "50%", "75%", "100%"] as const;

function MediaNodeView({
                           node, updateAttributes, deleteNode, type,
                       }: {
    node: any;
    updateAttributes: (attrs: Record<string, any>) => void;
    deleteNode: () => void;
    type: "image" | "video";
}) {
    const width: string = node.attrs.width || "100%";

    return (
        <NodeViewWrapper className="my-2 block">
            <div className="relative group inline-block" style={{width}}>
                {/* 상단 오버레이: 드래그 핸들 + 크기 프리셋 + 삭제 */}
                <div
                    data-drag-handle
                    className="absolute inset-x-0 top-0 flex h-8 cursor-grab items-center justify-between rounded-t-lg bg-gradient-to-b from-black/60 to-transparent px-2 opacity-0 transition-opacity group-hover:opacity-100 z-10"
                >
                    <div className="flex items-center gap-0.5">
                        <GripVertical className="mr-1 h-4 w-4 text-white drop-shadow"/>
                        {WIDTH_PRESETS.map((w) => (
                            <button
                                key={w}
                                type="button"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    updateAttributes({width: w});
                                }}
                                className={cn(
                                    "rounded px-1.5 py-0.5 text-xs font-semibold text-white transition-colors hover:bg-white/30",
                                    width === w && "bg-white/40"
                                )}
                            >
                                {w}
                            </button>
                        ))}
                    </div>
                    <button
                        type="button"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            deleteNode();
                        }}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                    >
                        <X className="h-3 w-3"/>
                    </button>
                </div>

                {type === "image" ? (
                    <img
                        src={node.attrs.src}
                        alt={node.attrs.alt || ""}
                        draggable={false}
                        className="w-full rounded-lg block"
                    />
                ) : (
                    <video
                        src={node.attrs.src}
                        controls
                        className="w-full rounded-lg block"
                    />
                )}
            </div>
        </NodeViewWrapper>
    );
}

function ImageNodeView(props: any) {
    return <MediaNodeView {...props} type="image"/>;
}

function VideoNodeView(props: any) {
    return <MediaNodeView {...props} type="video"/>;
}

// ─── 커스텀 이미지 노드 (블록, 크기 조절 지원) ────────────────────────────────

const CustomImage = Node.create({
    name: "image",
    group: "block",
    atom: true,
    draggable: true,
    addAttributes() {
        return {
            src: {default: null},
            alt: {default: null},
            title: {default: null},
            width: {default: "25%"},
        };
    },
    parseHTML() {
        return [{tag: "img[src]"}];
    },
    renderHTML({HTMLAttributes}) {
        return ["img", mergeAttributes(HTMLAttributes)];
    },
    addCommands() {
        return {
            setImage: (attrs: Record<string, any>) => ({commands}: any) =>
                commands.insertContent({type: this.name, attrs}),
        } as any;
    },
    addNodeView() {
        return ReactNodeViewRenderer(ImageNodeView as any);
    },
});

// ─── 커스텀 영상 노드 (블록, 크기 조절 지원) ──────────────────────────────────

const CustomVideo = Node.create({
    name: "video",
    group: "block",
    atom: true,
    draggable: true,
    addAttributes() {
        return {
            src: {default: null},
            width: {default: "100%"},
        };
    },
    parseHTML() {
        return [{tag: "video[src]"}];
    },
    renderHTML({HTMLAttributes}) {
        return ["video", mergeAttributes({controls: true}, HTMLAttributes)];
    },
    addCommands() {
        return {
            setVideo: (attrs: Record<string, any>) => ({commands}: any) =>
                commands.insertContent({type: this.name, attrs}),
        } as any;
    },
    addNodeView() {
        return ReactNodeViewRenderer(VideoNodeView as any);
    },
});

// ─── 색상 상수 ────────────────────────────────────────────────────────────────

const TEXT_COLORS = [
  { label: "기본", value: "" },
  { label: "빨강", value: "#ef4444" },
  { label: "주황", value: "#f97316" },
  { label: "노랑", value: "#eab308" },
  { label: "초록", value: "#22c55e" },
  { label: "파랑", value: "#3b82f6" },
  { label: "보라", value: "#a855f7" },
  { label: "회색", value: "#6b7280" },
];

const BG_COLORS = [
  { label: "없음", value: "" },
  { label: "빨강", value: "#fee2e2" },
  { label: "주황", value: "#ffedd5" },
  { label: "노랑", value: "#fef9c3" },
  { label: "초록", value: "#dcfce7" },
  { label: "파랑", value: "#dbeafe" },
  { label: "보라", value: "#f3e8ff" },
  { label: "회색", value: "#f3f4f6" },
];

const DIVIDER_STYLES = [
  { label: "짧은 선", style: "border: none; border-top: 1px solid #d1d5db; width: 30%; margin: 16px auto;" },
  { label: "얇은 선", style: "border: none; border-top: 1px solid #d1d5db; width: 100%; margin: 16px 0;" },
  { label: "점선", style: "border: none; border-top: 2px dashed #9ca3af; width: 100%; margin: 16px 0;" },
  { label: "이중선", style: "border: none; border-top: 3px double #6b7280; width: 100%; margin: 16px 0;" },
];

// ─── 툴바 컴포넌트 ────────────────────────────────────────────────────────────

function ToolbarButton({onClick, active, disabled, children, title}: {
    onClick: () => void; active?: boolean; disabled?: boolean;
    children: React.ReactNode; title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md text-neutral-600 transition-colors",
        active ? "bg-primary/10 text-primary" : "hover:bg-neutral-100",
        disabled && "cursor-not-allowed opacity-30"
      )}
    >
      {children}
    </button>
  );
}

function ColorPicker({ colors, onSelect, current, label }: {
  colors: { label: string; value: string }[];
  onSelect: (val: string) => void;
  current?: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as globalThis.Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        title={label}
        onClick={() => setOpen(!open)}
        className="flex h-8 items-center gap-0.5 rounded-md px-1.5 text-neutral-600 hover:bg-neutral-100 transition-colors"
      >
        <span className="text-xs font-bold" style={{ color: current || undefined, backgroundColor: label === "배경색" ? current || undefined : undefined, padding: label === "배경색" ? "0 2px" : undefined }}>
          가
        </span>
        <div className="mt-0.5 h-1 w-4 rounded-sm" style={{ backgroundColor: current || "#e5e7eb" }} />
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute left-0 top-9 z-50 flex flex-wrap gap-1.5 rounded-xl border border-neutral-200 bg-white p-2.5 shadow-lg w-[140px]">
          {colors.map((c) => (
            <button
              key={c.value}
              type="button"
              title={c.label}
              onClick={() => { onSelect(c.value); setOpen(false); }}
              className={cn(
                "h-6 w-6 rounded-md border transition-transform hover:scale-110",
                c.value === "" ? "bg-white border-neutral-300 flex items-center justify-center text-[10px] text-neutral-400" : "border-transparent"
              )}
              style={{ backgroundColor: c.value || undefined }}
            >
              {c.value === "" ? "✕" : ""}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DividerPicker({ onSelect }: { onSelect: (style: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as globalThis.Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        title="구분선"
        onClick={() => setOpen(!open)}
        className="flex h-8 items-center gap-0.5 rounded-md px-1.5 text-neutral-600 hover:bg-neutral-100 transition-colors"
      >
        <Minus className="h-4 w-4" />
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute left-0 top-9 z-50 w-44 rounded-xl border border-neutral-200 bg-white p-2 shadow-lg">
          {DIVIDER_STYLES.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => { onSelect(s.style); setOpen(false); }}
              className="flex w-full flex-col gap-2 rounded-lg px-3 py-2.5 hover:bg-neutral-50 text-left"
            >
              <span className="text-xs text-neutral-500">{s.label}</span>
              <hr style={Object.fromEntries(s.style.split(";").filter(Boolean).map(r => { const [k, v] = r.split(":"); return [k.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase()), v?.trim()]; }))} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 에디터 컴포넌트 ──────────────────────────────────────────────────────────

interface RichEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
    postId?: number;
}

export function RichEditor({value, onChange, placeholder = "당신의 지식을 자유롭게 작성해보세요", postId}: RichEditorProps) {
    const mediaInputRef = useRef<HTMLInputElement>(null);
    // 파일 피커를 열기 전 커서 위치 저장 (파일 선택 중 포커스 이탈로 삽입 위치가 바뀌는 문제 방지)
    const insertPosRef = useRef<number>(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ horizontalRule: false }),
      CustomHR,
        CustomImage,
        CustomVideo,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
        attributes: {class: "min-h-[400px] outline-none"},
    },
  });

  if (!editor) return null;

  const currentColor = editor.getAttributes("textStyle").color;
  const currentBg = editor.getAttributes("highlight").color;

  const insertDivider = (style: string) => {
    (editor.chain().focus() as any).setHorizontalRule({ style }).run();
  };

    const handleMediaUpload = async (file: File, insertFn: (url: string) => void) => {
        const id = postId;
        if (!id) {
            alert("게시글 로딩 중입니다. 잠시 후 다시 시도해 주세요.");
            return;
        }
        try {
            const form = new FormData();
            form.append("file", file);
            const res = await apiUpload<{ url: string }>(`/api/posts/${id}/medias?type=BODY`, form);
            insertFn(resolveMediaUrl(res.url));
        } catch {
            alert("업로드에 실패했습니다.");
        }
    };

    const handleMediaSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const pos = insertPosRef.current;
        await handleMediaUpload(file, (url) => {
            const nodeType = file.type.startsWith("video/") ? "video" : "image";
            editor.commands.insertContentAt(pos, {type: nodeType, attrs: {src: url}});
        });
        if (mediaInputRef.current) mediaInputRef.current.value = "";
    };

  return (
    <div className="flex flex-col">
      {/* 툴바 */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-neutral-100 bg-white py-2">
        <ToolbarButton title="제목 1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })}>
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="제목 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}>
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="제목 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}>
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <div className="mx-1.5 h-5 w-px bg-neutral-200" />

        <ToolbarButton title="굵게" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="기울임" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="밑줄" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")}>
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="취소선" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")}>
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>

        <div className="mx-1.5 h-5 w-px bg-neutral-200" />

          <ColorPicker label="글자색" colors={TEXT_COLORS} current={currentColor}
                       onSelect={(val) => val ? editor.chain().focus().setColor(val).run() : editor.chain().focus().unsetColor().run()}/>
          <ColorPicker label="배경색" colors={BG_COLORS} current={currentBg}
                       onSelect={(val) => val ? editor.chain().focus().setHighlight({color: val}).run() : editor.chain().focus().unsetHighlight().run()}/>

        <div className="mx-1.5 h-5 w-px bg-neutral-200" />

        <ToolbarButton title="왼쪽 정렬" onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })}>
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="가운데 정렬" onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })}>
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="오른쪽 정렬" onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })}>
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>

        <div className="mx-1.5 h-5 w-px bg-neutral-200" />

        <ToolbarButton title="글머리 목록" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="번호 목록" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="인용구" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>
          <Quote className="h-4 w-4" />
        </ToolbarButton>

        <div className="mx-1.5 h-5 w-px bg-neutral-200" />

        <DividerPicker onSelect={insertDivider} />

        <div className="mx-1.5 h-5 w-px bg-neutral-200" />

          {/* 미디어 업로드 (이미지 + 영상) */}
          <ToolbarButton title="미디어 삽입 (이미지·영상)" onClick={() => {
              insertPosRef.current = editor.state.selection.to;
              mediaInputRef.current?.click();
          }}>
              <LucideImage className="h-4 w-4"/>
          </ToolbarButton>
          <input ref={mediaInputRef} type="file" accept="image/*,video/*" className="hidden"
                 onChange={handleMediaSelect}/>

          <div className="mx-1.5 h-5 w-px bg-neutral-200"/>

        <ToolbarButton title="실행 취소" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="다시 실행" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* 에디터 본문 */}
        <EditorContent
            editor={editor}
            className="py-4 [&_.tiptap_h1]:text-3xl [&_.tiptap_h1]:font-extrabold [&_.tiptap_h1]:mb-4 [&_.tiptap_h2]:text-2xl [&_.tiptap_h2]:font-bold [&_.tiptap_h2]:mb-3 [&_.tiptap_h3]:text-xl [&_.tiptap_h3]:font-bold [&_.tiptap_h3]:mb-2 [&_.tiptap_p]:mb-2 [&_.tiptap_p]:leading-relaxed [&_.tiptap_p]:text-neutral-700 [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-6 [&_.tiptap_ul]:mb-3 [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-6 [&_.tiptap_ol]:mb-3 [&_.tiptap_li]:mb-1 [&_.tiptap_blockquote]:border-l-4 [&_.tiptap_blockquote]:border-primary [&_.tiptap_blockquote]:pl-4 [&_.tiptap_blockquote]:text-neutral-500 [&_.tiptap_blockquote]:italic [&_.tiptap_blockquote]:my-3 [&_.tiptap_hr]:my-4 [&_.tiptap_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.tiptap_.is-editor-empty:first-child::before]:text-neutral-300 [&_.tiptap_.is-editor-empty:first-child::before]:float-left [&_.tiptap_.is-editor-empty:first-child::before]:pointer-events-none"
        />
    </div>
  );
}
