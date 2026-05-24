import { cn } from "@/lib/utils";

interface LogoProps {
  showWordmark?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "onDark";
}

const sizeMap = {
  sm: { mark: "h-8 w-8", text: "text-lg", sub: "text-[9px]" },
  md: { mark: "h-10 w-10", text: "text-2xl", sub: "text-[10px]" },
  lg: { mark: "h-14 w-14", text: "text-3xl", sub: "text-[11px]" },
};

export function Logo({ showWordmark = true, className, size = "md", variant = "default" }: LogoProps) {
  const s = sizeMap[size];
  const stroke = variant === "onDark" ? "hsl(var(--primary-foreground))" : "hsl(var(--primary))";
  const text = variant === "onDark" ? "text-primary-foreground" : "text-primary";
  const sub = variant === "onDark" ? "text-primary-foreground/70" : "text-muted-foreground";
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className={cn("relative shrink-0", s.mark)} aria-hidden>
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
        >
          {/* Open ring (Plenna mark) */}
          <path
            d="M32 6 a26 26 0 1 1 -18.4 7.6"
            stroke={stroke}
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
          {/* Gold leaf */}
          <path
            d="M30 44 C28 38 30 32 36 28 C38 34 36 42 30 44 Z"
            fill="hsl(var(--accent-gold))"
          />
        </svg>
      </div>
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span className={cn("font-serif font-semibold tracking-tight", text, s.text)}>
            Plenna
          </span>
          {size !== "sm" && (
            <span className={cn("tracking-[0.16em] uppercase mt-1", sub, s.sub)}>
              Sua vida financeira. Plena.
            </span>
          )}
        </div>
      )}
    </div>
  );
}