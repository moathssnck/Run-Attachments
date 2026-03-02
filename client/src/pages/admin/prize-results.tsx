"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  FileDown,
  Loader2,
  Pencil,
  Plus,
  Printer,
  Share2,
  Trophy,
} from "lucide-react";
import logoImage from "@assets/logo01_1767784684828.png";
import { AdminLayout } from "@/components/admin-layout";
import { PageHeader } from "@/components/page-header";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PrizeResultRow {
  id: string;
  nameAr: string;
  nameEn: string;
  valueAr: string;
  valueEn: string;
  winningNumbers: string[];
  consolationPrizes?: string[];
  type: "standard" | "ending";
}

interface PrizeRowTemplate {
  id: string;
  type: "standard" | "ending";
  winningNumbersCount: number;
  consolationPrizesCount?: number;
}

const prizeRowTemplates: PrizeRowTemplate[] = [
  { id: "1", type: "standard", winningNumbersCount: 1, consolationPrizesCount: 10 },
  { id: "2", type: "standard", winningNumbersCount: 1, consolationPrizesCount: 10 },
  { id: "3", type: "standard", winningNumbersCount: 1, consolationPrizesCount: 10 },
  { id: "4", type: "standard", winningNumbersCount: 1, consolationPrizesCount: 10 },
  { id: "5", type: "standard", winningNumbersCount: 1, consolationPrizesCount: 10 },
  { id: "6", type: "standard", winningNumbersCount: 1, consolationPrizesCount: 10 },
  { id: "7", type: "standard", winningNumbersCount: 2 },
  { id: "8", type: "standard", winningNumbersCount: 5 },
  { id: "9", type: "standard", winningNumbersCount: 5 },
  { id: "10", type: "standard", winningNumbersCount: 5 },
  { id: "11", type: "standard", winningNumbersCount: 4 },
  { id: "12", type: "standard", winningNumbersCount: 5 },
  { id: "13", type: "standard", winningNumbersCount: 5 },
  { id: "14", type: "standard", winningNumbersCount: 5 },
  { id: "15", type: "ending", winningNumbersCount: 1 },
  { id: "16", type: "ending", winningNumbersCount: 1 },
  { id: "17", type: "ending", winningNumbersCount: 1 },
  { id: "18", type: "ending", winningNumbersCount: 1 },
  { id: "19", type: "ending", winningNumbersCount: 1 },
];

const initialPrizeRows: PrizeResultRow[] = prizeRowTemplates.map((template) => ({
  id: template.id,
  nameAr: "",
  nameEn: "",
  valueAr: "",
  valueEn: "",
  winningNumbers: Array.from({ length: template.winningNumbersCount }, () => ""),
  consolationPrizes: template.consolationPrizesCount
    ? Array.from({ length: template.consolationPrizesCount }, () => "")
    : undefined,
  type: template.type,
}));

const initialCoverPrizes = Array.from({ length: 9 }, () =>
  Array.from({ length: 7 }, () => ""),
);

export default function PrizeResultsPage() {
  const { t, dir } = useLanguage();
  const { toast } = useToast();
  const sheetRef = useRef<HTMLDivElement>(null);
  const isRTL = dir === "rtl";

  const [drawDate, setDrawDate] = useState("");
  const [issueNumber, setIssueNumber] = useState("");
  const [nextDrawDate, setNextDrawDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isHeaderDialogOpen, setIsHeaderDialogOpen] = useState(false);

  const [prizes, setPrizes] = useState<PrizeResultRow[]>(initialPrizeRows);
  const [coverPrizes, setCoverPrizes] = useState(initialCoverPrizes);

  const updatePrize = <K extends keyof PrizeResultRow>(
    id: string,
    field: K,
    value: PrizeResultRow[K],
  ) => {
    setPrizes((currentPrizes) =>
      currentPrizes.map((prize) =>
        prize.id === id ? { ...prize, [field]: value } : prize,
      ),
    );
  };

  const updateWinningNumber = (
    prizeId: string,
    index: number,
    value: string,
  ) => {
    setPrizes((currentPrizes) =>
      currentPrizes.map((prize) => {
        if (prize.id !== prizeId) return prize;
        const winningNumbers = [...prize.winningNumbers];
        winningNumbers[index] = value;
        return { ...prize, winningNumbers };
      }),
    );
  };

  const updateConsolation = (
    prizeId: string,
    index: number,
    value: string,
  ) => {
    setPrizes((currentPrizes) =>
      currentPrizes.map((prize) => {
        if (prize.id !== prizeId || !prize.consolationPrizes) return prize;
        const consolationPrizes = [...prize.consolationPrizes];
        consolationPrizes[index] = value;
        return { ...prize, consolationPrizes };
      }),
    );
  };

  const updateCoverPrize = (
    rowIndex: number,
    columnIndex: number,
    value: string,
  ) => {
    setCoverPrizes((currentGrid) =>
      currentGrid.map((row, currentRowIndex) =>
        currentRowIndex === rowIndex
          ? row.map((cell, currentColumnIndex) =>
              currentColumnIndex === columnIndex ? value : cell,
            )
          : row,
      ),
    );
  };

  const addPrizeRow = () => {
    setPrizes((currentPrizes) => {
      const nextId = String(currentPrizes.length + 1);
      return [
        ...currentPrizes,
        {
          id: nextId,
          nameAr: "",
          nameEn: "",
          valueAr: "",
          valueEn: "",
          winningNumbers: [""],
          type: "standard",
        },
      ];
    });
  };

  const exportToPDF = async () => {
    if (!sheetRef.current) return;
    setIsExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      const isDarkTheme =
        typeof document !== "undefined" &&
        document.documentElement.classList.contains("dark");

      const canvas = await html2canvas(sheetRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: isDarkTheme ? "#111111" : "#ffffff",
        logging: false,
      });

      const imageData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? "landscape" : "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imageData, "PNG", 0, 0, canvas.width, canvas.height);
      const safeDrawDate = drawDate.trim()
        ? drawDate.trim().replace(/\s+/g, "-")
        : "blank";
      pdf.save(`prize-results-${safeDrawDate}.pdf`);

      toast({
        title: t("prizeResults.exportSuccess"),
        description: t("prizeResults.exportSuccessDesc"),
      });
    } catch (_error) {
      toast({
        title: t("common.error"),
        description: t("prizeResults.exportError"),
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: t("prizeResults.title"),
          text: t("prizeResults.description"),
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: t("prizeResults.shareCopied"),
          description: t("prizeResults.shareCopiedDesc"),
        });
      }
    } catch (_error) {
      // Ignore cancelled share requests.
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6" dir={dir}>
        <PageHeader
          title={t("prizeResults.title")}
          subtitle={t("prizeResults.description")}
          icon={<Trophy className="h-5 w-5" />}
          actions={
            <Button variant="outline" className="gap-2" onClick={() => setIsHeaderDialogOpen(true)}>
              <Pencil className="h-4 w-4" />
              {t("prizeResults.editHeader")}
            </Button>
          }
        />

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-[#0a0a0a] md:p-6">
          <div
            ref={sheetRef}
            className="mx-auto max-w-6xl overflow-hidden rounded-xl border border-zinc-200 bg-white text-zinc-900 shadow-2xl dark:border-zinc-800 dark:bg-[#111111] dark:text-zinc-100"
          >
            <header
              dir="ltr"
              className="flex flex-col items-center justify-between gap-6 border-b border-zinc-200 p-6 dark:border-zinc-800 md:flex-row"
            >
              <div className="text-left" dir="ltr">
                <h1 className="mb-1 text-2xl font-bold text-emerald-600 dark:text-emerald-500">
                  Jordanian Charity Lottery
                </h1>
                <div
                  dir={isRTL ? "rtl" : "ltr"}
                  className="flex items-center gap-2 text-zinc-700 dark:text-zinc-400"
                >
                  <span>{t("prizeResults.drawDate")}:</span>
                  <Input
                    value={drawDate}
                    onChange={(event) => setDrawDate(event.target.value)}
                    className="h-8 w-36 border-zinc-300 bg-white/80 text-center text-zinc-900 focus-visible:ring-emerald-500 dark:border-zinc-700 dark:bg-transparent dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
                  <img src={logoImage} alt="Lottery Logo" className="h-10 w-10 object-contain opacity-90" />
                </div>
                <span className="text-center text-xs tracking-normal text-zinc-700 dark:text-zinc-500">
                  {t("prizeResults.orgName")}
                </span>
              </div>

              <div
                dir={isRTL ? "rtl" : "ltr"}
                className={isRTL ? "text-right" : "text-left"}
              >
                <h2 className="mb-1 text-2xl font-bold text-emerald-600 dark:text-emerald-500">
                  {t("prizeResults.sheetHeading")}
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {t("prizeResults.issueLabel")}
                  {issueNumber ? ` (${issueNumber})` : ""}
                </p>
                <p className="text-xs text-zinc-600 dark:text-zinc-500">{t("prizeResults.specialEdition")}</p>
              </div>
            </header>

            <div
              data-html2canvas-ignore
              className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-zinc-100/80 px-6 py-3 dark:border-zinc-800 dark:bg-zinc-900/50"
            >
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={exportToPDF}
                  disabled={isExporting}
                  className="text-zinc-700 hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-400"
                >
                  {isExporting ? (
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileDown className="me-2 h-4 w-4" />
                  )}
                  {isExporting ? t("prizeResults.exporting") : t("prizeResults.exportPdf")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.print()}
                  className="text-zinc-700 hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-400"
                >
                  <Printer className="me-2 h-4 w-4" />
                  {t("prizeResults.print")}
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="text-zinc-700 hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-400"
              >
                <Share2 className="me-2 h-4 w-4" />
                {t("prizeResults.share")}
              </Button>
            </div>

            <main className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr
                    className={`border-b border-zinc-200 bg-zinc-100/90 text-[10px] text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-400 ${
                      isRTL ? "tracking-normal" : "uppercase tracking-wider"
                    }`}
                  >
                    <th className="w-1/3 border-r border-zinc-200 p-3 dark:border-zinc-800">
                      {t("prizeResults.consolationColumn")}
                    </th>
                    <th className="w-1/4 border-r border-zinc-200 p-3 dark:border-zinc-800">
                      {t("prizeResults.winningColumn")}
                    </th>
                    <th className="p-3">{t("prizeResults.prizeColumn")}</th>
                  </tr>
                </thead>
                <tbody>
                  {prizes.map((prize) => (
                    <tr
                      key={prize.id}
                      className="group border-b border-zinc-200 transition-colors hover:bg-zinc-100/60 dark:border-zinc-800 dark:hover:bg-zinc-900/30"
                    >
                      <td className="border-r border-zinc-200 p-2 dark:border-zinc-800">
                        {prize.consolationPrizes ? (
                          <div className="grid grid-cols-5 gap-1">
                            {prize.consolationPrizes.map((number, index) => (
                              <Input
                                key={`${prize.id}-consolation-${index}`}
                                value={number}
                                onChange={(event) =>
                                  updateConsolation(prize.id, index, event.target.value)
                                }
                                className="h-7 border-zinc-300 bg-white/80 px-1 py-0.5 text-center text-[10px] text-zinc-700 focus-visible:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-200"
                              />
                            ))}
                          </div>
                        ) : prize.winningNumbers.length > 1 ? (
                          <div className="flex flex-wrap justify-center gap-1">
                            {prize.winningNumbers.map((number, index) => (
                              <Input
                                key={`${prize.id}-secondary-${index}`}
                                value={number}
                                onChange={(event) =>
                                  updateWinningNumber(prize.id, index, event.target.value)
                                }
                                className="h-8 w-20 border-zinc-300 bg-white/80 text-center text-xs text-zinc-700 focus-visible:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-200"
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-xs text-zinc-500 dark:text-zinc-600">—</div>
                        )}
                      </td>

                      <td className="border-r border-zinc-200 p-2 text-center dark:border-zinc-800">
                        {prize.type === "standard" && prize.winningNumbers.length === 1 ? (
                          <Input
                            value={prize.winningNumbers[0]}
                            onChange={(event) =>
                              updateWinningNumber(prize.id, 0, event.target.value)
                            }
                            className="mx-auto h-10 w-full max-w-[132px] border-emerald-500/30 bg-emerald-500/10 text-center text-xl font-bold text-emerald-700 focus-visible:ring-emerald-500 dark:text-emerald-400"
                          />
                        ) : prize.type === "ending" ? (
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-[10px] text-zinc-500">
                              {t("prizeResults.endsWith")}
                            </span>
                            <Input
                              value={prize.winningNumbers[0]}
                              onChange={(event) =>
                                updateWinningNumber(prize.id, 0, event.target.value)
                              }
                              className="h-9 w-16 border-emerald-500/30 bg-emerald-500/10 text-center text-lg font-bold text-emerald-700 focus-visible:ring-emerald-500 dark:text-emerald-400"
                            />
                          </div>
                        ) : (
                          <div className="text-[10px] italic text-zinc-500">
                            {t("prizeResults.multipleNumbers")}
                          </div>
                        )}
                      </td>

                      <td className="p-3">
                        <div className="space-y-2">
                          <Input
                            value={prize.nameAr}
                            onChange={(event) =>
                              updatePrize(prize.id, "nameAr", event.target.value)
                            }
                            dir="rtl"
                            className="h-8 border-zinc-300 bg-transparent text-right text-sm font-bold text-zinc-800 focus-visible:ring-emerald-500 dark:border-zinc-700 dark:text-zinc-200"
                          />
                          <Input
                            value={prize.nameEn}
                            onChange={(event) =>
                              updatePrize(prize.id, "nameEn", event.target.value)
                            }
                            dir="ltr"
                            className="h-8 border-zinc-300 bg-transparent text-left text-xs text-zinc-600 focus-visible:ring-emerald-500 dark:border-zinc-700 dark:text-zinc-500"
                          />
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <Input
                              value={prize.valueAr}
                              onChange={(event) =>
                                updatePrize(prize.id, "valueAr", event.target.value)
                              }
                              dir="rtl"
                              className="h-8 border-zinc-300 bg-transparent text-right text-xs text-zinc-600 focus-visible:ring-emerald-500 dark:border-zinc-700 dark:text-zinc-400"
                            />
                            <Input
                              value={prize.valueEn}
                              onChange={(event) =>
                                updatePrize(prize.id, "valueEn", event.target.value)
                              }
                              dir="ltr"
                              className="h-8 border-zinc-300 bg-transparent text-left text-xs text-zinc-600 focus-visible:ring-emerald-500 dark:border-zinc-700 dark:text-zinc-400"
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </main>

            <section className="border-t border-zinc-200 bg-zinc-100/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/20">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-500">
                  {t("prizeResults.coverPrizes")}
                </h3>
                <span className="text-xs text-zinc-600 dark:text-zinc-500">{t("prizeResults.coverMeta")}</span>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {coverPrizes.map((row, rowIndex) =>
                  row.map((value, columnIndex) => (
                    <Input
                      key={`${rowIndex}-${columnIndex}`}
                      value={value}
                      onChange={(event) =>
                        updateCoverPrize(rowIndex, columnIndex, event.target.value)
                      }
                      className="h-8 border-zinc-300 bg-white/70 p-2 text-center text-xs text-zinc-700 focus-visible:ring-emerald-500 dark:border-zinc-700/60 dark:bg-zinc-800/30 dark:text-zinc-300"
                    />
                  )),
                )}
              </div>
            </section>

            <footer className="border-t border-zinc-200 p-6 text-center text-[10px] text-zinc-600 dark:border-zinc-800 dark:text-zinc-500">
              <p className="mb-2">
                {t("prizeResults.footerNote")}
                {nextDrawDate ? ` ${nextDrawDate}` : ""}
              </p>
              <div className="flex justify-center gap-4">
                <span>LOTTERY.JOR</span>
                <span>@اتحاد الجمعيات الخيرية</span>
              </div>
            </footer>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`fixed bottom-8 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-black shadow-lg transition-colors hover:bg-emerald-400 ${
            isRTL ? "left-8" : "right-8"
          }`}
          onClick={addPrizeRow}
          title={t("prizeResults.addRow")}
        >
          <Plus size={24} />
        </motion.button>

        <Dialog open={isHeaderDialogOpen} onOpenChange={setIsHeaderDialogOpen}>
          <DialogContent dir={dir}>
            <DialogHeader className="text-start">
              <DialogTitle>{t("prizeResults.editHeader")}</DialogTitle>
              <DialogDescription>{t("prizeResults.editHeaderDesc")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="draw-date">{t("prizeResults.drawDate")}</Label>
                <Input
                  id="draw-date"
                  value={drawDate}
                  onChange={(event) => setDrawDate(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="issue-number">{t("prizeResults.issueLabel")}</Label>
                <Input
                  id="issue-number"
                  value={issueNumber}
                  onChange={(event) => setIssueNumber(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="next-draw">{t("prizeResults.nextDrawDate")}</Label>
                <Input
                  id="next-draw"
                  value={nextDrawDate}
                  onChange={(event) => setNextDrawDate(event.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsHeaderDialogOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button onClick={() => setIsHeaderDialogOpen(false)}>
                {t("common.save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
