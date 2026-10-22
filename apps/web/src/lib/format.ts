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

export function formatDate(value?: string | null): string {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}
