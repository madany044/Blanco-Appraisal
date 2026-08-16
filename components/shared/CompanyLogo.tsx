import Image from "next/image";
import { cn } from "@/lib/utils";
import { COMPANY_LOGO_RING_PATH, COMPANY_LOGO_CENTER_PATH } from "@/lib/brand";

type LogoSize = "sm" | "md" | "lg" | "xl";

// Controls overall container dimensions across sizes
const containerSizeClasses: Record<LogoSize, string> = {
  sm: "h-12 w-12 p-0.5",
  md: "h-20 w-20 sm:h-24 sm:w-24 p-1.5",
  lg: "h-28 w-28 sm:h-32 sm:w-32 p-2",
  xl: "h-36 w-36 sm:h-40 sm:w-40 p-2.5",
};

interface CompanyLogoProps {
  size?: LogoSize;
  className?: string;
  priority?: boolean;
}

export function CompanyLogo({ size = "md", className, priority }: CompanyLogoProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn(
          "relative shrink-0 rounded-full bg-white/95 shadow-[0_12px_30px_rgba(0,0,0,0.24)] ring-1 ring-white/40",
          containerSizeClasses[size]
        )}
      >
        <div className="relative flex h-full w-full shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-md">
          {/* Rotating Outer Text Ring */}
          <Image
            src={COMPANY_LOGO_RING_PATH}
            alt="Team Blanco Ring"
            fill
            sizes="(max-width: 768px) 100vw, 160px"
            priority={priority}
            className="object-contain animate-spin [animation-duration:12s]"
          />

          {/* Center Emblem Animation Sequence */}
          <Image
            src={COMPANY_LOGO_CENTER_PATH}
            alt="Team Blanco Center"
            width={120}
            height={120}
            priority={priority}
            style={{ animation: "cinematicEntry 7s ease-in-out infinite" }}
            className="relative z-10 h-[58%] w-[58%] object-contain"
          />

          <style>{`
            @keyframes cinematicEntry {
              0% {
                transform: perspective(600px) scale(0);
                opacity: 0;
              }
              15% {
                transform: perspective(600px) scale(1.15);
                opacity: 1;
              }
              25% {
                transform: perspective(600px) scale(1);
              }
              35% {
                transform: perspective(600px) scale(1);
              }
              45% {
                transform: perspective(600px) scale(1) rotateY(-12deg) rotateX(5deg);
              }
              60% {
                transform: perspective(600px) scale(1) rotateY(0deg) rotateX(0deg);
              }
              75% {
                transform: perspective(600px) scale(1) rotateY(12deg) rotateX(-5deg);
              }
              85%, 100% {
                transform: perspective(600px) scale(1) rotateY(0deg) rotateX(0deg);
              }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}