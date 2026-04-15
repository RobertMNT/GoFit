// Comprueba si un email pertenece a un administrador
// Configura ADMIN_EMAILS en .env.local como lista separada por comas
export function isAdmin(email: string | undefined | null): boolean {
  if (!email) return false;
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email.toLowerCase());
}
