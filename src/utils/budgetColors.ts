/**
 * Returns a Tailwind class for budget progress bars based on percentage spent.
 * 0-79%: green, 80-99%: amber, 100%+: red
 */
export const getBudgetProgressColor = (percentual: number): string => {
  if (percentual >= 100) return "bg-red-500";
  if (percentual >= 80) return "bg-amber-500";
  return "bg-green-500";
};

/**
 * Returns a CSS class string for [&>div] Progress component overrides.
 */
export const getBudgetProgressClass = (percentual: number): string => {
  if (percentual >= 100) return "[&>div]:bg-red-500";
  if (percentual >= 80) return "[&>div]:bg-amber-500";
  return "[&>div]:bg-green-500";
};
