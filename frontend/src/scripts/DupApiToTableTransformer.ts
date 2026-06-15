import type {  ApiDupRow, DupDivisionRow }  from "../types/DupTypes"; 

function addYearTotals(
  row: {
    values: Record<
      string,
      Record<string, { amount: number }>
    >;
  }
) {
  let planTotal = 0;
  let actualTotal = 0;

  for (const [month, sources] of Object.entries(
    row.values
  )) {
    if (month === "year_total") {
      continue;
    }

    planTotal +=
      sources["План"]?.amount ?? 0;

    actualTotal +=
      (sources["Факт"]?.amount ?? 0) +
      (sources["Прогноз"]?.amount ?? 0);
  }

  row.values["year_total"] = {
    План: {
      amount: planTotal,
    },

    "Факт+Прогноз": {
      amount: actualTotal,
    },
  };
}

export function dupApiToTableTransformer(
  rows: ApiDupRow[] = []
): DupDivisionRow[] {
  const divisionMap = new Map();

  for (const row of rows) {
    let divisionEntry =
      divisionMap.get(row.division);

    if (!divisionEntry) {
      divisionEntry = {
        division: {
          type: "division",
          name: row.division,
          values: {},
          subRows: [],
        },

        frcMap: new Map(),
      };

      divisionMap.set(
        row.division,
        divisionEntry
      );
    }

    const frcName =
      row.frc ?? "Без ЦФО";

    //let frcEntry =
    //  divisionEntry.frcMap.get(row.frc); 
    let frcEntry =
      divisionEntry.frcMap.get(frcName); 

    if (!frcEntry) {
      frcEntry = {
        frc: {
          type: "frc",
          name: frcName,
          values: {},
          subRows: [],
        },

        subgroupMap: new Map(),
      };

      divisionEntry.frcMap.set(
        frcName,
        frcEntry
      );

      divisionEntry.division.subRows.push(
        frcEntry.frc
      );
    }

    let subgroup =
      frcEntry.subgroupMap.get(
        row.subgroup
      );

    if (!subgroup) {
      subgroup = {
        type: "subgroup",
        name: row.subgroup,
        values: {},
      };

      frcEntry.subgroupMap.set(
        row.subgroup,
        subgroup
      );

      frcEntry.frc.subRows.push(
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

    const frcMonthValues =
      frcEntry.frc.values[row.month] ??
      (frcEntry.frc.values[row.month] =
        {});

    const frcValue =
      frcMonthValues[row.source] ??
      (frcMonthValues[row.source] = {
        amount: 0,
      });

    frcValue.amount += row.amount;

    const divisionMonthValues =
      divisionEntry.division.values[
        row.month
      ] ??
      (divisionEntry.division.values[
        row.month
      ] = {});

    const divisionValue =
      divisionMonthValues[row.source] ??
      (divisionMonthValues[row.source] = {
        amount: 0,
      });

    divisionValue.amount += row.amount;
  }

  for (const divisionEntry of divisionMap.values()) {
    addYearTotals(divisionEntry.division);
  
    for (const frcEntry of divisionEntry.frcMap.values()) {
      addYearTotals(frcEntry.frc);
  
      for (const subgroup of frcEntry.subgroupMap.values()) {
        addYearTotals(subgroup);
      }
    }
  }
  const divisionOrder = [
    "ФОТ",
    "Страховые взносы",
    "Прочие затраты на персонал",
    "Прочие расходы",
  ];

  const result = Array.from(
    divisionMap.values()
  ).map(entry => entry.division);

  return result.sort((a, b) => {
    const aIndex = divisionOrder.indexOf(a.name);
    const bIndex = divisionOrder.indexOf(b.name);
    return aIndex - bIndex;
  });
}
