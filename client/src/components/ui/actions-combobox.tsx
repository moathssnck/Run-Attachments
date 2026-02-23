"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ActionOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "destructive";
  separator?: boolean;
}

interface ActionsComboboxProps {
  options: ActionOption[];
  onSelect: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  triggerIcon?: React.ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function ActionsCombobox({
  options,
  onSelect,
  placeholder = "Actions",
  searchPlaceholder = "Search action...",
  emptyText = "No action found.",
  disabled = false,
  triggerIcon,
  className,
  "data-testid": dataTestId,
}: ActionsComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  const handleSelect = (value: string) => {
    onSelect(value);
    setSearchQuery("");
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={disabled}
          className={cn(className)}
          data-testid={dataTestId}
        >
          {triggerIcon}
          <span className="sr-only">{placeholder}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px] p-0" align="end">
        <div className="flex items-center border-b px-3 py-2">
          <Search className="me-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <div className="max-h-[200px] overflow-y-auto p-1">
          {filteredOptions.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {emptyText}
            </div>
          ) : (
            filteredOptions.map((option, index) => (
              <React.Fragment key={option.value}>
                {option.separator && index > 0 && <DropdownMenuSeparator />}
                <DropdownMenuItem
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "cursor-pointer",
                    option.variant === "destructive" &&
                      "text-destructive focus:text-destructive"
                  )}
                >
                  {option.icon && (
                    <span className="me-2 h-4 w-4">{option.icon}</span>
                  )}
                  {option.label}
                </DropdownMenuItem>
              </React.Fragment>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
