import { CompanyLogo } from "@/components/shared/CompanyLogo";
import { COMPANY_NAME_SHORT, REPORT_TITLE } from "@/lib/brand";
import { cn } from "@/lib/utils";

interface FormBrandHeaderProps {
  subtitle?: string;
  className?: string;
  compact?: boolean;
}

/** Logo + report title strip for appraisal forms and review screens */
export function FormBrandHeader({ subtitle, className, compact }: FormBrandHeaderProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-slate-200 bg-white text-center shadow-sm",
        compact ? "px-4 py-3 mb-4" : "px-6 py-5 mb-6",
        className
      )}
    >
      <CompanyLogo size={compact ? "sm" : "md"} className="mb-2" />
      <p className="text-sm md:text-base font-semibold uppercase tracking-wide text-[#1a4b8c]">
        {COMPANY_NAME_SHORT}
      </p>
      <p className="text-base md:text-lg text-slate-600 mt-0.5">{REPORT_TITLE}</p>
      {subtitle ? <p className="text-sm text-muted-foreground mt-2">{subtitle}</p> : null}
    </div>
  );
}
