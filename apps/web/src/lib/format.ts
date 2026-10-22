const toThousands = (value: number): string => `$${Math.round(value / 1000)}k`;

export function formatSalaryRange(min?: number | null, max?: number | null): string | null {
  if (min != null && max != null) {
    return `${toThousands(min)} – ${toThousands(max)}`;
  }
  if (min != null) {
    return toThousands(min);
  }
  if (max != null) {
    return toThousands(max);
  }
  return null;
}
