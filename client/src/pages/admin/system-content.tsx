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
} from "lucide-react";
import { AdminLayout } from "@/components/admin-layout";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface SystemContentItem {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  contentAr: string;
  contentEn: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

function EditorToolbar({ editor }: { editor: any }) {
  if (!editor) return null;

  const setLink = () => {
    const url = window.prompt("URL:");
    if (url) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }
  };

  return (
    <div
      className="flex flex-wrap items-center gap-0.5 p-2 border-b bg-muted/30"
      dir="ltr"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={
          editor.isActive("bold") ? "bg-accent text-accent-foreground" : ""
        }
        onClick={() => editor.chain().focus().toggleBold().run()}
        data-testid="editor-bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={
          editor.isActive("italic") ? "bg-accent text-accent-foreground" : ""
        }
        onClick={() => editor.chain().focus().toggleItalic().run()}
        data-testid="editor-italic"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={
          editor.isActive("underline") ? "bg-accent text-accent-foreground" : ""
        }
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        data-testid="editor-underline"
      >
        <UnderlineIcon className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={
          editor.isActive("strike") ? "bg-accent text-accent-foreground" : ""
        }
        onClick={() => editor.chain().focus().toggleStrike().run()}
        data-testid="editor-strike"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={
          editor.isActive("heading", { level: 1 })
            ? "bg-accent text-accent-foreground"
            : ""
        }
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        data-testid="editor-h1"
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={
          editor.isActive("heading", { level: 2 })
            ? "bg-accent text-accent-foreground"
            : ""
        }
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        data-testid="editor-h2"
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={
          editor.isActive("heading", { level: 3 })
            ? "bg-accent text-accent-foreground"
            : ""
        }
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        data-testid="editor-h3"
      >
        <Heading3 className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={
          editor.isActive({ textAlign: "left" })
            ? "bg-accent text-accent-foreground"
            : ""
        }
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        data-testid="editor-align-left"
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={
          editor.isActive({ textAlign: "center" })
            ? "bg-accent text-accent-foreground"
            : ""
        }
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        data-testid="editor-align-center"
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={
          editor.isActive({ textAlign: "right" })
            ? "bg-accent text-accent-foreground"
            : ""
        }
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        data-testid="editor-align-right"
      >
        <AlignRight className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={
          editor.isActive("bulletList")
            ? "bg-accent text-accent-foreground"
            : ""
        }
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        data-testid="editor-bullet-list"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={
          editor.isActive("orderedList")
            ? "bg-accent text-accent-foreground"
            : ""
        }
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        data-testid="editor-ordered-list"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={
          editor.isActive("blockquote")
            ? "bg-accent text-accent-foreground"
            : ""
        }
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        data-testid="editor-blockquote"
      >
        <Quote className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        data-testid="editor-hr"
      >
        <Minus className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={
          editor.isActive("link") ? "bg-accent text-accent-foreground" : ""
        }
        onClick={setLink}
        data-testid="editor-link"
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
      {editor.isActive("link") && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().unsetLink().run()}
          data-testid="editor-unlink"
        >
          <Unlink className="h-4 w-4" />
        </Button>
      )}

      <Separator orientation="vertical" className="h-6 mx-1" />

      <input
        type="color"
        className="h-7 w-7 rounded cursor-pointer border"
        onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
        value={editor.getAttributes("textStyle").color || "#000000"}
        data-testid="editor-color"
      />

      <div className="flex-1" />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        data-testid="editor-undo"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        data-testid="editor-redo"
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );
}

function RichTextEditor({
  content,
  onChange,
  dir: textDir,
  editorKey,
}: {
  content: string;
  onChange: (html: string) => void;
  dir: "rtl" | "ltr";
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
        TextAlign.configure({
          types: ["heading", "paragraph"],
        }),
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
      <div
        dir={textDir}
        className="prose prose-sm dark:prose-invert max-w-none"
      >
        <EditorContent
          editor={editor}
          className="min-h-[300px] p-4 focus-within:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[280px]"
        />
      </div>
    </div>
  );
}

export default function SystemContentPage() {
  const { t, language, dir } = useLanguage();
  const isRTL = dir === "rtl";
  const { toast } = useToast();

  const [selectedId, setSelectedId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"ar" | "en">("ar");
  const [contentAr, setContentAr] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [isActive, setIsActive] = useState(true);

  const { data, isLoading } = useQuery<{
    success: boolean;
    data: SystemContentItem[];
  }>({
    queryKey: ["/api/system-content"],
  });

  const items = data?.data || [];

  const selectedItem = items.find((item) => item.id === selectedId);

  useEffect(() => {
    if (selectedItem) {
      setContentAr(selectedItem.contentAr);
      setContentEn(selectedItem.contentEn);
      setIsActive(selectedItem.isActive);
      setActiveTab(isRTL ? "ar" : "en");
    }
  }, [selectedId, selectedItem?.id]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest("PUT", `/api/system-content/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/system-content"] });
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
    updateMutation.mutate({
      id: selectedItem.id,
      data: { contentAr, contentEn, isActive },
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
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div className="w-full sm:w-80 space-y-2">
                <Label>{isRTL ? "اختر المحتوى" : "Select Content"}</Label>
                <Select value={selectedId} onValueChange={setSelectedId}>
                  <SelectTrigger data-testid="select-content">
                    <SelectValue
                      placeholder={
                        isRTL
                          ? "اختر المحتوى للتعديل..."
                          : "Choose a Content to edit..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoading ? (
                      <SelectItem value="__loading" disabled>
                        {isRTL ? "جارٍ التحميل..." : "Loading..."}
                      </SelectItem>
                    ) : items.length === 0 ? (
                      <SelectItem value="__empty" disabled>
                        {isRTL ? "لا توجد صفحات" : "No pages available"}
                      </SelectItem>
                    ) : (
                      items.map((item) => (
                        <SelectItem
                          key={item.id}
                          value={item.id}
                          data-testid={`option-page-${item.id}`}
                        >
                          {isRTL ? item.titleAr : item.titleEn}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* {selectedItem && (
                <div className="flex items-center gap-3">
                  <Switch
                    checked={isActive}
                    onCheckedChange={setIsActive}
                    data-testid="switch-is-active"
                  />
                  <Label className="text-sm">
                    {isRTL
                      ? "نشط (مرئي للمستخدمين)"
                      : "Active (visible to users)"}
                  </Label>
                </div>
              )} */}
            </div>

            {selectedItem && (
              <>
                <Separator />

                <Tabs
                  value={activeTab}
                  onValueChange={(v) => setActiveTab(v as "ar" | "en")}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="ar" data-testid="tab-content-ar">
                      {isRTL ? "المحتوى بالعربية" : "Arabic Content"}
                    </TabsTrigger>
                    <TabsTrigger value="en" data-testid="tab-content-en">
                      {isRTL ? "المحتوى بالإنجليزية" : "English Content"}
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="ar" className="mt-4">
                    <RichTextEditor
                      editorKey={`ar-${selectedItem.id}`}
                      content={contentAr}
                      onChange={setContentAr}
                      dir="rtl"
                    />
                  </TabsContent>
                  <TabsContent value="en" className="mt-4">
                    <RichTextEditor
                      editorKey={`en-${selectedItem.id}`}
                      content={contentEn}
                      onChange={setContentEn}
                      dir="ltr"
                    />
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    data-testid="button-save-content"
                  >
                    <Save className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                    {updateMutation.isPending
                      ? isRTL
                        ? "جارٍ الحفظ..."
                        : "Saving..."
                      : isRTL
                        ? "حفظ التغييرات"
                        : "Save Changes"}
                  </Button>
                </div>
              </>
            )}

            {!selectedItem && !isLoading && (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">
                  {isRTL
                    ? "اختر صفحة من القائمة للتعديل"
                    : "Select a page from the dropdown to edit"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
