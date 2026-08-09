import type {
  GroupRow,
  SubgroupRow,
  TotalRow,
} from "../types/CostTypes";

function recalculateTotal(
    groups: GroupRow[]
): TotalRow {

    const values = {};
    for (const group of groups) {
        for (const [month, sources] of Object.entries(group.values)) {
            values[month] ??= {};
            for (const [source, cell] of Object.entries(sources)) {
                values[month][source] ??= {
                    amount: 0,
                };
                values[month][source].amount +=
                    cell.amount;
            }
        }
    }

    return {
        type: "total",
        name: "Итого",
        values,
        subRows: groups,
    };
}

function recalculateGroup(group: GroupRow): GroupRow {
  const values: GroupRow["values"] = {};

  for (const subgroup of group.subRows) {
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
    ...group,
    values,
  };
}


export function updateCostValue(
  rows: TotalRow[],
  id: number,
  value: number
): TotalRow[] {

  const total = rows[0];
  
  if (total.type !== "total") {
    return rows;
  }

  const updatedGroups = total.subRows.map(group => {
    const updatedSubRows =
      group.subRows.map(subgroup => ({
        ...subgroup, 

        values: Object.fromEntries(
          Object.entries(subgroup.values).map(
            ([month, sources]) => [
              month,
              Object.fromEntries(
                Object.entries(sources).map(
                  ([source, cell]) => [
                    source,
                    cell.id === id
                      ? {
                          ...cell,
                          amount: value,
                        }
                      : cell,
                  ]
                )
              ),
            ]
          )
        ),
      }));

    return recalculateGroup({
      ...group,
      subRows: updatedSubRows,
    });
  });

  return [ recalculateTotal(updatedGroups) ];
}
