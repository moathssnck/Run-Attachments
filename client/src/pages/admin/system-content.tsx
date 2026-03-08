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

type LookupCategory = { id: number; nameEn: string; nameAr: string };
type LookupItem    = { id: number; nameEn: string; nameAr: string };

type ContentRecord = {
  id: number;
  systemContentCategoryId: number;
  content: string;
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

function normCategory(r: Raw): LookupCategory {
  return {
    id:     asNum(r.id ?? r.lookupCategoryId ?? r.categoryId),
    nameEn: asStr(r.nameEn ?? r.lookupCategoryEn ?? r.name),
    nameAr: asStr(r.nameAr ?? r.lookupCategoryAr ?? r.name),
  };
}

function normLookup(r: Raw): LookupItem {
  return {
    id:     asNum(r.id ?? r.lookupId),
    nameEn: asStr(r.nameEn ?? r.lookupEn ?? r.name),
    nameAr: asStr(r.nameAr ?? r.lookupAr ?? r.name),
  };
}

function normContent(r: Raw): ContentRecord {
  return {
    id:                      asNum(r.id ?? r.systemContentId),
    systemContentCategoryId: asNum(r.systemContentCategoryId ?? r.categoryId),
    content:                 asStr(r.content ?? r.contentAr ?? r.body),
  };
}

// Find the category whose English name contains "system content" (case-insensitive)
function findSysContentCategory(cats: LookupCategory[]): LookupCategory | undefined {
  const needle = "system content";
  return cats.find(
    (c) =>
      c.nameEn.toLowerCase().includes(needle) ||
      c.nameAr.includes("محتوى") ||
      c.nameAr.includes("نظام"),
  );
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

  const [selectedLookupId, setSelectedLookupId] = useState<string>("");
  const [editorContent, setEditorContent]       = useState("");

  // ── Step 1: fetch all lookup categories, find the "System Content" one ─────
  const {
    data: allCategories = [],
    isLoading: catsLoading,
    isError: catsError,
  } = useQuery<LookupCategory[]>({
    queryKey: [API_CONFIG.lookupCategory.list],
    queryFn: async () => {
      const res = await apiRequest("GET", API_CONFIG.lookupCategory.list);
      if (!res.ok) throw new Error(`${res.status}`);
      const payload = await res.json();
      return unwrapArray(payload, "lookupCategories", "categories", "data", "items")
        .map(normCategory)
        .filter((c) => c.id > 0);
    },
    retry: 1,
  });

  const sysCategory = findSysContentCategory(allCategories);
  const sysCategoryId = sysCategory?.id ?? null;

  // ── Step 2: fetch lookups for that category ────────────────────────────────
  const {
    data: lookupItems = [],
    isLoading: lookupsLoading,
    isError: lookupsError,
  } = useQuery<LookupItem[]>({
    queryKey: [API_CONFIG.lookup.byCategory(sysCategoryId ?? 0)],
    enabled: sysCategoryId !== null,
    queryFn: async () => {
      const res = await apiRequest("GET", API_CONFIG.lookup.byCategory(sysCategoryId!));
      if (!res.ok) throw new Error(`${res.status}`);
      const payload = await res.json();
      return unwrapArray(payload, "lookups", "data", "items")
        .map(normLookup)
        .filter((l) => l.id > 0);
    },
    retry: 1,
  });

  // ── Step 3: fetch content for the selected lookup ──────────────────────────
  const {
    data: contentRecord,
    isLoading: contentLoading,
    isError: contentError,
  } = useQuery<ContentRecord | null>({
    queryKey: [API_CONFIG.systemContent.byLookupId(selectedLookupId)],
    enabled: !!selectedLookupId,
    queryFn: async () => {
      const res = await apiRequest("GET", API_CONFIG.systemContent.byLookupId(selectedLookupId));
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error(`${res.status}`);
      }
      const payload = await res.json();
      if (!payload || (Array.isArray(payload) && payload.length === 0)) return null;
      const arr = unwrapArray(payload, "systemContents", "contents", "data", "items", "result");
      const raw = arr.length > 0 ? arr[0] : (payload as Raw);
      return normContent(raw);
    },
    retry: 1,
  });

  // Populate editor when content loads or selection changes
  useEffect(() => {
    setEditorContent(contentRecord?.content ?? "");
  }, [selectedLookupId, contentRecord?.id]);

  // ── Upsert mutation ────────────────────────────────────────────────────────
  const upsertMutation = useMutation({
    mutationFn: (body: { id: number; systemContentCategoryId: number; content: string }) =>
      apiRequest("POST", API_CONFIG.systemContent.upsert, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_CONFIG.systemContent.byLookupId(selectedLookupId)] });
      toast({ title: isRTL ? "تم الحفظ بنجاح" : "Saved successfully" });
    },
    onError: () => {
      toast({ title: isRTL ? "فشل في الحفظ" : "Failed to save", variant: "destructive" });
    },
  });

  const handleSave = () => {
    if (!selectedLookupId) return;
    upsertMutation.mutate({
      id:                      contentRecord?.id ?? 0,
      systemContentCategoryId: Number(selectedLookupId),
      content:                 editorContent,
    });
  };

  const lookupLabel = (item: LookupItem) =>
    isRTL ? (item.nameAr || item.nameEn || `#${item.id}`) : (item.nameEn || item.nameAr || `#${item.id}`);

  const isLoadingAny = catsLoading || (sysCategoryId !== null && lookupsLoading);
  const isErrorAny   = catsError || lookupsError;

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

            {/* Selector */}
            <div className="max-w-sm space-y-2">
              <Label>{isRTL ? "اختر المحتوى" : "Select Content"}</Label>

              {isLoadingAny ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isRTL ? "جارٍ التحميل..." : "Loading..."}
                </div>
              ) : isErrorAny ? (
                <p className="text-sm text-destructive">
                  {isRTL ? "فشل في تحميل القوائم" : "Failed to load content list"}
                </p>
              ) : !sysCategory ? (
                <p className="text-sm text-muted-foreground">
                  {isRTL ? "لم يتم العثور على تصنيف محتوى النظام" : "System Content category not found in lookup categories"}
                </p>
              ) : (
                <Select
                  value={selectedLookupId}
                  onValueChange={(val) => { setSelectedLookupId(val); setEditorContent(""); }}
                >
                  <SelectTrigger data-testid="select-content">
                    <SelectValue placeholder={isRTL ? "اختر المحتوى..." : "Select content..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {lookupItems.length === 0 ? (
                      <SelectItem value="__empty" disabled>
                        {isRTL ? "لا يوجد محتوى" : "No items in this category"}
                      </SelectItem>
                    ) : (
                      lookupItems.map((item) => (
                        <SelectItem key={item.id} value={String(item.id)} data-testid={`option-content-${item.id}`}>
                          {lookupLabel(item)}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Editor */}
            {selectedLookupId && (
              <>
                <Separator />
                {contentLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isRTL ? "جارٍ تحميل المحتوى..." : "Loading content..."}
                  </div>
                ) : contentError ? (
                  <p className="text-sm text-destructive">
                    {isRTL ? "فشل في تحميل المحتوى" : "Failed to load content"}
                  </p>
                ) : (
                  <>
                    <RichTextEditor
                      editorKey={selectedLookupId}
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
              </>
            )}

            {/* Empty state */}
            {!isLoadingAny && !isErrorAny && sysCategory && !selectedLookupId && (
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
