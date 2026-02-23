import { useState, useRef, useEffect, useCallback } from "react";
import lotteryLogo from "@assets/logo01_1770900636718.png";
import {
  CreditCard,
  Image,
  Upload,
  X,
  Loader2,
  Save,
  PenTool,
  DollarSign,
  FileImage,
  Eye,
  Sparkles,
  Shield,
  Award,
  BadgeCheck,
  Eraser,
  Check,
  Undo2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { AdminLayout } from "@/components/admin-layout";
import { PageHeader } from "@/components/page-header";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { CardSetting } from "@shared/schema";
import SignatureCanvas from "react-signature-canvas";

function SignaturePadDialog({
  open,
  onOpenChange,
  onSave,
  title,
  description,
  existingSignature,
  t,
  isRTL,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (signatureDataUrl: string) => void;
  title: string;
  description: string;
  existingSignature: string | null;
  t: (key: string) => string;
  isRTL: boolean;
}) {
  const sigCanvasRef = useRef<SignatureCanvas>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    if (open && existingSignature && sigCanvasRef.current) {
      setTimeout(() => {
        sigCanvasRef.current?.fromDataURL(existingSignature);
        setIsEmpty(false);
      }, 100);
    }
    if (open && !existingSignature) {
      setIsEmpty(true);
    }
  }, [open, existingSignature]);

  const handleClear = () => {
    sigCanvasRef.current?.clear();
    setIsEmpty(true);
  };

  const handleSave = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      try {
        const dataUrl = sigCanvasRef.current
          .getTrimmedCanvas()
          .toDataURL("image/png");
        onSave(dataUrl);
        onOpenChange(false);
      } catch {
        const dataUrl = sigCanvasRef.current
          .getCanvas()
          .toDataURL("image/png");
        onSave(dataUrl);
        onOpenChange(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" dir={isRTL ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <PenTool className="h-4 w-4" />
            </div>
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div
            ref={containerRef}
            className="rounded-xl border-2 border-dashed border-primary/30 bg-white dark:bg-gray-50 overflow-hidden relative"
          >
            <SignatureCanvas
              ref={sigCanvasRef}
              penColor="#2563eb"
              minWidth={0.5}
              maxWidth={1.5}
              clearOnResize={false}
              canvasProps={{
                className: "w-full cursor-crosshair",
                style: { width: "100%", height: "200px" },
              }}
              onBegin={() => setIsEmpty(false)}
            />
            {isEmpty && !existingSignature && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-muted-foreground/40 text-sm font-medium">
                  {isRTL ? "وقّع هنا..." : "Sign here..."}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="gap-1.5"
            >
              <Eraser className="h-3.5 w-3.5" />
              {isRTL ? "مسح" : "Clear"}
            </Button>
            <p className="text-xs text-muted-foreground">
              {isRTL
                ? "ارسم توقيعك باستخدام الماوس أو اللمس"
                : "Draw your signature using mouse or touch"}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {isRTL ? "إلغاء" : "Cancel"}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isEmpty && !existingSignature}
            className="gap-1.5"
          >
            <Check className="h-4 w-4" />
            {isRTL ? "حفظ التوقيع" : "Save Signature"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ImageUploadField({
  label,
  description,
  value,
  onChange,
  onRemove,
  t,
  compact,
}: {
  label: string;
  description: string;
  value: string | null;
  onChange: (base64: string) => void;
  onRemove: () => void;
  t: (key: string) => string;
  compact?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold">{label}</Label>
      <p className="text-xs text-muted-foreground">{description}</p>
      {value ? (
        <div className="relative group rounded-xl border-2 border-primary/20 overflow-hidden bg-muted/30">
          <img
            src={value}
            alt={label}
            className={`w-full object-contain p-2 ${compact ? "h-32" : "h-48"}`}
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              {t("cardSettings.changeImage")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${compact ? "p-5" : "p-8"} ${
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5"
          }`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <div
            className={`mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center ${compact ? "h-10 w-10" : "h-12 w-12"}`}
          >
            <Upload
              className={`text-primary ${compact ? "h-5 w-5" : "h-6 w-6"}`}
            />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {t("cardSettings.dragOrClick")}
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            {t("cardSettings.imageFormats")}
          </p>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function SignatureSection({
  icon: Icon,
  iconColor,
  title,
  description,
  signatureLabel,
  signatureDesc,
  signatureValue,
  onSignatureChange,
  onSignatureRemove,
  name,
  nameLabel,
  namePlaceholder,
  onNameChange,
  titleValue,
  titleLabel,
  titlePlaceholder,
  onTitleChange,
  t,
}: {
  icon: any;
  iconColor: string;
  title: string;
  description: string;
  signatureLabel: string;
  signatureDesc: string;
  signatureValue: string | null;
  onSignatureChange: (val: string) => void;
  onSignatureRemove: () => void;
  name: string;
  nameLabel: string;
  namePlaceholder: string;
  onNameChange: (val: string) => void;
  titleValue: string;
  titleLabel: string;
  titlePlaceholder: string;
  onTitleChange: (val: string) => void;
  t: (key: string) => string;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className={`bg-gradient-to-l ${iconColor} border-b`}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/90 shadow-md">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">{title}</CardTitle>
            <CardDescription className="text-sm mt-1">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 space-y-5">
        <ImageUploadField
          label={signatureLabel}
          description={signatureDesc}
          value={signatureValue}
          onChange={onSignatureChange}
          onRemove={onSignatureRemove}
          t={t}
          compact
        />

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <BadgeCheck className="h-3.5 w-3.5 text-primary" />
              {nameLabel}
            </Label>
            <Input
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder={namePlaceholder}
              className="h-11 bg-muted/50 border-muted-foreground/20 rounded-lg"
              dir="rtl"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Award className="h-3.5 w-3.5 text-primary" />
              {titleLabel}
            </Label>
            <Input
              value={titleValue}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder={titlePlaceholder}
              className="h-11 bg-muted/50 border-muted-foreground/20 rounded-lg"
              dir="rtl"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LotteryTicketPreview({
  formData,
  language,
  isRTL,
  t,
  ticketData,
  onTicketDataChange,
  onSignClick,
}: {
  formData: any;
  language: string;
  isRTL: boolean;
  t: (key: string) => string;
  ticketData: TicketPreviewData;
  onTicketDataChange: (data: Partial<TicketPreviewData>) => void;
  onSignClick: (type: "manager" | "chairman") => void;
}) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");

  const startEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setTempValue(currentValue);
  };

  const saveEdit = () => {
    if (editingField) {
      onTicketDataChange({ [editingField]: tempValue });
      setEditingField(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") saveEdit();
    if (e.key === "Escape") setEditingField(null);
  };

  const EditableText = ({
    field,
    value,
    className,
    inputClassName,
  }: {
    field: string;
    value: string;
    className?: string;
    inputClassName?: string;
  }) => {
    if (editingField === field) {
      return (
        <input
          autoFocus
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={handleKeyDown}
          className={`bg-transparent border-b border-blue-400 outline-none text-center ${inputClassName || className || ""}`}
          dir="auto"
        />
      );
    }
    return (
      <span
        onClick={() => startEdit(field, value)}
        className={`cursor-pointer hover:bg-yellow-200/30 hover:outline hover:outline-1 hover:outline-dashed hover:outline-yellow-500 rounded px-0.5 transition-all ${className || ""}`}
        title={isRTL ? "انقر للتعديل" : "Click to edit"}
      >
        {value}
      </span>
    );
  };

  return (
    <div className="rounded-xl border-2 border-primary/20 overflow-hidden shadow-xl bg-white" dir="rtl">
      <div
        className="relative"
        style={{
          backgroundImage: formData.backgroundImage
            ? `url(${formData.backgroundImage})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="bg-gradient-to-b from-emerald-700 via-emerald-600 to-emerald-700 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <img src={lotteryLogo} alt="Logo" className="h-9 w-9 object-contain drop-shadow-md" />
            <div className="bg-emerald-800/50 rounded-md px-2 py-0.5">
              <EditableText
                field="priceAr"
                value={ticketData.priceAr}
                className="text-white font-bold text-sm"
              />
            </div>
          </div>

          <div className="text-center flex-1">
            <EditableText
              field="titleAr"
              value={ticketData.titleAr}
              className="text-white font-bold text-base block"
            />
            <EditableText
              field="titleEn"
              value={ticketData.titleEn}
              className="text-white/90 text-[10px] block"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <div className="bg-emerald-800/50 rounded-md px-2 py-0.5">
              <EditableText
                field="priceEn"
                value={ticketData.priceEn}
                className="text-white font-bold text-sm"
              />
            </div>
            <img src={lotteryLogo} alt="Logo" className="h-9 w-9 object-contain drop-shadow-md" />
          </div>
        </div>

        <div className={`p-3 space-y-2 ${!formData.backgroundImage ? "bg-gradient-to-b from-green-50/80 via-white to-green-50/50" : "bg-white/85 backdrop-blur-sm"}`}>
          <div className="flex items-center justify-between gap-2">
            <div className="text-start space-y-0.5">
              <p className="text-[9px] text-gray-500">
                <EditableText field="serialLabel" value={ticketData.serialLabel} className="text-[9px] text-gray-500" />
              </p>
              <p className="text-[10px] font-mono font-bold text-gray-700">
                <EditableText field="serialNumber" value={ticketData.serialNumber} className="text-[10px] font-mono font-bold text-gray-700" />
              </p>
            </div>

            <div className="text-center flex-1">
              <div className="bg-gradient-to-l from-emerald-50 via-white to-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 inline-block shadow-sm">
                <EditableText
                  field="prizeAmount"
                  value={ticketData.prizeAmount}
                  className="text-2xl font-extrabold text-emerald-700 block"
                />
                <EditableText
                  field="prizeCurrency"
                  value={ticketData.prizeCurrency}
                  className="text-[10px] font-bold text-emerald-600 block"
                />
              </div>
            </div>

            <div className="text-end space-y-0.5">
              <p className="text-[9px] text-gray-500">
                <EditableText field="issueLabel" value={ticketData.issueLabel} className="text-[9px] text-gray-500" />
              </p>
              <p className="text-[10px] font-bold text-gray-700">
                <EditableText field="issueNumber" value={ticketData.issueNumber} className="text-[10px] font-bold text-gray-700" />
              </p>
            </div>
          </div>

          {formData.topbarImage && (
            <div className="flex justify-center">
              <img src={formData.topbarImage} alt="Card Image" className="h-14 w-auto object-contain rounded opacity-80" />
            </div>
          )}

          <div className="text-center">
            <p className="text-[9px] text-gray-500 leading-relaxed">
              <EditableText
                field="description"
                value={ticketData.description || formData.imageDescription || "وصف البطاقة"}
                className="text-[9px] text-gray-500"
              />
            </p>
          </div>

          <div className="flex items-center justify-between gap-2 text-[9px] text-gray-500">
            <div>
              <EditableText field="drawDateLabel" value={ticketData.drawDateLabel} className="text-[9px] text-gray-500" />:{" "}
              <EditableText field="drawDate" value={ticketData.drawDate} className="text-[9px] font-bold text-gray-700" />
            </div>
            <div>
              <EditableText field="issueDateLabel" value={ticketData.issueDateLabel} className="text-[9px] text-gray-500" />:{" "}
              <EditableText field="issueDate" value={ticketData.issueDate} className="text-[9px] font-bold text-gray-700" />
            </div>
          </div>

          <div className="border-t border-dashed border-emerald-300 pt-2">
            <div className="flex items-end justify-between gap-2">
              <div
                className="text-center cursor-pointer group flex-1"
                onClick={() => onSignClick("manager")}
                title={isRTL ? "انقر للتوقيع" : "Click to sign"}
              >
                {formData.managerSignature ? (
                  <div className="relative inline-block">
                    <img src={formData.managerSignature} alt="Signature" className="h-8 w-auto object-contain mx-auto" />
                    <div className="absolute inset-0 bg-blue-100/30 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                      <PenTool className="h-3 w-3 text-blue-600" />
                    </div>
                  </div>
                ) : (
                  <div className="h-8 w-16 mx-auto border-b border-dashed border-gray-400 flex items-end justify-center group-hover:border-blue-500 transition-colors">
                    <PenTool className="h-2.5 w-2.5 text-gray-400 mb-0.5 group-hover:text-blue-500" />
                  </div>
                )}
                <p className="text-[8px] font-bold text-gray-700 mt-0.5">
                  {formData.managerName || "اسم المدير"}
                </p>
                <p className="text-[7px] text-gray-500">
                  {formData.managerTitle || "مدير اليانصيب الخيري"}
                </p>
              </div>

              <div className="flex-shrink-0 flex items-center gap-1 px-2">
                <img src={lotteryLogo} alt="Logo" className="h-7 w-7 object-contain" />
              </div>

              <div
                className="text-center cursor-pointer group flex-1"
                onClick={() => onSignClick("chairman")}
                title={isRTL ? "انقر للتوقيع" : "Click to sign"}
              >
                {formData.chairmanSignature ? (
                  <div className="relative inline-block">
                    <img src={formData.chairmanSignature} alt="Chairman Signature" className="h-8 w-auto object-contain mx-auto" />
                    <div className="absolute inset-0 bg-blue-100/30 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                      <PenTool className="h-3 w-3 text-blue-600" />
                    </div>
                  </div>
                ) : (
                  <div className="h-8 w-16 mx-auto border-b border-dashed border-gray-400 flex items-end justify-center group-hover:border-blue-500 transition-colors">
                    <PenTool className="h-2.5 w-2.5 text-gray-400 mb-0.5 group-hover:text-blue-500" />
                  </div>
                )}
                <p className="text-[8px] font-bold text-gray-700 mt-0.5">
                  {formData.chairmanName || "اسم رئيس اللجنة"}
                </p>
                <p className="text-[7px] text-gray-500">
                  {formData.chairmanTitle || "رئيس اللجنة الوطنية"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-emerald-700 rounded-md px-2 py-1 text-center">
            <p className="text-[8px] text-white/90">
              <EditableText
                field="footerText"
                value={ticketData.footerText}
                className="text-[8px] text-white/90"
              />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TicketPreviewData {
  titleAr: string;
  titleEn: string;
  priceAr: string;
  priceEn: string;
  prizeAmount: string;
  prizeCurrency: string;
  serialLabel: string;
  serialNumber: string;
  issueLabel: string;
  issueNumber: string;
  drawDateLabel: string;
  drawDate: string;
  issueDateLabel: string;
  issueDate: string;
  description: string;
  footerText: string;
}

export default function CardSettingsPage() {
  const { t, dir, language } = useLanguage();
  const isRTL = dir === "rtl";
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    topbarImage: null as string | null,
    backgroundImage: null as string | null,
    imageDescription: "",
    imageDescriptionEn: "",
    cardPrice: "5.00",
    managerSignature: null as string | null,
    managerName: "",
    managerNameEn: "",
    managerTitle: "",
    managerTitleEn: "",
    chairmanSignature: null as string | null,
    chairmanName: "",
    chairmanNameEn: "",
    chairmanTitle: "",
    chairmanTitleEn: "",
  });

  const [ticketData, setTicketData] = useState<TicketPreviewData>({
    titleAr: "اليانصيب الخيري الأردني",
    titleEn: "Jordanian Charity Lottery",
    priceAr: "٥ د.أ",
    priceEn: "5 J.D",
    prizeAmount: "50,000",
    prizeCurrency: "دينار أردني",
    serialLabel: "الرقم التسلسلي",
    serialNumber: "A-00001",
    issueLabel: "رقم الإصدار",
    issueNumber: "2025/1",
    drawDateLabel: "تاريخ السحب",
    drawDate: "20/3/2025",
    issueDateLabel: "تاريخ الإصدار",
    issueDate: "8/2/2025",
    description: "",
    footerText: "الأوراق النقدية الفائزة · المطالبة بكشف جديد · من الأوراق المالية الأردنية الحكومية",
  });

  const handleTicketDataChange = (changes: Partial<TicketPreviewData>) => {
    setTicketData((prev) => ({ ...prev, ...changes }));
  };

  const [signaturePadOpen, setSignaturePadOpen] = useState<"manager" | "chairman" | null>(null);

  const { data: cardSettingsRes, isLoading } = useQuery({
    queryKey: ["/api/admin/card-settings"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/card-settings");
      return res.json();
    },
  });

  useEffect(() => {
    if (cardSettingsRes?.data) {
      const s = cardSettingsRes.data;
      setFormData({
        topbarImage: s.topbarImage || null,
        backgroundImage: s.backgroundImage || null,
        imageDescription: s.imageDescription || "",
        imageDescriptionEn: s.imageDescriptionEn || "",
        cardPrice: s.cardPrice || "5.00",
        managerSignature: s.managerSignature || null,
        managerName: s.managerName || "",
        managerNameEn: s.managerNameEn || "",
        managerTitle: s.managerTitle || "",
        managerTitleEn: s.managerTitleEn || "",
        chairmanSignature: s.chairmanSignature || null,
        chairmanName: s.chairmanName || "",
        chairmanNameEn: s.chairmanNameEn || "",
        chairmanTitle: s.chairmanTitle || "",
        chairmanTitleEn: s.chairmanTitleEn || "",
      });
    }
  }, [cardSettingsRes]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("PATCH", "/api/admin/card-settings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/card-settings"] });
      toast({
        title: t("cardSettings.saved"),
        description: t("cardSettings.savedDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("cardSettings.saveFailed"),
        description: t("cardSettings.saveFailedDesc"),
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6" dir={dir}>
        <PageHeader
          title={t("cardSettings.title")}
          subtitle={t("cardSettings.subtitle")}
          icon={<CreditCard className="h-5 w-5" />}
          actions={
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="h-11 btn-premium shadow-lg shadow-primary/25"
            >
              {saveMutation.isPending ? (
                <Loader2
                  className={`h-4 w-4 animate-spin ${isRTL ? "ml-2" : "mr-2"}`}
                />
              ) : (
                <Save className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
              )}
              {saveMutation.isPending
                ? t("cardSettings.saving")
                : t("cardSettings.saveChanges")}
            </Button>
          }
        />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-l from-primary/5 to-transparent border-b">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                    <FileImage className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold">
                      {t("cardSettings.imagesSection")}
                    </CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {t("cardSettings.imagesSectionDesc")}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <ImageUploadField
                    label={t("cardSettings.topbarImage")}
                    description={t("cardSettings.topbarImageDesc")}
                    value={formData.topbarImage}
                    onChange={(val) =>
                      setFormData((p) => ({ ...p, topbarImage: val }))
                    }
                    onRemove={() =>
                      setFormData((p) => ({ ...p, topbarImage: null }))
                    }
                    t={t}
                  />
                  <ImageUploadField
                    label={t("cardSettings.backgroundImage")}
                    description={t("cardSettings.backgroundImageDesc")}
                    value={formData.backgroundImage}
                    onChange={(val) =>
                      setFormData((p) => ({ ...p, backgroundImage: val }))
                    }
                    onRemove={() =>
                      setFormData((p) => ({ ...p, backgroundImage: null }))
                    }
                    t={t}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    {t("cardSettings.imageDescription")}
                  </Label>
                  <Textarea
                    value={formData.imageDescription}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        imageDescription: e.target.value,
                      }))
                    }
                    placeholder={t("cardSettings.imageDescPlaceholder")}
                    className="min-h-[80px] bg-muted/50 border-muted-foreground/20 rounded-lg resize-none"
                    dir="rtl"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-l from-amber-500/5 to-transparent border-b">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold">
                      {t("cardSettings.pricingSection")}
                    </CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {t("cardSettings.pricingSectionDesc")}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                  <div className="flex-1 space-y-2">
                    <Label className="text-sm font-semibold">
                      {t("cardSettings.cardPrice")}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t("cardSettings.cardPriceDesc")}
                    </p>
                    <div className="relative max-w-[200px]">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.cardPrice}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            cardPrice: e.target.value,
                          }))
                        }
                        className="h-12 bg-white dark:bg-background border-amber-300 dark:border-amber-500/30 rounded-lg text-xl font-bold pe-16 text-center"
                      />
                      <span className="absolute top-1/2 -translate-y-1/2 end-4 text-sm font-bold text-amber-600 dark:text-amber-400">
                        {t("cardSettings.currency")}
                      </span>
                    </div>
                  </div>
                  <div className="hidden md:flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-500/20 font-bold text-primary">
                    JOD
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SignatureSection
                icon={PenTool}
                iconColor="from-primary/5 to-transparent"
                title={t("cardSettings.managerSection")}
                description={t("cardSettings.managerSectionDesc")}
                signatureLabel={t("cardSettings.managerSignature")}
                signatureDesc={t("cardSettings.managerSignatureDesc")}
                signatureValue={formData.managerSignature}
                onSignatureChange={(val) =>
                  setFormData((p) => ({ ...p, managerSignature: val }))
                }
                onSignatureRemove={() =>
                  setFormData((p) => ({ ...p, managerSignature: null }))
                }
                name={formData.managerName}
                nameLabel={t("cardSettings.managerName")}
                namePlaceholder={t("cardSettings.managerNamePlaceholder")}
                onNameChange={(val) =>
                  setFormData((p) => ({ ...p, managerName: val }))
                }
                titleValue={formData.managerTitle}
                titleLabel={t("cardSettings.managerTitle")}
                titlePlaceholder={t("cardSettings.managerTitlePlaceholder")}
                onTitleChange={(val) =>
                  setFormData((p) => ({ ...p, managerTitle: val }))
                }
                t={t}
              />

              <SignatureSection
                icon={Shield}
                iconColor="from-primary/5 to-transparent"
                title={t("cardSettings.chairmanSection")}
                description={t("cardSettings.chairmanSectionDesc")}
                signatureLabel={t("cardSettings.chairmanSignature")}
                signatureDesc={t("cardSettings.chairmanSignatureDesc")}
                signatureValue={formData.chairmanSignature}
                onSignatureChange={(val) =>
                  setFormData((p) => ({ ...p, chairmanSignature: val }))
                }
                onSignatureRemove={() =>
                  setFormData((p) => ({ ...p, chairmanSignature: null }))
                }
                name={formData.chairmanName}
                nameLabel={t("cardSettings.chairmanName")}
                namePlaceholder={t("cardSettings.chairmanNamePlaceholder")}
                onNameChange={(val) =>
                  setFormData((p) => ({ ...p, chairmanName: val }))
                }
                titleValue={formData.chairmanTitle}
                titleLabel={t("cardSettings.chairmanTitle")}
                titlePlaceholder={t("cardSettings.chairmanTitlePlaceholder")}
                onTitleChange={(val) =>
                  setFormData((p) => ({ ...p, chairmanTitle: val }))
                }
                t={t}
              />
            </div>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-20 overflow-hidden">
              <CardHeader className="bg-gradient-to-l from-primary/5 to-transparent border-b">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                    <Eye className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">
                      {t("cardSettings.preview")}
                    </CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {t("cardSettings.previewDesc")}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-5">
                <LotteryTicketPreview
                  formData={formData}
                  language={language}
                  isRTL={isRTL}
                  t={t}
                  ticketData={ticketData}
                  onTicketDataChange={handleTicketDataChange}
                  onSignClick={(type) => setSignaturePadOpen(type)}
                />

                <Separator />

                <p className="text-xs text-muted-foreground text-center font-medium">
                  {isRTL ? "معاينة البطاقة المبسطة" : "Simplified Card Preview"}
                </p>

                <div
                  className="rounded-xl border-2 border-primary/20 overflow-hidden shadow-xl"
                  style={{
                    backgroundImage: formData.backgroundImage
                      ? `url(${formData.backgroundImage})`
                      : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {formData.topbarImage ? (
                    <img
                      src={formData.topbarImage}
                      alt="Topbar"
                      className="w-full h-16 object-cover"
                    />
                  ) : (
                    <div className="w-full h-16 bg-gradient-to-l from-primary via-primary/90 to-primary/80 flex items-center justify-center gap-2">
                      <Sparkles className="h-4 w-4 text-white/70" />
                      <span className="text-white font-bold text-sm">
                        {isRTL
                          ? "اليانصيب الخيري الأردني"
                          : "Jordan Charity Lottery"}
                      </span>
                      <Sparkles className="h-4 w-4 text-white/70" />
                    </div>
                  )}

                  <div
                    className={`p-4 space-y-3 ${!formData.backgroundImage ? "bg-card" : "bg-card/90 backdrop-blur-sm"}`}
                  >
                    <div className="text-center space-y-1">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {language === "ar"
                          ? formData.imageDescription || "وصف البطاقة"
                          : formData.imageDescriptionEn || "Card description"}
                      </p>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-primary/5">
                      <span className="text-xs font-medium text-muted-foreground">
                        {t("cardSettings.cardPrice")}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-base font-bold text-primary border-primary/30 bg-primary/10 px-3 py-1"
                      >
                        {formData.cardPrice} {t("cardSettings.currency")}
                      </Badge>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div
                        className="flex items-end justify-between gap-2 p-2 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer group border border-transparent hover:border-primary/20"
                        onClick={() => setSignaturePadOpen("manager")}
                        title={isRTL ? "انقر للتوقيع" : "Click to sign"}
                      >
                        <div className="text-start">
                          <p className="text-xs font-bold">
                            {formData.managerName ||
                              (language === "ar"
                                ? "اسم المدير"
                                : "Manager Name")}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {formData.managerTitle ||
                              (language === "ar" ? "المسمى الوظيفي" : "Title")}
                          </p>
                        </div>
                        {formData.managerSignature ? (
                          <div className="relative">
                            <img
                              src={formData.managerSignature}
                              alt="Signature"
                              className="h-10 w-auto object-contain"
                            />
                            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                              <PenTool className="h-3 w-3 text-primary" />
                            </div>
                          </div>
                        ) : (
                          <div className="h-10 w-20 border-b-2 border-dashed border-primary/30 flex items-end justify-center group-hover:border-primary/60 transition-colors">
                            <PenTool className="h-3 w-3 text-primary/40 mb-1 group-hover:text-primary transition-colors" />
                          </div>
                        )}
                      </div>

                      <div
                        className="flex items-end justify-between gap-2 p-2 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer group border border-transparent hover:border-primary/20"
                        onClick={() => setSignaturePadOpen("chairman")}
                        title={isRTL ? "انقر للتوقيع" : "Click to sign"}
                      >
                        <div className="text-start">
                          <p className="text-xs font-bold">
                            {formData.chairmanName ||
                              (language === "ar"
                                ? "اسم رئيس اللجنة"
                                : "Chairman Name")}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {formData.chairmanTitle ||
                              (language === "ar"
                                ? "رئيس اللجنة الوطنية"
                                : "National Committee Chairman")}
                          </p>
                        </div>
                        {formData.chairmanSignature ? (
                          <div className="relative">
                            <img
                              src={formData.chairmanSignature}
                              alt="Chairman Signature"
                              className="h-10 w-auto object-contain"
                            />
                            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                              <PenTool className="h-3 w-3 text-primary" />
                            </div>
                          </div>
                        ) : (
                          <div className="h-10 w-20 border-b-2 border-dashed border-primary/30 flex items-end justify-center group-hover:border-primary/60 transition-colors">
                            <PenTool className="h-3 w-3 text-primary/40 mb-1 group-hover:text-primary transition-colors" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <SignaturePadDialog
          open={signaturePadOpen === "manager"}
          onOpenChange={(open) => !open && setSignaturePadOpen(null)}
          onSave={(dataUrl) =>
            setFormData((p) => ({ ...p, managerSignature: dataUrl }))
          }
          title={isRTL ? "توقيع مدير اليانصيب" : "Lottery Manager Signature"}
          description={
            isRTL
              ? "ارسم توقيع مدير اليانصيب الخيري"
              : "Draw the charity lottery manager signature"
          }
          existingSignature={formData.managerSignature}
          t={t}
          isRTL={isRTL}
        />

        <SignaturePadDialog
          open={signaturePadOpen === "chairman"}
          onOpenChange={(open) => !open && setSignaturePadOpen(null)}
          onSave={(dataUrl) =>
            setFormData((p) => ({ ...p, chairmanSignature: dataUrl }))
          }
          title={
            isRTL
              ? "توقيع رئيس اللجنة الوطنية"
              : "National Committee Chairman Signature"
          }
          description={
            isRTL
              ? "ارسم توقيع رئيس اللجنة الوطنية"
              : "Draw the national committee chairman signature"
          }
          existingSignature={formData.chairmanSignature}
          t={t}
          isRTL={isRTL}
        />
      </div>
    </AdminLayout>
  );
}
