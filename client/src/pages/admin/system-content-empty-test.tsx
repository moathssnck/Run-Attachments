import { FileText } from "lucide-react";
import { AdminLayout } from "@/components/admin-layout";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/lib/language-context";

export default function SystemContentEmptyTestPage() {
  const { dir } = useLanguage();
  const isRTL = dir === "rtl";

  return (
    <AdminLayout>
      <div className="p-6 space-y-6" dir={dir}>
        <PageHeader
          title={isRTL ? "اختبار: قائمة فارغة" : "Test: Empty Dropdown State"}
          subtitle={
            isRTL
              ? "صفحة لاختبار حالة عدم وجود نتائج في قائمة محتويات النظام"
              : "Page to test the no-results state of the system content dropdown"
          }
          icon={<FileText className="h-5 w-5" />}
        />

        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 rounded-lg border border-dashed bg-muted/30">
          <Badge variant="outline" className="text-xs">
            {isRTL ? "اختبار" : "Test"}
          </Badge>
          <span>
            {isRTL
              ? "تعرض هذه الصفحة القائمة المنسدلة بدون أي عناصر لاختبار حالة «لا توجد نتائج»"
              : "This page renders the dropdown with no items to test the «no results» state"}
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                {isRTL ? "حالة: لا توجد عناصر" : "State: No Items"}
              </h3>
              <div className="space-y-2">
                <Label>{isRTL ? "اختر المحتوى" : "Select Content"}</Label>
                <Select>
                  <SelectTrigger data-testid="select-content-empty">
                    <SelectValue
                      placeholder={
                        isRTL
                          ? "اختر المحتوى للتعديل..."
                          : "Choose a Content to edit..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__empty" disabled>
                      {isRTL ? "لا توجد صفحات" : "No pages available"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                {isRTL
                  ? "هذا ما يراه المستخدم عندما تكون القائمة فارغة تماماً"
                  : "This is what the user sees when the list is completely empty"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                {isRTL ? "حالة: جارٍ التحميل" : "State: Loading"}
              </h3>
              <div className="space-y-2">
                <Label>{isRTL ? "اختر المحتوى" : "Select Content"}</Label>
                <Select>
                  <SelectTrigger data-testid="select-content-loading">
                    <SelectValue
                      placeholder={
                        isRTL
                          ? "اختر المحتوى للتعديل..."
                          : "Choose a Content to edit..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__loading" disabled>
                      {isRTL ? "جارٍ التحميل..." : "Loading..."}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                {isRTL
                  ? "هذا ما يراه المستخدم أثناء تحميل البيانات"
                  : "This is what the user sees while data is being fetched"}
              </p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                {isRTL
                  ? "حالة: لم يتم الاختيار (الحالة الافتراضية)"
                  : "State: Nothing Selected (Default)"}
              </h3>
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border rounded-lg bg-muted/10">
                <FileText className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">
                  {isRTL
                    ? "اختر صفحة من القائمة للتعديل"
                    : "Select a page from the dropdown to edit"}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {isRTL
                  ? "هذا ما يراه المستخدم قبل اختيار أي عنصر من القائمة"
                  : "This is shown before the user picks anything from the dropdown"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
