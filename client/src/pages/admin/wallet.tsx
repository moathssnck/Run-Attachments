"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  Wallet,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/language-context";
import { AdminLayout } from "@/components/admin-layout";
import { useForm } from "react-hook-form";
import { PageHeader } from "@/components/page-header";
import {
  CARD_PAGED_QUERY_KEY,
  fetchCardApiRecords,
  mapRawCardToLotteryCard,
} from "@/lib/card-api-adapters";

interface WalletTransaction {
  id: string;
  transactionNumber: string;
  cardNumber: string;
  username: string;
  debit: number;
  credit: number;
  date: string;
  type: "debit" | "credit";
}

export default function WalletsPage() {
  const { t, language, dir } = useLanguage();
  const { toast } = useToast();
  const [searchTransactionNumber, setSearchTransactionNumber] = useState("");
  const [searchCardNumber, setSearchCardNumber] = useState("");
  const [searchUsername, setSearchUsername] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<WalletTransaction | null>(null);

  const { data: transactions = [] } = useQuery({
    queryKey: [CARD_PAGED_QUERY_KEY, "wallet-transactions"],
    queryFn: async (): Promise<WalletTransaction[]> => {
      const rawCards = await fetchCardApiRecords();
      return rawCards.slice(0, 200).map((rawCard, index) => {
        const card = mapRawCardToLotteryCard(rawCard, index);
        const rawAmount =
          Number((rawCard as any).prizeAmount ?? (rawCard as any).cardPrice ?? 0) || 0;
        const amount = rawAmount > 0 ? rawAmount : 10;
        const credit = card.isActive ? amount : 0;
        const debit = card.isActive ? 0 : amount;
        const username =
          typeof (rawCard as any).userName === "string" && (rawCard as any).userName.trim() !== ""
            ? (rawCard as any).userName
            : "—";

        return {
          id: String(card.id),
          transactionNumber: `TXN${String(card.id).padStart(6, "0")}`,
          cardNumber: card.cardNumber,
          username,
          debit,
          credit,
          date: card.issueDate,
          type: credit > 0 ? "credit" : "debit",
        };
      });
    },
  });

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const transactionNumberMatch = transaction.transactionNumber
        .toLowerCase()
        .includes(searchTransactionNumber.toLowerCase());
      const cardNumberMatch = transaction.cardNumber
        .toLowerCase()
        .includes(searchCardNumber.toLowerCase());
      const usernameMatch = transaction.username
        .toLowerCase()
        .includes(searchUsername.toLowerCase());

      return transactionNumberMatch && cardNumberMatch && usernameMatch;
    });
  }, [transactions, searchTransactionNumber, searchCardNumber, searchUsername]);

  const totalDebit = filteredTransactions.reduce((sum, t) => sum + t.debit, 0);
  const totalCredit = filteredTransactions.reduce(
    (sum, t) => sum + t.credit,
    0
  );

  const handleEdit = (transaction: WalletTransaction) => {
    setSelectedTransaction(transaction);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (transaction: WalletTransaction) => {
    setSelectedTransaction(transaction);
    setIsDeleteDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title={t("wallets.title")}
          subtitle={t("wallets.description")}
          icon={<Wallet className="h-5 w-5" />}
        />

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label
                  htmlFor="searchTransaction"
                  className="text-sm font-medium mb-2 block"
                >
                  {t("wallets.transactionNumber") || "Transaction Number"}
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="searchTransaction"
                    placeholder={
                      t("wallets.searchTransactionNumber") ||
                      "Search transaction number..."
                    }
                    value={searchTransactionNumber}
                    onChange={(e) => setSearchTransactionNumber(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label
                  htmlFor="searchCard"
                  className="text-sm font-medium mb-2 block"
                >
                  {t("wallets.cardNumber") || "Card Number"}
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="searchCard"
                    placeholder={
                      t("wallets.searchCardNumber") || "Search card number..."
                    }
                    value={searchCardNumber}
                    onChange={(e) => setSearchCardNumber(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label
                  htmlFor="searchUser"
                  className="text-sm font-medium mb-2 block"
                >
                  {t("wallets.username") || "Username"}
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="searchUser"
                    placeholder={
                      t("wallets.searchUsername") || "Search username..."
                    }
                    value={searchUsername}
                    onChange={(e) => setSearchUsername(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Transactions Table */}
        <Card className="border-muted/40 shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-l from-primary/5 to-transparent border-b">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">{t("wallets.title") || "Transactions"}</CardTitle>
                <CardDescription className="text-sm mt-1">{t("wallets.description") || "Manage wallet transactions"}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto rounded-xl border border-border/40">
              <Table>
                {/* Header */}
                <TableHeader>
                  <TableRow className="bg-primary/10 hover:bg-primary/10 border-b-2 border-primary/20">
                    <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">
                      {t("wallets.transactionNumber") || "Transaction #"}
                    </TableHead>
                    <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">
                      {t("wallets.cardNumber") || "Card"}
                    </TableHead>
                    <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">
                      {t("wallets.username") || "User"}
                    </TableHead>
                    <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">
                      {t("wallets.debit") || "Debit"}
                    </TableHead>
                    <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">
                      {t("wallets.credit") || "Credit"}
                    </TableHead>
                    <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">
                      {t("wallets.date") || "Date"}
                    </TableHead>
                    <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground text-center py-4">
                      {t("wallets.preview") || "Actions"}
                    </TableHead>
                  </TableRow>
                </TableHeader>

                {/* Body */}
                <TableBody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                      <TableRow
                        key={transaction.id}
                        className="group transition-all hover:bg-primary/5 border-b border-border/50"
                      >
                        {/* Transaction Number */}
                        <TableCell className="text-center font-medium">
                          <span className="px-3 py-1 rounded-lg bg-muted/40 text-sm">
                            {transaction.transactionNumber}
                          </span>
                        </TableCell>

                        {/* Card */}
                        <TableCell className="text-center font-mono text-sm">
                          {transaction.cardNumber}
                        </TableCell>

                        {/* Username */}
                        <TableCell className="text-center font-medium">
                          {transaction.username}
                        </TableCell>

                        {/* Debit */}
                        <TableCell className="text-center">
                          {transaction.debit > 0 ? (
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/30">
                              <ArrowDownLeft className="h-4 w-4 text-red-600" />
                              <span className="text-red-600 font-semibold">
                                -JOD {transaction.debit.toLocaleString()}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        {/* Credit */}
                        <TableCell className="text-center">
                          {transaction.credit > 0 ? (
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30">
                              <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                              <span className="text-emerald-600 font-semibold">
                                +JOD {transaction.credit.toLocaleString()}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        {/* Date */}
                        <TableCell className="text-center text-sm text-muted-foreground">
                          {transaction.date}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setIsPreviewDialogOpen(true);
                            }}
                            className="h-9 w-9 rounded-full hover:bg-muted"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                          <span className="text-lg">📭</span>
                          <p>
                            {t("wallets.noTransactions") ||
                              "No transactions found"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Preview Transaction Dialog */}
        <Dialog
          open={isPreviewDialogOpen}
          onOpenChange={setIsPreviewDialogOpen}
        >
          <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden rounded-2xl border shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/90 via-primary to-primary/80 p-6 text-primary-foreground">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur shadow-xl">
                  <Eye className="h-7 w-7" />
                </div>

                <div>
                  <DialogTitle className="text-2xl font-bold tracking-tight">
                    {t("wallets.transactionDetails") || "Transaction Details"}
                  </DialogTitle>
                  <DialogDescription className="text-primary-foreground/80">
                    {t("wallets.viewTransactionInfo") ||
                      "Complete transaction overview"}
                  </DialogDescription>
                </div>
              </div>
            </div>

            {/* Body */}
            {selectedTransaction && (
              <div className="p-6 space-y-6 bg-background">
                {/* Top Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-border/40 bg-muted/20 p-4 shadow-sm hover:shadow-md transition">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {t("wallets.transactionNumber") || "Transaction Number"}
                    </p>
                    <p className="text-xl font-bold font-mono mt-1">
                      {selectedTransaction.transactionNumber}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border/40 bg-muted/20 p-4 shadow-sm hover:shadow-md transition">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {t("wallets.cardNumber") || "Card Number"}
                    </p>
                    <p className="text-xl font-bold font-mono mt-1">
                      {selectedTransaction.cardNumber}
                    </p>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      {t("wallets.username") || "Username"}
                    </span>
                    <p className="text-lg font-semibold">
                      {selectedTransaction.username}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      {t("wallets.date") || "Date"}
                    </span>
                    <p className="text-lg font-semibold">
                      {selectedTransaction.date}
                    </p>
                  </div>
                </div>

                {/* Financial Section */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {/* Debit */}
                  <div className="rounded-xl border border-red-200/40 bg-red-50/40 dark:bg-red-950/20 p-4">
                    <p className="text-xs uppercase tracking-wide text-red-600">
                      {t("wallets.debit") || "Debit"}
                    </p>
                    <p className="text-xl font-bold text-red-600 mt-1">
                      {selectedTransaction.debit > 0
                        ? `-JOD ${selectedTransaction.debit.toLocaleString()}`
                        : "—"}
                    </p>
                  </div>

                  {/* Credit */}
                  <div className="rounded-xl border border-emerald-200/40 bg-emerald-50/40 dark:bg-emerald-950/20 p-4">
                    <p className="text-xs uppercase tracking-wide text-emerald-600">
                      {t("wallets.credit") || "Credit"}
                    </p>
                    <p className="text-xl font-bold text-emerald-600 mt-1">
                      {selectedTransaction.credit > 0
                        ? `+JOD ${selectedTransaction.credit.toLocaleString()}`
                        : "—"}
                    </p>
                  </div>

                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end gap-3 p-5 border-t bg-muted/20">
              <Button
                variant="outline"
                className="rounded-xl px-6"
                onClick={() => setIsPreviewDialogOpen(false)}
              >
                {t("wallets.close") || "Close"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
