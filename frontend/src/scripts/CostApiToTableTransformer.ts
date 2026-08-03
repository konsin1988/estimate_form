import type { ApiCostRow, TotalRow, GroupEntry }  from "../types/CostTypes"; 

export function costApiToTableTransformer(
  rows: ApiCostRow[] = [],
): TotalRow[] {

  const groupsMap = new Map<string, GroupEntry>();

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
        subgroupMap: new Map(),
      };

      groupsMap.set(row.group, groupEntry);
    }

    let subgroup =
      groupEntry.subgroupMap.get(row.subgroup);

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

      groupEntry.group.subRows.push(subgroup);
    }

    const subgroupMonthValues =
      subgroup.values[row.month] ??
      (subgroup.values[row.month] = {});
    
    subgroupMonthValues[row.source] = {
      id: row.id,
      amount: row.amount,
      is_editable: Boolean(row.is_editable),
    };
    
    const groupMonthValues =
      groupEntry.group.values[row.month] ??
      (groupEntry.group.values[row.month] = {});
    
    const aggregatedValue =
      groupMonthValues[row.source] ??
      (groupMonthValues[row.source] = {
        amount: 0,
      });
    
    aggregatedValue.amount += row.amount;
  }
  const groups = Array.from(groupsMap.values()).map(
    entry => entry.group
  );

  const totalValues: TotalRow["values"] = {};
  
  for (const group of groups) {
      for (const [month, sources] of Object.entries(group.values)) {
          totalValues[month] ??= {};
  
          for (const [source, cell] of Object.entries(sources)) {
  
              totalValues[month][source] ??= {
                  amount: 0,
              };
  
              totalValues[month][source].amount += cell.amount;
          }
      }
  }

  return [
      {
          id: "total",
          type: "total",
          name: "Итого",
          values: totalValues,
          subRows: groups,
      },
  ];

}
