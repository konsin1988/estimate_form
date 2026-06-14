import type {
  GroupRow,
  SubgroupRow,
} from "../types/CostTypes";

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
  rows: GroupRow[],
  id: number,
  value: number
): GroupRow[] {
  return rows.map(group => {
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
}


//export function updateCostValue(
//  rows: GroupRow[],
//  id: number,
//  value: number
//): GroupRow[] {
//  return rows.map(group => ({
//    ...group,
//
//    subRows: group.subRows.map(subgroup => ({
//      ...subgroup,
//
//      values: Object.fromEntries(
//        Object.entries(subgroup.values).map(
//          ([month, sources]) => [
//            month,
//            Object.fromEntries(
//              Object.entries(sources).map(
//                ([source, cell]) => [
//                  source,
//                  cell.id === id
//                    ? {
//                        ...cell,
//                        amount: value,
//                      }
//                    : cell,
//                ]
//              )
//            ),
//          ]
//        )
//      ),
//    })),
//  }));
//}
