import type { ReactNode } from "react";

export const PageHeader = ({
  title,
  subtitle,
  actions,
  icon,
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
  icon?: ReactNode;
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 rounded-2xl bg-gradient-to-l from-primary/10 via-primary/5 to-transparent border border-primary/15 shadow-sm">
      <div className="space-y-1.5">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground text-balance flex items-center gap-3">
          {icon && (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
              {icon}
            </span>
          )}
          {title}
        </h1>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          {subtitle}
        </p>
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};
