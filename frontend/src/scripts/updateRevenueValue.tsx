import type {
  GroupRow,
  SubgroupRow,
} from "../types/CostTypes";

function recalculateGroup(group: GroupRow): GroupRow {
  const values = structuredClone(group.values);

  for (const month of Object.keys(values)) {
    if (values[month]["Прогноз"]) {
      values[month]["Прогноз"].amount = 0;
    }
  }

  for (const subgroup of group.subRows) {
    for (const [month, sources] of Object.entries(
      subgroup.values
    )) {
      const forecast = sources["Прогноз"];

      if (!forecast) continue;

      values[month] ??= {};

      values[month]["Прогноз"] ??= {
        amount: 0,
      };

      values[month]["Прогноз"].amount +=
        forecast.amount;
    }
  }

  return {
    ...group,
    values,
  };
}

export function updateRevenueValue(
  rows: GroupRow[],
  id: number,
  subgroupName: string,
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
                    cell.id === id &&
                    subgroup.name === subgroupName
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
