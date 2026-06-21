import type {
  ApiRevenueRow,
  GroupRow,
  SubgroupRow,
} from "../types/RevenueTypes";

export function revenueApiToTableTransformer(
  rows: ApiRevenueRow[] = []
): GroupRow[] {
  const groupsMap = new Map();

  for (const row of rows) {
    let groupEntry = groupsMap.get(row.group);

    if (!groupEntry) {
      groupEntry = {
        group: {
          type: "group",
          name: row.group,
          values: {},
          subRows: [],
        },

        subgroupMap: new Map<
          string,
          SubgroupRow
        >(),
      };

      groupsMap.set(
        row.group,
        groupEntry
      );
    }

    if (!row.subgroup) {
      const monthValues =
        groupEntry.group.values[row.month] ??
        (groupEntry.group.values[row.month] =
          {});

      monthValues[row.source] = {
        id: row.id,
        amount: row.amount,
        is_editable: Boolean(
          row.is_editable
        ),
      };

      continue;
    }

    let subgroup =
      groupEntry.subgroupMap.get(
        row.subgroup
      );

    if (!subgroup) {
      subgroup = {
        type: "subgroup",
        name: row.subgroup,
        values: {},
      };

      groupEntry.subgroupMap.set(
        row.subgroup,
        subgroup
      );

      groupEntry.group.subRows.push(
        subgroup
      );
    }

    const subgroupMonthValues =
      subgroup.values[row.month] ??
      (subgroup.values[row.month] = {});

    subgroupMonthValues[row.source] = {
      id: row.id,
      amount: row.amount,
      is_editable: Boolean(
        row.is_editable
      ),
    };

    const groupMonthValues =
      groupEntry.group.values[row.month] ??
      (groupEntry.group.values[row.month] =
        {});

    const forecastTotal =
      groupMonthValues[row.source] ??
      (groupMonthValues[row.source] = {
        id: null,
        amount: 0,
        is_editable: false,
      });

    forecastTotal.amount +=
      row.amount;
  }

  return Array.from(
    groupsMap.values()
  ).map(entry => entry.group);
}
