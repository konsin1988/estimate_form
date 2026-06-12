import type { UserFrcRow } from "../types/UserTypes";

type AuthData = {
  revenueFrc: string[];
  costFrc: string[];
  isDup: boolean;
};

export function buildFrcList(
  rows: UserFrcRow[] = []
): AuthData {
  const revenueFrc = new Set<string>();
  const costFrc = new Set<string>();
  let isDup = false;

  for (const row of rows) {
    if (row.is_revenue === 1) {
      revenueFrc.add(row.frc);
    }

    if (row.is_cost === 1) {
      costFrc.add(row.frc);
    }

    if (row.is_dup === 1) {
      isDup = true;
    }
  }

  return {
    revenueFrc: Array.from(revenueFrc),
    costFrc: Array.from(costFrc),
    isDup,
  };
}
