export function checkBasicAuth(authHeader: string | null): boolean {
  const user = process.env.PANEL_USER;
  const pass = process.env.PANEL_PASS;
  if (!user || !pass) return false;
  if (!authHeader || !authHeader.startsWith("Basic ")) return false;
  const decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf8");
  const idx = decoded.indexOf(":");
  if (idx === -1) return false;
  return decoded.slice(0, idx) === user && decoded.slice(idx + 1) === pass;
}
