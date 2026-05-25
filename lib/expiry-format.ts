export function formatExpiry(expiresAt: string | null | undefined): string | null {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "Expired";
  const totalMins = Math.floor(ms / 60000);
  if (totalMins < 60) return `Expires in ${totalMins}m`;
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hrs < 24) return mins > 0 ? `Expires in ${hrs}h ${mins}m` : `Expires in ${hrs}h`;
  const days = Math.floor(hrs / 24);
  const remHrs = hrs % 24;
  return remHrs > 0 ? `Expires in ${days}d ${remHrs}h` : `Expires in ${days}d`;
}
