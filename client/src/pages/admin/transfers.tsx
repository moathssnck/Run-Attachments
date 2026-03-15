"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2, MoreHorizontal, Eye, ArrowLeftRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { PageHeader } from "@/components/page-header";
import { API_CONFIG } from "@/lib/api-config";
import { apiRequest, getStoredToken } from "@/lib/queryClient";
import { usePagination, paginate, TablePagination } from "@/components/ui/table-pagination";

interface Transfer {
  id: string;
  cardTransferId: string;
  movementNumber: string;
  issueNumber: string;
  transferDate: string;
  cardNumber: string;
  cardId: string;
  previousOwner: string;
  previousOwnerId: string;
  newOwner: string;
  newOwnerId: string;
  transferReason: string;
  status: "completed" | "pending" | "failed";
}

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
}

function normalizeTransferStatus(value: unknown): "completed" | "pending" | "failed" {
  const s = asString(value).toLowerCase();
  if (s.includes("complet") || s.includes("approv") || s.includes("success")) return "completed";
  if (s.includes("fail") || s.includes("reject") || s.includes("cancel")) return "failed";
  return "pending";
}

function extractTransferList(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  const root = payload as Record<string, unknown>;
  for (const key of ["transfers", "items", "data", "cardTransfers", "results"]) {
    if (Array.isArray(root[key])) return root[key] as Record<string, unknown>[];
  }
  if (root.data && typeof root.data === "object") {
    const d = root.data as Record<string, unknown>;
    for (const key of ["transfers", "items", "data", "cardTransfers", "results"]) {
      if (Array.isArray(d[key])) return d[key] as Record<string, unknown>[];
    }
  }
  return [];
}

export default function TransfersPage() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [searchMovement, setSearchMovement] = useState("");
  const [searchIssue, setSearchIssue] = useState("");
  const [searchCard, setSearchCard] = useState("");
  const [searchPrevOwner, setSearchPrevOwner] = useState("");
  const [searchNewOwner, setSearchNewOwner] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(
    null
  );

  const [serverSearchUrl, setServerSearchUrl] = useState("");
  const qc = useQueryClient();

  const buildSearchUrl = () => {
    const params = new URLSearchParams();
    params.set("pageNumber", "1");
    params.set("pageSize", "50");
    if (searchMovement) params.set("cardTransferId", searchMovement);
    if (searchCard) params.set("cardId", searchCard);
    if (searchPrevOwner) params.set("fromUserId", searchPrevOwner);
    if (searchNewOwner) params.set("toUserId", searchNewOwner);
    if (filterStatus !== "all") {
      const statusMap: Record<string, string> = { completed: "6", pending: "5", failed: "7" };
      if (statusMap[filterStatus]) params.set("statusId", statusMap[filterStatus]);
    }
    return `${API_CONFIG.cardTransfer.paged}?${params.toString()}`;
  };

  const activeTransferUrl = serverSearchUrl || `${API_CONFIG.cardTransfer.paged}?pageNumber=1&pageSize=50`;

  const { data: transfers = [], isLoading: transfersLoading } = useQuery({
    queryKey: [activeTransferUrl, "transfers"],
    queryFn: async (): Promise<Transfer[]> => {
      const token = getStoredToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const response = await fetch(activeTransferUrl, { credentials: "include", headers });
      if (!response.ok) throw new Error(`Failed to load transfers (${response.status})`);
      const payload = await response.json();
      const rows = extractTransferList(payload);
      return rows.map((raw, index) => {
        const fromUser = raw.fromUser && typeof raw.fromUser === "object" ? raw.fromUser as Record<string, unknown> : null;
        const toUser = raw.toUser && typeof raw.toUser === "object" ? raw.toUser as Record<string, unknown> : null;
        return {
          id: asString(raw.cardTransferId ?? raw.id, String(index + 1)),
          cardTransferId: asString(raw.cardTransferId ?? raw.id, String(index + 1)),
          movementNumber: asString(raw.cardTransferId ?? raw.id, String(index + 1)),
          issueNumber: asString(raw.issueNumber ?? raw.issueId, ""),
          transferDate: asString(raw.transferDate ?? raw.createdAt ?? raw.date, new Date().toISOString()),
          cardNumber: asString(raw.cardNo ?? raw.cardNumber ?? raw.cardId, ""),
          cardId: asString(raw.cardId, ""),
          previousOwner: fromUser
            ? asString(fromUser.firstName ?? fromUser.userName, "") + " " + asString(fromUser.lastName, "")
            : asString(raw.fromUserName ?? raw.fromUserId, "\u2014"),
          previousOwnerId: asString(raw.fromUserId, ""),
          newOwner: toUser
            ? asString(toUser.firstName ?? toUser.userName, "") + " " + asString(toUser.lastName, "")
            : asString(raw.toUserName ?? raw.toUserId, "\u2014"),
          newOwnerId: asString(raw.toUserId ?? raw.newOwnerId, ""),
          transferReason: asString(raw.transferReason ?? raw.reason, ""),
          status: normalizeTransferStatus(raw.status ?? raw.statusName ?? raw.statusId),
        };
      });
    },
  });

  // Transfer card mutation using real API
  const transferCardMutation = useMutation({
    mutationFn: async (data: { cardId: number; newOwnerId: number; transferReason: string }) => {
      const res = await apiRequest("POST", API_CONFIG.cards.transfer, {
        CardId: data.cardId,
        newOwnerId: data.newOwnerId,
        transferReason: data.transferReason,
      });
      return await res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [activeTransferUrl] });
      toast({ title: language === "ar" ? "تم نقل البطاقة بنجاح" : "Card transferred successfully" });
    },
    onError: (err: Error) => {
      toast({ title: language === "ar" ? "فشل نقل البطاقة" : "Transfer failed", description: err.message, variant: "destructive" });
    },
  });

  const filteredTransfers = useMemo(() => {
    return transfers.filter((transfer) => {
      const matchesMovement = transfer.movementNumber
        .toLowerCase()
        .includes(searchMovement.toLowerCase());
      const matchesIssue = transfer.issueNumber
        .toLowerCase()
        .includes(searchIssue.toLowerCase());
      const matchesCard = transfer.cardNumber
        .toLowerCase()
        .includes(searchCard.toLowerCase());
      const matchesPrevOwner = transfer.previousOwner
        .toLowerCase()
        .includes(searchPrevOwner.toLowerCase());
      const matchesNewOwner = transfer.newOwner
        .toLowerCase()
        .includes(searchNewOwner.toLowerCase());
      const matchesStatus =
        filterStatus === "all" || transfer.status === filterStatus;

      return (
        matchesMovement &&
        matchesIssue &&
        matchesCard &&
        matchesPrevOwner &&
        matchesNewOwner &&
        matchesStatus
      );
    });
  }, [
    transfers,
    searchMovement,
    searchIssue,
    searchCard,
    searchPrevOwner,
    searchNewOwner,
    filterStatus,
  ]);

  const { currentPage, pageSize, totalPages, startIndex, endIndex, setCurrentPage, setPageSize } = usePagination(filteredTransfers.length);
  const paginatedTransfers = paginate(filteredTransfers, startIndex, endIndex);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
      case "pending":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400";
      case "failed":
        return "bg-red-500/10 text-red-700 dark:text-red-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title={t("transfers.title")}
          subtitle={t("transfers.description")}
          icon={<ArrowLeftRight className="h-5 w-5" />}
        />
        {/* Search Fields */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Movement Number */}
              <div>
                <Label
                  htmlFor="searchMovement"
                  className="text-sm font-medium mb-2 block"
                >
                  {t("transfers.movementNumber") || "Movement Number"}
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="searchMovement"
                    placeholder={t("transfers.searchMovement") || "Search..."}
                    value={searchMovement}
                    onChange={(e) => setSearchMovement(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Issue Number */}
              <div>
                <Label
                  htmlFor="searchIssue"
                  className="text-sm font-medium mb-2 block"
                >
                  {t("transfers.issueNumber") || "Issue Number"}
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="searchIssue"
                    placeholder={t("transfers.searchIssue") || "Search..."}
                    value={searchIssue}
                    onChange={(e) => setSearchIssue(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Card Number */}
              <div>
                <Label
                  htmlFor="searchCard"
                  className="text-sm font-medium mb-2 block"
                >
                  {t("transfers.cardNumber") || "Card Number"}
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="searchCard"
                    placeholder={t("transfers.searchCard") || "Search..."}
                    value={searchCard}
                    onChange={(e) => setSearchCard(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Previous Owner */}
              <div>
                <Label
                  htmlFor="searchPrevOwner"
                  className="text-sm font-medium mb-2 block"
                >
                  {t("transfers.previousOwner") || "Previous Owner"}
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="searchPrevOwner"
                    placeholder={t("transfers.searchPrevOwner") || "Search..."}
                    value={searchPrevOwner}
                    onChange={(e) => setSearchPrevOwner(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* New Owner */}
              <div>
                <Label
                  htmlFor="searchNewOwner"
                  className="text-sm font-medium mb-2 block"
                >
                  {t("transfers.newOwner") || "New Owner"}
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="searchNewOwner"
                    placeholder={t("transfers.searchNewOwner") || "Search..."}
                    value={searchNewOwner}
                    onChange={(e) => setSearchNewOwner(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <Label
                  htmlFor="filterStatus"
                  className="text-sm font-medium mb-2 block"
                >
                  {t("transfers.status") || "Status"}
                </Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger id="filterStatus" className="w-full">
                    <SelectValue
                      placeholder={
                        t("transfers.filterStatus") || "Filter by status"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("transfers.allStatus") || "All Status"}
                    </SelectItem>
                    <SelectItem value="completed">
                      {t("transfers.completed") || "Completed"}
                    </SelectItem>
                    <SelectItem value="pending">
                      {t("transfers.pending") || "Pending"}
                    </SelectItem>
                    <SelectItem value="failed">
                      {t("transfers.failed") || "Failed"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Transfers Table */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-l from-primary/5 to-transparent border-b">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                <ArrowLeftRight className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">{t("transfers.title") || "Transfers"}</CardTitle>
                <CardDescription className="text-sm mt-1">{t("transfers.description") || "Manage card transfers"}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/10 hover:bg-primary/10 border-b-2 border-primary/20">
                    <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">
                      {t("transfers.movementNumber") || "Movement #"}
                    </TableHead>
                    <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">
                      {t("transfers.issueNumber") || "Issue #"}
                    </TableHead>
                    <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">
                      {t("transfers.transferDate") || "Date"}
                    </TableHead>
                    <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">{t("transfers.cardNumber") || "Card"}</TableHead>
                    <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">
                      {t("transfers.previousOwner") || "Previous Owner"}
                    </TableHead>
                    <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">
                      {t("transfers.newOwner") || "New Owner"}
                    </TableHead>
                    <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground py-4">{t("transfers.status") || "Status"}</TableHead>
                    <TableHead className="font-bold text-sm uppercase tracking-wider text-foreground text-center py-4">
                      {t("transfers.preview") || "Preview"}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransfers.length > 0 ? (
                    paginatedTransfers.map((transfer) => (
                      <TableRow key={transfer.id} className="group transition-all hover:bg-primary/5 border-b border-border/50">
                        <TableCell className="font-medium">
                          {transfer.movementNumber}
                        </TableCell>
                        <TableCell>{transfer.issueNumber}</TableCell>
                        <TableCell>{transfer.transferDate}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {transfer.cardNumber}
                        </TableCell>
                        <TableCell>{transfer.previousOwner}</TableCell>
                        <TableCell>{transfer.newOwner}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(transfer.status)}>
                            {transfer.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setSelectedTransfer(transfer);
                              setIsPreviewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <p className="text-muted-foreground">
                          {t("transfers.noTransfers") || "No transfers found"}
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <TablePagination
                totalItems={filteredTransfers.length}
                currentPage={currentPage}
                pageSize={pageSize}
                totalPages={totalPages}
                startIndex={startIndex}
                endIndex={endIndex}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                isRTL={language === "ar"}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preview Transfer Dialog */}
        <Dialog
          open={isPreviewDialogOpen}
          onOpenChange={setIsPreviewDialogOpen}
        >
          <DialogContent className="sm:max-w-[720px] p-0 overflow-hidden rounded-2xl shadow-2xl border">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/90 to-primary p-6 text-primary-foreground">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur shadow-xl">
                  <Eye className="h-7 w-7" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold tracking-tight">
                    {t("transfers.transferDetails") || "Transfer Details"}
                  </DialogTitle>
                  <DialogDescription className="text-primary-foreground/80">
                    {t("transfers.viewTransferInfo") ||
                      "Complete transfer overview"}
                  </DialogDescription>
                </div>
              </div>
            </div>

            {/* Body */}
            {selectedTransfer && (
              <div className="p-6 space-y-6 bg-background">
                {/* Top Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="border-muted/40 shadow-sm hover:shadow-md transition">
                    <CardContent className="p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {t("transfers.movementNumber") || "Movement Number"}
                      </p>
                      <p className="text-xl font-bold mt-1">
                        {selectedTransfer.movementNumber}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-muted/40 shadow-sm hover:shadow-md transition">
                    <CardContent className="p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {t("transfers.issueNumber") || "Issue Number"}
                      </p>
                      <p className="text-xl font-bold mt-1">
                        {selectedTransfer.issueNumber}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      {t("transfers.transferDate") || "Transfer Date"}
                    </span>
                    <p className="text-lg font-semibold">
                      {selectedTransfer.transferDate}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      {t("transfers.cardNumber") || "Card Number"}
                    </span>
                    <p className="text-lg font-semibold font-mono bg-muted/40 inline-block px-3 py-1 rounded-lg">
                      {selectedTransfer.cardNumber}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      {t("transfers.previousOwner") || "Previous Owner"}
                    </span>
                    <p className="text-lg font-semibold">
                      {selectedTransfer.previousOwner}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      {t("transfers.newOwner") || "New Owner"}
                    </span>
                    <p className="text-lg font-semibold">
                      {selectedTransfer.newOwner}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className="grid grid-cols-1 gap-6">
                  {/* Status Card */}
                  <div className="rounded-xl border border-border/40 bg-muted/30 p-5">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {t("transfers.status") || "Status"}
                    </p>
                    <div className="mt-2">
                      <Badge
                        className={`px-4 py-1.5 text-sm rounded-full font-semibold shadow-sm ${getStatusColor(
                          selectedTransfer.status
                        )}`}
                      >
                        {selectedTransfer.status}
                      </Badge>
                    </div>
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
                {t("transfers.close") || "Close"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
