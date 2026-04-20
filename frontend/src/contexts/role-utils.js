export function normalizeRole(role) {
  if (!role) return null;

  const value = String(role).trim().toLowerCase();

  if (value === 'client') return 'Client';
  if (value === 'dietician') return 'Dietician';
  if (value === 'admin') return 'Admin';

  return role;
}

export function inferRoleFromProfile(profile) {
  if (!profile || typeof profile !== 'object') return null;

  if ('title' in profile || 'appointment_duration' in profile || 'work_time_start' in profile) {
    return 'Dietician';
  }

  if ('weight' in profile || 'height' in profile || 'allergies' in profile || 'chronic_conditions' in profile) {
    return 'Client';
  }

  return null;
}

export function resolveUserRole(...candidates) {
  for (const candidate of candidates) {
    const normalized = normalizeRole(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return null;
}
