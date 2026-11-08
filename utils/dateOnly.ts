// Datas "só dia" (lançamento, assistido em, série completa) chegam da API como
// "2026-11-03" ou "2026-11-03T00:00:00.000Z". `new Date(valor)` lê isso como
// meia-noite UTC, e no Brasil (UTC-3) o dia exibido recua para 02/11 — além
// de o servidor (UTC) e o navegador renderizarem textos diferentes, o que
// quebra a hidratação. Aqui o dia do calendário é lido direto da string e
// montado no fuso local, então todo mundo enxerga o mesmo dia.

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;

export const parseDateOnly = (
  value: string | null | undefined,
): Date | null => {
  if (!value) return null;

  const match = DATE_ONLY_PATTERN.exec(value);
  if (!match) return null;

  const [, year, month, day] = match.map(Number);
  const date = new Date(year, month - 1, day);

  const isRealDay =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;

  return isRealDay ? date : null;
};

export const formatDateOnly = (
  value: string | null | undefined,
  options?: Intl.DateTimeFormatOptions,
): string | null => {
  const date = parseDateOnly(value);
  return date ? date.toLocaleDateString("pt-BR", options) : null;
};
