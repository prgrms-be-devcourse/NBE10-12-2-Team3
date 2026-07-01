const compactFormatter = new Intl.NumberFormat("ko-KR", { notation: "compact" });

export function formatCompact(value: number): string {
  return compactFormatter.format(value);
}
