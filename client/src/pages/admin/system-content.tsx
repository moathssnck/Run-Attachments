import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";
import {
  FileText,
  Save,
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Link as LinkIcon,
  Unlink,
  Minus,
  Quote,
  Loader2,
} from "lucide-react";
import { AdminLayout } from "@/components/admin-layout";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { API_CONFIG } from "@/lib/api-config";

// ─── Types ────────────────────────────────────────────────────────────────────

type Raw = Record<string, unknown>;

type ContentRecord = {
  id: number;
  systemContentCategoryId: number;
  content: string;
  labelAr: string;
  labelEn: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function asStr(v: unknown, fb = ""): string {
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return fb;
}
function asNum(v: unknown, fb = 0): number {
  if (typeof v === "number" && isFinite(v)) return v;
  if (typeof v === "string" && v.trim()) { const n = Number(v); if (isFinite(n)) return n; }
  return fb;
}

function unwrapArray(payload: unknown, ...keys: string[]): Raw[] {
  if (Array.isArray(payload)) return payload as Raw[];
  if (payload && typeof payload === "object") {
    const obj = payload as Raw;
    for (const k of keys) {
      if (Array.isArray(obj[k])) return obj[k] as Raw[];
    }
    if (obj.data && typeof obj.data === "object") {
      const d = obj.data as Raw;
      if (Array.isArray(d.data)) return d.data as Raw[];
      if (Array.isArray(d.items)) return d.items as Raw[];
    }
  }
  return [];
}

function normRecord(r: Raw): ContentRecord {
  return {
    id:                      asNum(r.id ?? r.systemContentId),
    systemContentCategoryId: asNum(r.systemContentCategoryId ?? r.categoryId),
    content:                 asStr(r.content ?? r.contentAr ?? r.body),
    labelAr:                 asStr(r.titleAr ?? r.nameAr ?? r.labelAr ?? r.title ?? r.name),
    labelEn:                 asStr(r.titleEn ?? r.nameEn ?? r.labelEn ?? r.title ?? r.name),
  };
}

// ─── Rich Text Editor ─────────────────────────────────────────────────────────

function EditorToolbar({ editor }: { editor: any }) {
  if (!editor) return null;
  const setLink = () => {
    const url = window.prompt("URL:");
    if (url) editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };
  return (
    <div className="flex flex-wrap items-center gap-0.5 p-2 border-b bg-muted/30" dir="ltr">
      <Button type="button" variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive("bold") ? "bg-accent text-accent-foreground" : ""} data-testid="editor-bold"><Bold className="h-4 w-4" /></Button>
      <Button type="button" variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive("italic") ? "bg-accent text-accent-foreground" : ""} data-testid="editor-italic"><Italic className="h-4 w-4" /></Button>
      <Button type="button" variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive("underline") ? "bg-accent text-accent-foreground" : ""} data-testid="editor-underline"><UnderlineIcon className="h-4 w-4" /></Button>
      <Button type="button" variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive("strike") ? "bg-accent text-accent-foreground" : ""} data-testid="editor-strike"><Strikethrough className="h-4 w-4" /></Button>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <Button type="button" variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive("heading", { level: 1 }) ? "bg-accent text-accent-foreground" : ""} data-testid="editor-h1"><Heading1 className="h-4 w-4" /></Button>
      <Button type="button" variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive("heading", { level: 2 }) ? "bg-accent text-accent-foreground" : ""} data-testid="editor-h2"><Heading2 className="h-4 w-4" /></Button>
      <Button type="button" variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive("heading", { level: 3 }) ? "bg-accent text-accent-foreground" : ""} data-testid="editor-h3"><Heading3 className="h-4 w-4" /></Button>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <Button type="button" variant="ghost" size="icon" onClick={() => editor.chain().focus().setTextAlign("left").run()} className={editor.isActive({ textAlign: "left" }) ? "bg-accent text-accent-foreground" : ""} data-testid="editor-align-left"><AlignLeft className="h-4 w-4" /></Button>
      <Button type="button" variant="ghost" size="icon" onClick={() => editor.chain().focus().setTextAlign("center").run()} className={editor.isActive({ textAlign: "center" }) ? "bg-accent text-accent-foreground" : ""} data-testid="editor-align-center"><AlignCenter className="h-4 w-4" /></Button>
      <Button type="button" variant="ghost" size="icon" onClick={() => editor.chain().focus().setTextAlign("right").run()} className={editor.isActive({ textAlign: "right" }) ? "bg-accent text-accent-foreground" : ""} data-testid="editor-align-right"><AlignRight className="h-4 w-4" /></Button>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <Button type="button" variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive("bulletList") ? "bg-accent text-accent-foreground" : ""} data-testid="editor-bullet-list"><List className="h-4 w-4" /></Button>
      <Button type="button" variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive("orderedList") ? "bg-accent text-accent-foreground" : ""} data-testid="editor-ordered-list"><ListOrdered className="h-4 w-4" /></Button>
      <Button type="button" variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive("blockquote") ? "bg-accent text-accent-foreground" : ""} data-testid="editor-blockquote"><Quote className="h-4 w-4" /></Button>
      <Button type="button" variant="ghost" size="icon" onClick={() => editor.chain().focus().setHorizontalRule().run()} data-testid="editor-hr"><Minus className="h-4 w-4" /></Button>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <Button type="button" variant="ghost" size="icon" onClick={setLink} className={editor.isActive("link") ? "bg-accent text-accent-foreground" : ""} data-testid="editor-link"><LinkIcon className="h-4 w-4" /></Button>
      {editor.isActive("link") && (
        <Button type="button" variant="ghost" size="icon" onClick={() => editor.chain().focus().unsetLink().run()} data-testid="editor-unlink"><Unlink className="h-4 w-4" /></Button>
      )}
      <Separator orientation="vertical" className="h-6 mx-1" />
      <input type="color" className="h-7 w-7 rounded cursor-pointer border" onChange={(e) => editor.chain().focus().setColor(e.target.value).run()} value={editor.getAttributes("textStyle").color || "#000000"} data-testid="editor-color" />
      <div className="flex-1" />
      <Button type="button" variant="ghost" size="icon" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} data-testid="editor-undo"><Undo className="h-4 w-4" /></Button>
      <Button type="button" variant="ghost" size="icon" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} data-testid="editor-redo"><Redo className="h-4 w-4" /></Button>
    </div>
  );
}

function RichTextEditor({ content, onChange, editorKey }: { content: string; onChange: (html: string) => void; editorKey: string }) {
  const editor = useEditor(
    {
      extensions: [StarterKit, Underline, TextStyle, Color, Link.configure({ openOnClick: false }), TextAlign.configure({ types: ["heading", "paragraph"] })],
      content,
      onUpdate: ({ editor }) => onChange(editor.getHTML()),
    },
    [editorKey],
  );
  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      <EditorToolbar editor={editor} />
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <EditorContent editor={editor} className="min-h-[300px] p-4 focus-within:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[280px]" />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SystemContentPage() {
  const { dir } = useLanguage();
  const isRTL = dir === "rtl";
  const { toast } = useToast();

  const [selectedId, setSelectedId] = useState<string>("");
  const [editorContent, setEditorContent] = useState("");

  // ── Fetch all system content records ──────────────────────────────────────
  const {
    data: records = [],
    isLoading,
    isError,
    error,
  } = useQuery<ContentRecord[]>({
    queryKey: [API_CONFIG.systemContent.list],
    queryFn: async () => {
      const res = await apiRequest("GET", API_CONFIG.systemContent.list);
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`${res.status}${text ? ": " + text : ""}`);
      }
      const payload = await res.json();
      return unwrapArray(payload, "systemContents", "contents", "data", "items", "result")
        .map(normRecord)
        .filter((r) => r.id > 0);
    },
    retry: 1,
  });

  const selectedRecord = records.find((r) => String(r.id) === selectedId) ?? null;

  // Populate editor when selection changes
  useEffect(() => {
    if (selectedRecord) {
      setEditorContent(selectedRecord.content);
    } else {
      setEditorContent("");
    }
  }, [selectedId, selectedRecord?.id]);

  // ── Upsert mutation ────────────────────────────────────────────────────────
  const upsertMutation = useMutation({
    mutationFn: (body: { id: number; systemContentCategoryId: number; content: string }) =>
      apiRequest("POST", API_CONFIG.systemContent.upsert, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_CONFIG.systemContent.list] });
      toast({ title: isRTL ? "تم الحفظ بنجاح" : "Saved successfully" });
    },
    onError: () => {
      toast({ title: isRTL ? "فشل في الحفظ" : "Failed to save", variant: "destructive" });
    },
  });

  const handleSave = () => {
    if (!selectedRecord) return;
    upsertMutation.mutate({
      id:                      selectedRecord.id,
      systemContentCategoryId: selectedRecord.systemContentCategoryId,
      content:                 editorContent,
    });
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6" dir={dir}>
        <PageHeader
          title={isRTL ? "محتويات النظام" : "System Content"}
          subtitle={isRTL ? "تعديل صفحات المحتوى مثل الشروط والأحكام وسياسة الخصوصية" : "Edit content pages like Terms & Conditions, Privacy Policy"}
          icon={<FileText className="h-5 w-5" />}
        />

        <Card>
          <CardContent className="p-6 space-y-6">

            {/* Content selector */}
            <div className="max-w-sm space-y-2">
              <Label>{isRTL ? "اختر المحتوى" : "Select Content"}</Label>
              {isLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isRTL ? "جارٍ التحميل..." : "Loading..."}
                </div>
              ) : isError ? (
                <p className="text-sm text-destructive">
                  {(error as Error)?.message || (isRTL ? "فشل في التحميل" : "Failed to load")}
                </p>
              ) : (
                <Select value={selectedId} onValueChange={setSelectedId}>
                  <SelectTrigger data-testid="select-content">
                    <SelectValue placeholder={isRTL ? "اختر المحتوى..." : "Select content..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {records.length === 0 ? (
                      <SelectItem value="__empty" disabled>
                        {isRTL ? "لا يوجد محتوى" : "No content found"}
                      </SelectItem>
                    ) : (
                      records.map((r) => (
                        <SelectItem key={r.id} value={String(r.id)} data-testid={`option-content-${r.id}`}>
                          {isRTL
                            ? (r.labelAr || r.labelEn || `#${r.id}`)
                            : (r.labelEn || r.labelAr || `#${r.id}`)}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Editor */}
            {selectedRecord && (
              <>
                <Separator />
                <RichTextEditor
                  editorKey={selectedId}
                  content={editorContent}
                  onChange={setEditorContent}
                />
                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={upsertMutation.isPending} data-testid="button-save-content">
                    {upsertMutation.isPending
                      ? <Loader2 className="h-4 w-4 ltr:mr-2 rtl:ml-2 animate-spin" />
                      : <Save className="h-4 w-4 ltr:mr-2 rtl:ml-2" />}
                    {upsertMutation.isPending
                      ? (isRTL ? "جارٍ الحفظ..." : "Saving...")
                      : (isRTL ? "حفظ التغييرات" : "Save Changes")}
                  </Button>
                </div>
              </>
            )}

            {/* Empty state */}
            {!isLoading && !isError && !selectedId && (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mb-4 opacity-40" />
                <p className="text-lg font-medium">
                  {isRTL ? "اختر محتوى للتعديل" : "Select content to edit"}
                </p>
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
