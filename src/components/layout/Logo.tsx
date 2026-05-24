import { cn } from "@/lib/utils";
import plennaLogo from "@/assets/plenna-logo.png";

interface LogoProps {
  showWordmark?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "onDark";
}

const sizeMap = {
  sm: { full: "h-7", mark: "h-7 w-7" },
  md: { full: "h-9", mark: "h-9 w-9" },
  lg: { full: "h-12", mark: "h-12 w-12" },
};

export function Logo({ showWordmark = true, className, size = "md" }: LogoProps) {
  const s = sizeMap[size];
  return (
    <div className={cn("flex items-center", className)}>
      <img
        src={plennaLogo}
        alt="Plenna — Sua vida financeira. Plena."
        className={cn(showWordmark ? s.full : s.mark, "w-auto object-contain")}
        style={!showWordmark ? { objectPosition: "left center", width: "auto" } : undefined}
      />
    </div>
  );
}