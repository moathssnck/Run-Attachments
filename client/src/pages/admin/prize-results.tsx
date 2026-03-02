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

const initialPrizeRows: PrizeResultRow[] = [
  {
    id: "1",
    nameAr: "الجائزة الأولى",
    nameEn: "First Prize",
    valueAr: "100000 دينار",
    valueEn: "100000 JOD",
    winningNumbers: ["60638"],
    consolationPrizes: [
      "70638",
      "61638",
      "60738",
      "60648",
      "60639",
      "50638",
      "59638",
      "60538",
      "60628",
      "60637",
    ],
    type: "standard",
  },
  {
    id: "2",
    nameAr: "الجائزة الثانية",
    nameEn: "Second Prize",
    valueAr: "30000 دينار",
    valueEn: "30000 JOD",
    winningNumbers: ["86611"],
    consolationPrizes: [
      "96611",
      "87611",
      "86711",
      "86621",
      "86612",
      "76611",
      "85611",
      "86511",
      "86601",
      "86610",
    ],
    type: "standard",
  },
  {
    id: "3",
    nameAr: "الجائزة الثالثة",
    nameEn: "Third Prize",
    valueAr: "15000 دينار",
    valueEn: "15000 JOD",
    winningNumbers: ["56806"],
    consolationPrizes: [
      "66806",
      "57806",
      "56906",
      "56816",
      "56807",
      "46806",
      "55806",
      "56706",
      "56796",
      "56805",
    ],
    type: "standard",
  },
  {
    id: "4",
    nameAr: "الجائزة الرابعة",
    nameEn: "Fourth Prize",
    valueAr: "8000 دينار",
    valueEn: "8000 JOD",
    winningNumbers: ["79117"],
    consolationPrizes: [
      "89117",
      "70117",
      "79217",
      "79127",
      "79118",
      "69117",
      "78117",
      "79017",
      "79107",
      "79116",
    ],
    type: "standard",
  },
  {
    id: "5",
    nameAr: "الجائزة الخامسة",
    nameEn: "Fifth Prize",
    valueAr: "5000 دينار",
    valueEn: "5000 JOD",
    winningNumbers: ["42097"],
    consolationPrizes: [
      "52097",
      "43097",
      "42197",
      "42007",
      "42098",
      "32097",
      "41097",
      "42997",
      "42087",
      "42096",
    ],
    type: "standard",
  },
  {
    id: "6",
    nameAr: "الجائزة السادسة",
    nameEn: "Sixth Prize",
    valueAr: "3000 دينار",
    valueEn: "3000 JOD",
    winningNumbers: ["47532"],
    consolationPrizes: [
      "57532",
      "48532",
      "47632",
      "47542",
      "47533",
      "37532",
      "46532",
      "47432",
      "47522",
      "47531",
    ],
    type: "standard",
  },
  {
    id: "7",
    nameAr: "الجائزة السابعة",
    nameEn: "Seventh Prize",
    valueAr: "1500 دينار",
    valueEn: "1500 JOD",
    winningNumbers: ["90039", "13790"],
    type: "standard",
  },
  {
    id: "8",
    nameAr: "الجائزة الثامنة",
    nameEn: "Eighth Prize",
    valueAr: "1000 دينار",
    valueEn: "1000 JOD",
    winningNumbers: ["68405", "27064", "28733", "91491", "40261"],
    type: "standard",
  },
  {
    id: "9",
    nameAr: "الجائزة التاسعة",
    nameEn: "Ninth Prize",
    valueAr: "600 دينار",
    valueEn: "600 JOD",
    winningNumbers: ["84026", "87867", "08626", "11276", "58756"],
    type: "standard",
  },
  {
    id: "10",
    nameAr: "الجائزة العاشرة",
    nameEn: "Tenth Prize",
    valueAr: "500 دينار",
    valueEn: "500 JOD",
    winningNumbers: ["97543", "11976", "23647", "07197", "46668"],
    type: "standard",
  },
  {
    id: "11",
    nameAr: "الجائزة الحادية عشر",
    nameEn: "Eleventh Prize",
    valueAr: "400 دينار",
    valueEn: "400 JOD",
    winningNumbers: ["96874", "99543", "98003", "16863"],
    type: "standard",
  },
  {
    id: "12",
    nameAr: "الجائزة الثانية عشر",
    nameEn: "Twelfth Prize",
    valueAr: "300 دينار",
    valueEn: "300 JOD",
    winningNumbers: ["49196", "46845", "39323", "21864", "98213"],
    type: "standard",
  },
  {
    id: "13",
    nameAr: "الجائزة الثالثة عشر",
    nameEn: "Thirteenth Prize",
    valueAr: "200 دينار",
    valueEn: "200 JOD",
    winningNumbers: ["6960", "7248", "2806", "9156", "8517"],
    type: "standard",
  },
  {
    id: "14",
    nameAr: "الجائزة الرابعة عشر",
    nameEn: "Fourteenth Prize",
    valueAr: "150 دينار",
    valueEn: "150 JOD",
    winningNumbers: ["9942", "9200", "2679", "0031", "0381"],
    type: "standard",
  },
  {
    id: "15",
    nameAr: "الجائزة الخامسة عشر",
    nameEn: "Fifteenth Prize",
    valueAr: "100 دينار",
    valueEn: "100 JOD",
    winningNumbers: ["762"],
    type: "ending",
  },
  {
    id: "16",
    nameAr: "الجائزة السادسة عشر",
    nameEn: "Sixteenth Prize",
    valueAr: "75 دينار",
    valueEn: "75 JOD",
    winningNumbers: ["492"],
    type: "ending",
  },
  {
    id: "17",
    nameAr: "الجائزة السابعة عشر",
    nameEn: "Seventeenth Prize",
    valueAr: "40 دينار",
    valueEn: "40 JOD",
    winningNumbers: ["34"],
    type: "ending",
  },
  {
    id: "18",
    nameAr: "الجائزة الثامنة عشر",
    nameEn: "Eighteenth Prize",
    valueAr: "25 دينار",
    valueEn: "25 JOD",
    winningNumbers: ["45"],
    type: "ending",
  },
  {
    id: "19",
    nameAr: "الجائزة التاسعة عشر",
    nameEn: "Nineteenth Prize",
    valueAr: "10 دنانير",
    valueEn: "10 JOD",
    winningNumbers: ["7"],
    type: "ending",
  },
];

const initialCoverPrizes = [
  ["278", "478", "368", "388", "377", "379", "378"],
  ["649", "849", "739", "759", "748", "740", "749"],
  ["918", "118", "008", "028", "017", "019", "018"],
  ["286", "486", "376", "396", "385", "387", "386"],
  ["644", "844", "734", "754", "743", "745", "744"],
  ["801", "001", "991", "911", "900", "902", "901"],
  ["019", "219", "159", "179", "168", "160", "169"],
  ["307", "507", "497", "417", "406", "408", "407"],
  ["667", "867", "757", "777", "766", "768", "767"],
];

export default function PrizeResultsPage() {
  const { t, dir } = useLanguage();
  const { toast } = useToast();
  const sheetRef = useRef<HTMLDivElement>(null);
  const isRTL = dir === "rtl";

  const [drawDate, setDrawDate] = useState("2026 / 1 / 1");
  const [issueNumber, setIssueNumber] = useState("35 / 2025");
  const [nextDrawDate, setNextDrawDate] = useState("2026 / 1 / 10");
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
          nameAr: `${t("prizeResults.newPrize")} ${nextId}`,
          nameEn: `Prize ${nextId}`,
          valueAr: "0 دينار",
          valueEn: "0 JOD",
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

      const canvas = await html2canvas(sheetRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#111111",
        logging: false,
      });

      const imageData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? "landscape" : "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imageData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`prize-results-${drawDate.replace(/\s+/g, "-")}.pdf`);

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

        <div className="rounded-2xl border border-zinc-800 bg-[#0a0a0a] p-4 md:p-6">
          <div
            ref={sheetRef}
            className="mx-auto max-w-6xl overflow-hidden rounded-xl border border-zinc-800 bg-[#111111] text-zinc-100 shadow-2xl"
          >
            <header className="flex flex-col items-center justify-between gap-6 border-b border-zinc-800 p-6 md:flex-row">
              <div className="text-right">
                <h1 className="mb-1 text-2xl font-bold text-emerald-500">
                  Jordanian Charity Lottery
                </h1>
                <div className="flex items-center gap-2 text-zinc-400">
                  <span>{t("prizeResults.drawDate")}:</span>
                  <Input
                    value={drawDate}
                    onChange={(event) => setDrawDate(event.target.value)}
                    className="h-8 w-36 border-zinc-700 bg-transparent text-center text-zinc-100 focus-visible:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
                  <img src={logoImage} alt="Lottery Logo" className="h-10 w-10 object-contain opacity-90" />
                </div>
                <span className="text-center text-xs tracking-wide text-zinc-500">
                  {t("prizeResults.orgName")}
                </span>
              </div>

              <div className={isRTL ? "text-right" : "text-left"}>
                <h2 className="mb-1 text-2xl font-bold text-emerald-500">
                  {t("prizeResults.sheetHeading")}
                </h2>
                <p className="text-sm text-zinc-400">
                  {t("prizeResults.issueLabel")} ({issueNumber})
                </p>
                <p className="text-xs text-zinc-500">{t("prizeResults.specialEdition")}</p>
              </div>
            </header>

            <div
              data-html2canvas-ignore
              className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-900/50 px-6 py-3"
            >
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={exportToPDF}
                  disabled={isExporting}
                  className="text-zinc-300 hover:text-emerald-400"
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
                  className="text-zinc-300 hover:text-emerald-400"
                >
                  <Printer className="me-2 h-4 w-4" />
                  {t("prizeResults.print")}
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="text-zinc-300 hover:text-emerald-400"
              >
                <Share2 className="me-2 h-4 w-4" />
                {t("prizeResults.share")}
              </Button>
            </div>

            <main className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/80 text-[10px] uppercase tracking-wider text-zinc-500">
                    <th className="w-1/3 border-r border-zinc-800 p-3">
                      {t("prizeResults.consolationColumn")}
                    </th>
                    <th className="w-1/4 border-r border-zinc-800 p-3">
                      {t("prizeResults.winningColumn")}
                    </th>
                    <th className="p-3">{t("prizeResults.prizeColumn")}</th>
                  </tr>
                </thead>
                <tbody>
                  {prizes.map((prize) => (
                    <tr
                      key={prize.id}
                      className="group border-b border-zinc-800 transition-colors hover:bg-zinc-900/30"
                    >
                      <td className="border-r border-zinc-800 p-2">
                        {prize.consolationPrizes ? (
                          <div className="grid grid-cols-5 gap-1">
                            {prize.consolationPrizes.map((number, index) => (
                              <Input
                                key={`${prize.id}-consolation-${index}`}
                                value={number}
                                onChange={(event) =>
                                  updateConsolation(prize.id, index, event.target.value)
                                }
                                className="h-7 border-zinc-700 bg-zinc-800/50 px-1 py-0.5 text-center text-[10px] text-zinc-200 focus-visible:ring-emerald-500"
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
                                className="h-8 w-20 border-zinc-700 bg-zinc-800/50 text-center text-xs text-zinc-200 focus-visible:ring-emerald-500"
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-xs text-zinc-600">—</div>
                        )}
                      </td>

                      <td className="border-r border-zinc-800 p-2 text-center">
                        {prize.type === "standard" && prize.winningNumbers.length === 1 ? (
                          <Input
                            value={prize.winningNumbers[0]}
                            onChange={(event) =>
                              updateWinningNumber(prize.id, 0, event.target.value)
                            }
                            className="mx-auto h-10 w-full max-w-[132px] border-emerald-500/30 bg-emerald-500/10 text-center text-xl font-bold text-emerald-400 focus-visible:ring-emerald-500"
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
                              className="h-9 w-16 border-emerald-500/30 bg-emerald-500/10 text-center text-lg font-bold text-emerald-400 focus-visible:ring-emerald-500"
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
                            className="h-8 border-zinc-700 bg-transparent text-right text-sm font-bold text-zinc-200 focus-visible:ring-emerald-500"
                          />
                          <Input
                            value={prize.nameEn}
                            onChange={(event) =>
                              updatePrize(prize.id, "nameEn", event.target.value)
                            }
                            dir="ltr"
                            className="h-8 border-zinc-700 bg-transparent text-left text-xs text-zinc-500 focus-visible:ring-emerald-500"
                          />
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <Input
                              value={prize.valueAr}
                              onChange={(event) =>
                                updatePrize(prize.id, "valueAr", event.target.value)
                              }
                              dir="rtl"
                              className="h-8 border-zinc-700 bg-transparent text-right text-xs text-zinc-400 focus-visible:ring-emerald-500"
                            />
                            <Input
                              value={prize.valueEn}
                              onChange={(event) =>
                                updatePrize(prize.id, "valueEn", event.target.value)
                              }
                              dir="ltr"
                              className="h-8 border-zinc-700 bg-transparent text-left text-xs text-zinc-400 focus-visible:ring-emerald-500"
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </main>

            <section className="border-t border-zinc-800 bg-zinc-900/20 p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-emerald-500">
                  {t("prizeResults.coverPrizes")}
                </h3>
                <span className="text-xs text-zinc-500">{t("prizeResults.coverMeta")}</span>
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
                      className="h-8 border-zinc-700/60 bg-zinc-800/30 p-2 text-center text-xs text-zinc-300 focus-visible:ring-emerald-500"
                    />
                  )),
                )}
              </div>
            </section>

            <footer className="border-t border-zinc-800 p-6 text-center text-[10px] text-zinc-600">
              <p className="mb-2">{t("prizeResults.footerNote")} {nextDrawDate}</p>
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
