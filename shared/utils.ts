/**
 * Get the full display name from a user with first_name/last_name fields.
 * Works with any object that has firstName/lastName or first_name/last_name.
 */
export function getFullName(user: { firstName?: string | null; lastName?: string | null; first_name?: string | null; last_name?: string | null } | null | undefined): string {
  if (!user) return '';
  const first = user.firstName || user.first_name || '';
  const last = user.lastName || user.last_name || '';
  return last ? `${first} ${last}` : first;
}
