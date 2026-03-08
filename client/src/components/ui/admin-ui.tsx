import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Pencil, Trash2, Eye, Check, X } from "lucide-react";

// ─── Standard icon-button sizes & colours ─────────────────────────────────────
// All action icon-buttons in admin tables use these exact classes.

const BASE_ICON_BTN = "h-8 w-8 rounded-lg";

export function EditIconButton({
  onClick,
  disabled,
  "data-testid": testId,
  className,
  children,
}: {
  onClick?: () => void;
  disabled?: boolean;
  "data-testid"?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      className={cn(
        BASE_ICON_BTN,
        "text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/30",
        className,
      )}
    >
      {children ?? <Pencil className="h-4 w-4" />}
    </Button>
  );
}

export function DeleteIconButton({
  onClick,
  disabled,
  "data-testid": testId,
  className,
  children,
}: {
  onClick?: () => void;
  disabled?: boolean;
  "data-testid"?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      className={cn(
        BASE_ICON_BTN,
        "text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30",
        className,
      )}
    >
      {children ?? <Trash2 className="h-4 w-4" />}
    </Button>
  );
}

export function ViewIconButton({
  onClick,
  disabled,
  "data-testid": testId,
  className,
  children,
}: {
  onClick?: () => void;
  disabled?: boolean;
  "data-testid"?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      className={cn(
        BASE_ICON_BTN,
        "text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/30",
        className,
      )}
    >
      {children ?? <Eye className="h-4 w-4" />}
    </Button>
  );
}

// ─── Standard status badge ─────────────────────────────────────────────────────

export function ActiveBadge({
  active,
  labelActive,
  labelInactive,
  className,
}: {
  active: boolean;
  labelActive?: string;
  labelInactive?: string;
  className?: string;
}) {
  return active ? (
    <Badge variant="success" className={cn("gap-1", className)}>
      <Check className="h-3 w-3" />
      {labelActive}
    </Badge>
  ) : (
    <Badge variant="danger" className={cn("gap-1", className)}>
      <X className="h-3 w-3" />
      {labelInactive}
    </Badge>
  );
}
