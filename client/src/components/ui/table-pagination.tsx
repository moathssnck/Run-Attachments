import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

export function usePagination(totalItems: number, defaultPageSize = 10): PaginationState {
  const [currentPage, setCurrentPageRaw] = useState(1);
  const [pageSize, setPageSizeRaw] = useState(defaultPageSize);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const setCurrentPage = (page: number) => setCurrentPageRaw(page);
  const setPageSize = (size: number) => {
    setPageSizeRaw(size);
    setCurrentPageRaw(1);
  };

  return { currentPage, pageSize, totalPages, startIndex, endIndex, setCurrentPage, setPageSize };
}

export function paginate<T>(items: T[], startIndex: number, endIndex: number): T[] {
  return items.slice(startIndex, endIndex);
}

interface TablePaginationProps {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  showingLabel?: string;
  ofLabel?: string;
  perPageLabel?: string;
  isRTL?: boolean;
}

export function TablePagination({
  totalItems,
  currentPage,
  pageSize,
  totalPages,
  startIndex,
  endIndex,
  onPageChange,
  onPageSizeChange,
  showingLabel = "Showing",
  ofLabel = "of",
  perPageLabel = "per page",
  isRTL = false,
}: TablePaginationProps) {
  if (totalItems === 0) return null;

  const pageNumbers = useMemo(() => {
    const nums: number[] = [];
    const count = Math.min(5, totalPages);
    let start: number;
    if (totalPages <= 5) {
      start = 1;
    } else if (currentPage <= 3) {
      start = 1;
    } else if (currentPage >= totalPages - 2) {
      start = totalPages - 4;
    } else {
      start = currentPage - 2;
    }
    for (let i = 0; i < count; i++) nums.push(start + i);
    return nums;
  }, [currentPage, totalPages]);

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t ${isRTL ? "sm:flex-row-reverse" : ""}`}
      data-testid="table-pagination"
    >
      <div className={`flex items-center gap-2 text-sm text-muted-foreground ${isRTL ? "flex-row-reverse" : ""}`}>
        <span>
          {showingLabel} {Math.min(startIndex + 1, totalItems)}–{Math.min(endIndex, totalItems)} {ofLabel} {totalItems}
        </span>
        <Select
          value={pageSize.toString()}
          onValueChange={(val) => onPageSizeChange(Number(val))}
        >
          <SelectTrigger className="w-[72px] h-8" data-testid="select-page-size">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[5, 10, 20, 50].map((n) => (
              <SelectItem key={n} value={String(n)}>{n}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>{perPageLabel}</span>
      </div>

      <div className={`flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-transparent"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          data-testid="btn-page-first"
        >
          {isRTL ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-transparent"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          data-testid="btn-page-prev"
        >
          {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>

        <div className="flex items-center gap-1 px-2">
          {pageNumbers.map((num) => (
            <Button
              key={num}
              variant={currentPage === num ? "default" : "outline"}
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(num)}
              data-testid={`btn-page-${num}`}
            >
              {num}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-transparent"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          data-testid="btn-page-next"
        >
          {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-transparent"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          data-testid="btn-page-last"
        >
          {isRTL ? <ChevronsLeft className="h-4 w-4" /> : <ChevronsRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
