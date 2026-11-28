/**
 * El backend devuelve el uptime en milisegundos (Date.now() - startTime);
 * se convierte a segundos antes de formatear.
 */
export function formatUptime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  if (seconds < 60) return 'menos de 1 min';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} h`;
  return `${Math.floor(seconds / 86400)} días`;
}
