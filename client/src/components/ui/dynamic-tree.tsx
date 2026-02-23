import * as React from "react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronRight, Minus, Plus, ChevronsUpDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export interface TreeNode {
  id: string;
  label: string;
  description?: string;
  children?: TreeNode[];
  icon?: React.ReactNode;
  data?: any;
  disabled?: boolean;
  value?: boolean;
}

export interface DynamicTreeProps {
  data: TreeNode[];
  isRTL?: boolean;
  showCheckboxes?: boolean;
  checkedIds?: Set<string>;
  onCheckedChange?: (id: string, checked: boolean, node: TreeNode) => void;
  onValueChange?: (node: TreeNode, value: boolean) => void;
  useNodeValue?: boolean;
  onNodeClick?: (node: TreeNode) => void;
  renderLabel?: (node: TreeNode, level: number, number: string) => React.ReactNode;
  renderBadge?: (node: TreeNode) => React.ReactNode;
  expandedIds?: Set<string>;
  onExpandChange?: (id: string, expanded: boolean) => void;
  defaultExpandAll?: boolean;
  showNumbers?: boolean;
  showExpandAllButton?: boolean;
  className?: string;
  variant?: "default" | "bordered" | "cards";
  size?: "sm" | "md" | "lg";
}

interface TreeNodeComponentProps {
  node: TreeNode;
  level: number;
  isLast: boolean;
  parentNumber: string;
  index: number;
  isRTL: boolean;
  showCheckboxes: boolean;
  checkedIds: Set<string>;
  onCheckedChange?: (id: string, checked: boolean, node: TreeNode) => void;
  onValueChange?: (node: TreeNode, value: boolean) => void;
  useNodeValue: boolean;
  onNodeClick?: (node: TreeNode) => void;
  renderLabel?: (node: TreeNode, level: number, number: string) => React.ReactNode;
  renderBadge?: (node: TreeNode) => React.ReactNode;
  expandedIds: Set<string>;
  onExpandChange: (id: string, expanded: boolean) => void;
  showNumbers: boolean;
  variant: "default" | "bordered" | "cards";
  size: "sm" | "md" | "lg";
}

function getNodeCheckedState(node: TreeNode, checkedIds: Set<string>, useNodeValue: boolean = false): { checked: boolean; indeterminate: boolean } {
  if (!node.children || node.children.length === 0) {
    const isChecked = useNodeValue ? (node.value === true) : checkedIds.has(node.id);
    return { checked: isChecked, indeterminate: false };
  }

  let allChecked = true;
  let someChecked = false;

  const checkChildren = (children: TreeNode[]) => {
    for (const child of children) {
      if (child.children && child.children.length > 0) {
        checkChildren(child.children);
      } else {
        const isChildChecked = useNodeValue ? (child.value === true) : checkedIds.has(child.id);
        if (isChildChecked) {
          someChecked = true;
        } else {
          allChecked = false;
        }
      }
    }
  };

  checkChildren(node.children);

  return {
    checked: allChecked && someChecked,
    indeterminate: someChecked && !allChecked
  };
}

function getAllLeafIds(node: TreeNode): string[] {
  if (!node.children || node.children.length === 0) {
    return [node.id];
  }
  return node.children.flatMap(child => getAllLeafIds(child));
}

function countChildren(node: TreeNode): number {
  if (!node.children || node.children.length === 0) return 0;
  return node.children.reduce((acc, child) => acc + 1 + countChildren(child), 0);
}

function TreeNodeComponent({
  node,
  level,
  isLast,
  parentNumber,
  index,
  isRTL,
  showCheckboxes,
  checkedIds,
  onCheckedChange,
  onValueChange,
  useNodeValue,
  onNodeClick,
  renderLabel,
  renderBadge,
  expandedIds,
  onExpandChange,
  showNumbers,
  variant,
  size
}: TreeNodeComponentProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const nodeNumber = parentNumber ? `${parentNumber}.${index + 1}` : `${index + 1}`;
  const childCount = countChildren(node);
  
  const { checked, indeterminate } = getNodeCheckedState(node, checkedIds, useNodeValue);

  const handleCheckChange = (isChecked: boolean) => {
    if (node.disabled) return;
    
    if (useNodeValue && onValueChange) {
      if (hasChildren) {
        const setChildValues = (children: TreeNode[]) => {
          children.forEach(child => {
            if (child.children && child.children.length > 0) {
              setChildValues(child.children);
            } else {
              onValueChange(child, isChecked);
            }
          });
        };
        setChildValues(node.children || []);
      } else {
        onValueChange(node, isChecked);
      }
    } else if (onCheckedChange) {
      if (hasChildren) {
        const leafIds = getAllLeafIds(node);
        leafIds.forEach(id => {
          onCheckedChange(id, isChecked, node);
        });
      } else {
        onCheckedChange(node.id, isChecked, node);
      }
    }
  };

  const levelColors = [
    { line: "border-primary/60", bg: "bg-primary/5" },
    { line: "border-primary/45", bg: "bg-primary/4" },
    { line: "border-primary/30", bg: "bg-primary/3" },
    { line: "border-primary/20", bg: "bg-primary/2" }
  ];
  const levelStyle = levelColors[Math.min(level, levelColors.length - 1)];

  const sizeClasses = {
    sm: { padding: "p-2", gap: "gap-2", icon: "h-5 w-5", text: "text-xs", indentLtr: "ml-5", indentRtl: "mr-5" },
    md: { padding: "p-3", gap: "gap-3", icon: "h-6 w-6", text: "text-sm", indentLtr: "ml-6", indentRtl: "mr-6" },
    lg: { padding: "p-4", gap: "gap-4", icon: "h-7 w-7", text: "text-base", indentLtr: "ml-7", indentRtl: "mr-7" }
  };
  const sizeStyle = sizeClasses[size];
  const indentClass = isRTL ? sizeStyle.indentRtl : sizeStyle.indentLtr;

  const getNodeClasses = () => {
    const base = cn(
      "flex items-center transition-all duration-200",
      sizeStyle.padding,
      sizeStyle.gap,
      hasChildren ? "cursor-pointer" : "",
      node.disabled && "opacity-50 cursor-not-allowed"
    );

    switch (variant) {
      case "bordered":
        return cn(
          base,
          "border rounded-lg mb-1",
          isExpanded && hasChildren 
            ? "bg-muted/60 border-primary/30 shadow-sm" 
            : "border-border/50 hover:border-primary/20 hover:bg-muted/30"
        );
      case "cards":
        return cn(
          base,
          "rounded-xl mb-1.5 shadow-sm border",
          isExpanded && hasChildren
            ? "bg-card border-primary/40 shadow-md"
            : checked
              ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
              : "bg-card border-border/30 hover:shadow-md hover:border-primary/20"
        );
      default:
        return cn(
          base,
          "rounded-lg mb-0.5",
          isExpanded && hasChildren ? "bg-muted/50" : "hover:bg-muted/40"
        );
    }
  };

  return (
    <div className={cn("relative", node.disabled && "pointer-events-none")}>
      {level > 0 && (
        <>
          <div className={cn(
            "absolute top-0 w-5 h-6",
            levelStyle.line,
            isRTL 
              ? "right-0 border-r-2 border-b-2 rounded-br-xl" 
              : "left-0 border-l-2 border-b-2 rounded-bl-xl"
          )} />
          {!isLast && (
            <div className={cn(
              "absolute top-0 bottom-0 w-0",
              levelStyle.line,
              isRTL ? "right-0 border-r-2" : "left-0 border-l-2"
            )} />
          )}
        </>
      )}
      
      <div className={cn(
        level > 0 && indentClass
      )}>
        <div
          className={getNodeClasses()}
          onClick={() => {
            if (hasChildren && !node.disabled) {
              onExpandChange(node.id, !isExpanded);
            }
            if (!node.disabled) {
              onNodeClick?.(node);
            }
          }}
        >
          {hasChildren && (
            <div
              className={cn(
                "flex items-center justify-center rounded-md transition-colors",
                sizeStyle.icon,
                isExpanded 
                  ? "bg-primary/10 text-primary" 
                  : "bg-muted text-muted-foreground hover:bg-primary/5"
              )}
            >
              {isExpanded ? (
                <Minus className="h-3.5 w-3.5" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
            </div>
          )}

          {showCheckboxes && (
            <Checkbox
              checked={checked}
              ref={(el) => {
                if (el) {
                  (el as any).indeterminate = indeterminate;
                }
              }}
              onCheckedChange={(c) => handleCheckChange(c === true)}
              disabled={node.disabled}
              className={cn(
                "transition-all duration-200",
                "data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600",
                "data-[state=checked]:shadow-sm"
              )}
              onClick={(e) => e.stopPropagation()}
            />
          )}
          
          {node.icon && (
            <div className={cn(
              "flex items-center justify-center rounded-lg transition-all duration-200",
              sizeStyle.icon,
              checked 
                ? "bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400 shadow-sm" 
                : indeterminate
                  ? "bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
                  : "bg-muted text-muted-foreground"
            )}>
              {node.icon}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            {renderLabel ? (
              renderLabel(node, level, nodeNumber)
            ) : (
              <div>
                <span className={cn("font-medium truncate block", sizeStyle.text)}>
                  {showNumbers && (
                    <span className="font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md me-2">
                      {nodeNumber}
                    </span>
                  )}
                  <span>{node.label}</span>
                </span>
                {node.description && (
                  <span className="text-xs text-muted-foreground truncate block mt-0.5">
                    {node.description}
                  </span>
                )}
              </div>
            )}
          </div>

          {hasChildren && !renderBadge && (
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full font-medium",
              isExpanded 
                ? "bg-primary/10 text-primary" 
                : "bg-muted text-muted-foreground"
            )}>
              {childCount}
            </span>
          )}

          {renderBadge && renderBadge(node)}

          {hasChildren && (
            <motion.div
              initial={false}
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <ChevronDown className={cn(
                "text-muted-foreground flex-shrink-0 transition-colors",
                size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4",
                isExpanded && "text-primary"
              )} />
            </motion.div>
          )}
        </div>

        <AnimatePresence initial={false}>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className={cn(
                "pt-1 pb-1",
                isRTL ? "pr-5" : "pl-5"
              )}>
                {node.children!.map((child, childIndex) => (
                  <TreeNodeComponent
                    key={child.id}
                    node={child}
                    level={level + 1}
                    isLast={childIndex === node.children!.length - 1}
                    parentNumber={nodeNumber}
                    index={childIndex}
                    isRTL={isRTL}
                    showCheckboxes={showCheckboxes}
                    checkedIds={checkedIds}
                    onCheckedChange={onCheckedChange}
                    onValueChange={onValueChange}
                    useNodeValue={useNodeValue}
                    onNodeClick={onNodeClick}
                    renderLabel={renderLabel}
                    renderBadge={renderBadge}
                    expandedIds={expandedIds}
                    onExpandChange={onExpandChange}
                    showNumbers={showNumbers}
                    variant={variant}
                    size={size}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function DynamicTree({
  data,
  isRTL = false,
  showCheckboxes = false,
  checkedIds = new Set(),
  onCheckedChange,
  onValueChange,
  useNodeValue = false,
  onNodeClick,
  renderLabel,
  renderBadge,
  expandedIds: controlledExpandedIds,
  onExpandChange: controlledOnExpandChange,
  defaultExpandAll = false,
  showNumbers = true,
  showExpandAllButton = true,
  className,
  variant = "default",
  size = "md"
}: DynamicTreeProps) {
  const getAllIds = React.useCallback((nodes: TreeNode[]): string[] => {
    return nodes.flatMap(n => [n.id, ...getAllIds(n.children || [])]);
  }, []);

  const [internalExpandedIds, setInternalExpandedIds] = React.useState<Set<string>>(() => {
    if (defaultExpandAll) {
      return new Set(getAllIds(data));
    }
    return new Set();
  });

  const expandedIds = controlledExpandedIds ?? internalExpandedIds;
  const onExpandChange = controlledOnExpandChange ?? ((id: string, expanded: boolean) => {
    setInternalExpandedIds(prev => {
      const next = new Set(prev);
      if (expanded) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  });

  const allIds = React.useMemo(() => getAllIds(data), [data, getAllIds]);
  const isAllExpanded = allIds.every(id => expandedIds.has(id));

  const handleExpandAll = () => {
    if (controlledOnExpandChange) {
      allIds.forEach(id => controlledOnExpandChange(id, !isAllExpanded));
    } else {
      setInternalExpandedIds(isAllExpanded ? new Set() : new Set(allIds));
    }
  };

  return (
    <div className={cn("relative", className)}>
      {showExpandAllButton && data.length > 0 && (
        <div className={cn(
          "flex justify-end mb-3",
          isRTL && "justify-start"
        )}>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExpandAll}
            className="gap-2 text-xs"
          >
            <ChevronsUpDown className="h-3.5 w-3.5" />
            {isAllExpanded ? (isRTL ? "طي الكل" : "Collapse All") : (isRTL ? "توسيع الكل" : "Expand All")}
          </Button>
        </div>
      )}
      
      <div className="space-y-1">
        {data.map((node, index) => (
          <TreeNodeComponent
            key={node.id}
            node={node}
            level={0}
            isLast={index === data.length - 1}
            parentNumber=""
            index={index}
            isRTL={isRTL}
            showCheckboxes={showCheckboxes}
            checkedIds={checkedIds}
            onCheckedChange={onCheckedChange}
            onValueChange={onValueChange}
            useNodeValue={useNodeValue}
            onNodeClick={onNodeClick}
            renderLabel={renderLabel}
            renderBadge={renderBadge}
            expandedIds={expandedIds}
            onExpandChange={onExpandChange}
            showNumbers={showNumbers}
            variant={variant}
            size={size}
          />
        ))}
      </div>
    </div>
  );
}

export function convertToTreeData<T>(
  items: T[],
  config: {
    getId: (item: T) => string;
    getLabel: (item: T) => string;
    getParentId: (item: T) => string | null;
    getIcon?: (item: T) => React.ReactNode;
    getDescription?: (item: T) => string | undefined;
  }
): TreeNode[] {
  const { getId, getLabel, getParentId, getIcon, getDescription } = config;
  
  const itemMap = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  items.forEach(item => {
    const node: TreeNode = {
      id: getId(item),
      label: getLabel(item),
      description: getDescription?.(item),
      icon: getIcon?.(item),
      data: item,
      children: []
    };
    itemMap.set(node.id, node);
  });

  items.forEach(item => {
    const node = itemMap.get(getId(item))!;
    const parentId = getParentId(item);
    
    if (parentId && itemMap.has(parentId)) {
      itemMap.get(parentId)!.children!.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export function convertGroupedToTreeData<T>(
  groups: Record<string, T[]>,
  config: {
    getGroupLabel: (groupKey: string) => string;
    getGroupIcon?: (groupKey: string) => React.ReactNode;
    getGroupDescription?: (groupKey: string) => string | undefined;
    getItemId: (item: T) => string;
    getItemLabel: (item: T) => string;
    getItemIcon?: (item: T) => React.ReactNode;
    getItemDescription?: (item: T) => string | undefined;
  }
): TreeNode[] {
  const { 
    getGroupLabel, 
    getGroupIcon, 
    getGroupDescription,
    getItemId, 
    getItemLabel, 
    getItemIcon,
    getItemDescription 
  } = config;
  
  return Object.entries(groups).map(([groupKey, items]) => ({
    id: `group-${groupKey}`,
    label: getGroupLabel(groupKey),
    description: getGroupDescription?.(groupKey),
    icon: getGroupIcon?.(groupKey),
    children: items.map(item => ({
      id: getItemId(item),
      label: getItemLabel(item),
      description: getItemDescription?.(item),
      icon: getItemIcon?.(item),
      data: item
    }))
  }));
}
