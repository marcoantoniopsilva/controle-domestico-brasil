import { cn } from "@/lib/utils";

interface LogoProps {
  showWordmark?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { mark: "h-7 w-7", text: "text-sm", sub: "text-[9px]" },
  md: { mark: "h-9 w-9", text: "text-base", sub: "text-[10px]" },
  lg: { mark: "h-11 w-11", text: "text-lg", sub: "text-[11px]" },
};

export function Logo({ showWordmark = true, className, size = "md" }: LogoProps) {
  const s = sizeMap[size];
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "relative shrink-0 rounded-2xl bg-primary flex items-center justify-center shadow-card overflow-hidden",
          s.mark
        )}
        aria-hidden
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
        >
          <defs>
            <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="hsl(var(--primary-foreground))" stopOpacity="0.95" />
              <stop offset="100%" stopColor="hsl(var(--primary-foreground))" stopOpacity="0.65" />
            </linearGradient>
          </defs>
          {/* Ascending bars suggesting growth */}
          <rect x="7" y="18" width="3.5" height="7" rx="1.25" fill="url(#logo-grad)" />
          <rect x="14.25" y="13" width="3.5" height="12" rx="1.25" fill="url(#logo-grad)" />
          <rect x="21.5" y="8" width="3.5" height="17" rx="1.25" fill="url(#logo-grad)" />
          {/* Subtle trend line */}
          <path
            d="M6 14.5 L13 11 L20 7.5 L26 5"
            stroke="hsl(var(--primary-foreground))"
            strokeOpacity="0.55"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span className={cn("font-semibold tracking-tight text-foreground", s.text)}>
            Patrimo<span className="text-primary">.</span>
          </span>
          <span className={cn("text-muted-foreground tracking-[0.18em] uppercase mt-0.5", s.sub)}>
            Finanças em ordem
          </span>
        </div>
      )}
    </div>
  );
}