/**
 * Compares dotted version strings numerically, so "1.10.0" is newer than
 * "1.9" — a plain string comparison gets that backwards. Missing parts count
 * as 0, so "1.2" equals "1.2.0".
 */
export function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map((n) => parseInt(n, 10) || 0);
  const pb = b.split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff < 0 ? -1 : 1;
  }
  return 0;
}

export interface VersionRule {
  minVersion?: string | null;
  latestVersion?: string | null;
}

/**
 * What the installed store version must do about the server's policy:
 * `required` blocks the app until it is updated, `available` offers an update
 * the shopper can dismiss, `none` carries on. Anything unknown — no installed
 * version, no policy — is `none`: the app must never lock someone out because
 * a value is missing.
 */
export function updateRequirement(
  installed: string | null | undefined,
  rule: VersionRule | null | undefined,
): 'required' | 'available' | 'none' {
  if (!installed || !rule) return 'none';
  if (rule.minVersion && compareVersions(installed, rule.minVersion) < 0) return 'required';
  if (rule.latestVersion && compareVersions(installed, rule.latestVersion) < 0) return 'available';
  return 'none';
}
