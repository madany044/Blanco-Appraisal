import Image from "next/image";
import { cn } from "@/lib/utils";
import { COMPANY_LOGO_PATH } from "@/lib/brand";

type LogoSize = "sm" | "md" | "lg" | "xl";

const sizeClasses: Record<LogoSize, string> = {
  sm: "max-h-12 max-w-[140px]",
  md: "max-h-16 max-w-[180px]",
  lg: "max-h-20 max-w-[220px]",
  xl: "max-h-28 max-w-[300px]",
};

interface CompanyLogoProps {
  size?: LogoSize;
  className?: string;
  priority?: boolean;
}

export function CompanyLogo({ size = "md", className, priority }: CompanyLogoProps) {
  return (
    <div className={cn("flex justify-center items-center", className)}>
      <Image
        src={COMPANY_LOGO_PATH}
        alt="Blanco Steel Detailing"
        width={220}
        height={88}
        priority={priority}
        className={cn("h-auto w-auto object-contain", sizeClasses[size])}
      />
    </div>
  );
}
