import type {
  DupDivisionRow,
  DupFrcRow,
  DupSubgroupRow,
} from "../types/DupTypes";

function recalculateFrc(
  frc: DupFrcRow
): DupFrcRow {
  const values: DupFrcRow["values"] = {};

  for (const subgroup of frc.subRows) {
    for (const [month, sources] of Object.entries(
      subgroup.values
    )) {
      values[month] ??= {};

      for (const [source, cell] of Object.entries(
        sources
      )) {
        values[month][source] ??= {
          amount: 0,
        };

        values[month][source].amount +=
          cell.amount;
      }
    }
  }

  return {
    ...frc,
    values,
  };
}

function recalculateDivision(
  division: DupDivisionRow
): DupDivisionRow {
  const values: DupDivisionRow["values"] = {};

  for (const frc of division.subRows) {
    for (const [month, sources] of Object.entries(
      frc.values
    )) {
      values[month] ??= {};

      for (const [source, cell] of Object.entries(
        sources
      )) {
        values[month][source] ??= {
          amount: 0,
        };

        values[month][source].amount +=
          cell.amount;
      }
    }
  }

  return {
    ...division,
    values,
  };
}


export function updateDupValue(
  rows: DupDivisionRow[],
  id: number,
  value: number
): DupDivisionRow[] {
  return rows.map(division => {
    const updatedFrcs =
      division.subRows.map(frc => {
        const updatedSubgroups =
          frc.subRows.map(subgroup => ({
            ...subgroup,

            values: Object.fromEntries(
              Object.entries(
                subgroup.values
              ).map(([month, sources]) => [
                month,
                Object.fromEntries(
                  Object.entries(
                    sources
                  ).map(([source, cell]) => [
                    source,
                    cell.id === id
                      ? {
                          ...cell,
                          amount: value,
                        }
                      : cell,
                  ])
                ),
              ])
            ),
          }));

        return recalculateFrc({
          ...frc,
          subRows: updatedSubgroups,
        });
      });

    return recalculateDivision({
      ...division,
      subRows: updatedFrcs,
    });
  });
}
