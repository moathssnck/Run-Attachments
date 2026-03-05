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

type RawItem = Record<string, unknown>;

type NormalizedSystemContent = {
  id: number;
  systemContentCategoryId: number;
  content: string;
  label: string;
};

// ─── Normalization ────────────────────────────────────────────────────────────

function asStr(v: unknown, fallback = ""): string {
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return fallback;
}

function asNum(v: unknown, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const p = Number(v);
    if (Number.isFinite(p)) return p;
  }
  return fallback;
}

function normalizeItem(raw: RawItem, i: number): NormalizedSystemContent {
  const id = asNum(raw.id ?? raw.systemContentId, i + 1);
  const catId = asNum(
    raw.systemContentCategoryId ?? raw.categoryId ?? raw.category,
  );
  const content = asStr(raw.content ?? raw.contentAr ?? raw.contentEn ?? raw.body);
  const label =
    asStr(raw.titleAr ?? raw.titleEn ?? raw.title ?? raw.nameAr ?? raw.nameEn ?? raw.name) ||
    `#${id}`;
  return { id, systemContentCategoryId: catId, content, label };
}

function extractItems(payload: unknown): NormalizedSystemContent[] {
  let raw: RawItem[] = [];
  if (Array.isArray(payload)) {
    raw = payload as RawItem[];
  } else if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.systemContent)) raw = obj.systemContent as RawItem[];
    else if (Array.isArray(obj.contents)) raw = obj.contents as RawItem[];
    else if (Array.isArray(obj.data)) raw = obj.data as RawItem[];
    else if (Array.isArray(obj.items)) raw = obj.items as RawItem[];
    else if (Array.isArray(obj.result)) raw = obj.result as RawItem[];
    else if (obj.data && typeof obj.data === "object") {
      const d = obj.data as Record<string, unknown>;
      if (Array.isArray(d.data)) raw = d.data as RawItem[];
      else if (Array.isArray(d.items)) raw = d.items as RawItem[];
    }
  }
  return raw.map(normalizeItem);
}

// ─── Rich Text Editor ─────────────────────────────────────────────────────────

function EditorToolbar({ editor }: { editor: any }) {
  if (!editor) return null;

  const setLink = () => {
    const url = window.prompt("URL:");
    if (url) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 p-2 border-b bg-muted/30" dir="ltr">
      <Button type="button" variant="ghost" size="icon"
        className={editor.isActive("bold") ? "bg-accent text-accent-foreground" : ""}
        onClick={() => editor.chain().focus().toggleBold().run()}
        data-testid="editor-bold"><Bold className="h-4 w-4" /></Button>
      <Button type="button" variant="ghost" size="icon"
        className={editor.isActive("italic") ? "bg-accent text-accent-foreground" : ""}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        data-testid="editor-italic"><Italic className="h-4 w-4" /></Button>
      <Button type="button" variant="ghost" size="icon"
        className={editor.isActive("underline") ? "bg-accent text-accent-foreground" : ""}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        data-testid="editor-underline"><UnderlineIcon className="h-4 w-4" /></Button>
      <Button type="button" variant="ghost" size="icon"
        className={editor.isActive("strike") ? "bg-accent text-accent-foreground" : ""}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        data-testid="editor-strike"><Strikethrough className="h-4 w-4" /></Button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Button type="button" variant="ghost" size="icon"
        className={editor.isActive("heading", { level: 1 }) ? "bg-accent text-accent-foreground" : ""}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        data-testid="editor-h1"><Heading1 className="h-4 w-4" /></Button>
      <Button type="button" variant="ghost" size="icon"
        className={editor.isActive("heading", { level: 2 }) ? "bg-accent text-accent-foreground" : ""}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        data-testid="editor-h2"><Heading2 className="h-4 w-4" /></Button>
      <Button type="button" variant="ghost" size="icon"
        className={editor.isActive("heading", { level: 3 }) ? "bg-accent text-accent-foreground" : ""}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        data-testid="editor-h3"><Heading3 className="h-4 w-4" /></Button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Button type="button" variant="ghost" size="icon"
        className={editor.isActive({ textAlign: "left" }) ? "bg-accent text-accent-foreground" : ""}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        data-testid="editor-align-left"><AlignLeft className="h-4 w-4" /></Button>
      <Button type="button" variant="ghost" size="icon"
        className={editor.isActive({ textAlign: "center" }) ? "bg-accent text-accent-foreground" : ""}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        data-testid="editor-align-center"><AlignCenter className="h-4 w-4" /></Button>
      <Button type="button" variant="ghost" size="icon"
        className={editor.isActive({ textAlign: "right" }) ? "bg-accent text-accent-foreground" : ""}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        data-testid="editor-align-right"><AlignRight className="h-4 w-4" /></Button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Button type="button" variant="ghost" size="icon"
        className={editor.isActive("bulletList") ? "bg-accent text-accent-foreground" : ""}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        data-testid="editor-bullet-list"><List className="h-4 w-4" /></Button>
      <Button type="button" variant="ghost" size="icon"
        className={editor.isActive("orderedList") ? "bg-accent text-accent-foreground" : ""}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        data-testid="editor-ordered-list"><ListOrdered className="h-4 w-4" /></Button>
      <Button type="button" variant="ghost" size="icon"
        className={editor.isActive("blockquote") ? "bg-accent text-accent-foreground" : ""}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        data-testid="editor-blockquote"><Quote className="h-4 w-4" /></Button>
      <Button type="button" variant="ghost" size="icon"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        data-testid="editor-hr"><Minus className="h-4 w-4" /></Button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Button type="button" variant="ghost" size="icon"
        className={editor.isActive("link") ? "bg-accent text-accent-foreground" : ""}
        onClick={setLink}
        data-testid="editor-link"><LinkIcon className="h-4 w-4" /></Button>
      {editor.isActive("link") && (
        <Button type="button" variant="ghost" size="icon"
          onClick={() => editor.chain().focus().unsetLink().run()}
          data-testid="editor-unlink"><Unlink className="h-4 w-4" /></Button>
      )}

      <Separator orientation="vertical" className="h-6 mx-1" />

      <input type="color" className="h-7 w-7 rounded cursor-pointer border"
        onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
        value={editor.getAttributes("textStyle").color || "#000000"}
        data-testid="editor-color" />

      <div className="flex-1" />

      <Button type="button" variant="ghost" size="icon"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        data-testid="editor-undo"><Undo className="h-4 w-4" /></Button>
      <Button type="button" variant="ghost" size="icon"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        data-testid="editor-redo"><Redo className="h-4 w-4" /></Button>
    </div>
  );
}

function RichTextEditor({
  content,
  onChange,
  editorKey,
}: {
  content: string;
  onChange: (html: string) => void;
  editorKey: string;
}) {
  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        Underline,
        TextStyle,
        Color,
        Link.configure({ openOnClick: false }),
        TextAlign.configure({ types: ["heading", "paragraph"] }),
      ],
      content,
      onUpdate: ({ editor }) => {
        onChange(editor.getHTML());
      },
    },
    [editorKey],
  );

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      <EditorToolbar editor={editor} />
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <EditorContent
          editor={editor}
          className="min-h-[300px] p-4 focus-within:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[280px]"
        />
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
  const [content, setContent] = useState("");

  const { data: items = [], isLoading, isError } = useQuery<NormalizedSystemContent[]>({
    queryKey: [API_CONFIG.systemContent.list],
    queryFn: async () => {
      const res = await apiRequest("GET", API_CONFIG.systemContent.list);
      if (!res.ok) throw new Error(`${res.status}`);
      const payload = await res.json();
      return extractItems(payload);
    },
    retry: 1,
  });

  const listItem = items.find((item) => String(item.id) === selectedId);

  const {
    data: detailItem,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useQuery<NormalizedSystemContent>({
    queryKey: [API_CONFIG.systemContent.byId(selectedId)],
    queryFn: async () => {
      const res = await apiRequest("GET", API_CONFIG.systemContent.byId(selectedId));
      if (!res.ok) throw new Error(`${res.status}`);
      const payload = await res.json();
      const normalized = extractItems(Array.isArray(payload) ? payload : [payload]);
      if (normalized.length === 0) throw new Error("empty");
      return normalized[0];
    },
    enabled: !!selectedId,
    retry: 1,
  });

  const selectedItem = detailItem ?? listItem;

  useEffect(() => {
    if (detailItem) {
      setContent(detailItem.content);
    } else if (listItem) {
      setContent(listItem.content);
    }
  }, [selectedId, detailItem?.id]);

  const upsertMutation = useMutation({
    mutationFn: (body: { id: number; systemContentCategoryId: number; content: string }) =>
      apiRequest("POST", API_CONFIG.systemContent.upsert, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_CONFIG.systemContent.list] });
      if (selectedId) {
        queryClient.invalidateQueries({
          queryKey: [API_CONFIG.systemContent.byId(selectedId)],
        });
      }
      toast({ title: isRTL ? "تم الحفظ بنجاح" : "Saved successfully" });
    },
    onError: () => {
      toast({
        title: isRTL ? "فشل في الحفظ" : "Failed to save",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!selectedItem) return;
    upsertMutation.mutate({
      id: selectedItem.id,
      systemContentCategoryId: selectedItem.systemContentCategoryId,
      content,
    });
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6" dir={dir}>
        <PageHeader
          title={isRTL ? "محتويات النظام" : "System Content"}
          subtitle={
            isRTL
              ? "تعديل صفحات المحتوى مثل الشروط والأحكام وسياسة الخصوصية"
              : "Edit content pages like Terms & Conditions, Privacy Policy"
          }
          icon={<FileText className="h-5 w-5" />}
        />

        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="w-full sm:w-80 space-y-2">
              <Label>{isRTL ? "اختر المحتوى" : "Select Content"}</Label>
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger data-testid="select-content">
                  <SelectValue
                    placeholder={
                      isRTL ? "اختر المحتوى للتعديل..." : "Choose content to edit..."
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? (
                    <SelectItem value="__loading" disabled>
                      {isRTL ? "جارٍ التحميل..." : "Loading..."}
                    </SelectItem>
                  ) : isError ? (
                    <SelectItem value="__error" disabled>
                      {isRTL ? "فشل في التحميل" : "Failed to load"}
                    </SelectItem>
                  ) : items.length === 0 ? (
                    <SelectItem value="__empty" disabled>
                      {isRTL ? "لا توجد صفحات" : "No pages available"}
                    </SelectItem>
                  ) : (
                    items.map((item) => (
                      <SelectItem
                        key={item.id}
                        value={String(item.id)}
                        data-testid={`option-page-${item.id}`}
                      >
                        {item.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedId && isDetailLoading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {selectedId && isDetailError && !detailItem && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 mb-4 text-destructive opacity-70" />
                <p className="font-semibold text-destructive">
                  {isRTL ? "فشل في تحميل المحتوى" : "Failed to load content"}
                </p>
              </div>
            )}

            {selectedItem && !isDetailLoading && (
              <>
                <Separator />

                <div className="text-xs text-muted-foreground">
                  {isRTL ? "رقم الفئة:" : "Category ID:"}{" "}
                  <span className="font-mono font-semibold">
                    {selectedItem.systemContentCategoryId}
                  </span>
                </div>

                <RichTextEditor
                  editorKey={String(selectedItem.id)}
                  content={content}
                  onChange={setContent}
                />

                <div className="flex justify-end">
                  <Button
                    onClick={handleSave}
                    disabled={upsertMutation.isPending}
                    data-testid="button-save-content"
                  >
                    {upsertMutation.isPending ? (
                      <Loader2 className="h-4 w-4 ltr:mr-2 rtl:ml-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                    )}
                    {upsertMutation.isPending
                      ? isRTL ? "جارٍ الحفظ..." : "Saving..."
                      : isRTL ? "حفظ التغييرات" : "Save Changes"}
                  </Button>
                </div>
              </>
            )}

            {!selectedId && !isLoading && !isError && (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">
                  {isRTL
                    ? "اختر صفحة من القائمة للتعديل"
                    : "Select a page from the dropdown to edit"}
                </p>
              </div>
            )}

            {isError && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 mb-4 text-destructive opacity-70" />
                <p className="font-semibold text-destructive">
                  {isRTL ? "غير مصرح / فشل في التحميل" : "Unauthorized / Failed to load"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {isRTL
                    ? "تحقق من صلاحية الرمز المميز"
                    : "Check that your token is valid and not expired"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
