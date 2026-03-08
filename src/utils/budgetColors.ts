/**
 * Returns a Tailwind class for budget progress bars based on percentage spent.
 * 0-70%: green (safe), 70-90%: amber (warning), 90%+: red (danger)
 */
export const getBudgetProgressColor = (percentual: number): string => {
  if (percentual >= 90) return "bg-red-500";
  if (percentual >= 70) return "bg-amber-500";
  return "bg-green-500";
};

/**
 * Returns a CSS class string for [&>div] Progress component overrides.
 */
export const getBudgetProgressClass = (percentual: number): string => {
  if (percentual >= 90) return "[&>div]:bg-red-500";
  if (percentual >= 70) return "[&>div]:bg-amber-500";
  return "[&>div]:bg-green-500";
};
