import { useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { useNumberFormatter } from "../hooks/useNumberFormatter";
import NumberInput from "../components/NumberInput";
import dayjs from "dayjs";
import ToggleMultiLevelButton from "../components/ToggleMultiLevelButton";

import type {
  GroupRow,
  SubgroupRow,
} from "../types/CostTypes";

const months = [
  { key: "2026-01-01", name: "Январь" },
  { key: "2026-02-01", name: "Февраль" },
  { key: "2026-03-01", name: "Март" },
  { key: "2026-04-01", name: "Апрель" },
  { key: "2026-05-01", name: "Май" },
  { key: "2026-06-01", name: "Июнь" },
  { key: "2026-07-01", name: "Июль" },
  { key: "2026-08-01", name: "Август" },
  { key: "2026-09-01", name: "Сентябрь" },
  { key: "2026-10-01", name: "Октябрь" },
  { key: "2026-11-01", name: "Ноябрь" },
  { key: "2026-12-01", name: "Декабрь" },
];

const currentMonth = dayjs().startOf("month").format("YYYY-MM-DD");

const columnHelper =
  createColumnHelper<GroupRow | SubgroupRow>();

export function useDupColumns(hidePreviousMonths) {
  const { format, parse, checkNumbers } = useNumberFormatter();
  const currentMonthIndex = new Date().getMonth();

  return useMemo(() => {
    return [
      columnHelper.accessor("name", {
        header: ({ table }) => (
          <ToggleMultiLevelButton table={table} /> 
        ),

        cell: ({ row, getValue }) => (
          <div
            style={{
              paddingLeft: row.depth * 20,
            }}
            className="text-start px-3 min-w-60 max-w-60"
          >
            {row.getCanExpand() && (
              <button
                onClick={
                  row.getToggleExpandedHandler()
                }
                className={`shrink-0 mt-0.5`}
              >
                {row.getIsExpanded()
                  ? "−"
                  : "+"}
              </button>
            )}

            <span className={`${row.getCanExpand()
                  ? "ml-2" 
                  : ""}
                  ${row.depth === 0 ? "text-black": ''}
                  ${row.depth === 1 ? "text-gray-600": ''}
                  ${row.getIsExpanded() && row.depth === 0 ? "text-red-400 underline" : ""}
                  ${row.getIsExpanded() && row.depth === 1 ? "text-gray-900 font-bold underline" : ""}
                  `}>
              {getValue()}
            </span>
          </div>
        ),
      }),

      ...months
      .filter((month, index) => {
          if (!hidePreviousMonths) return true; 
          return index >= currentMonthIndex; 
        })
      .map((month, index) => 
        columnHelper.group({
          id: `${month.key}_month`,

          header: month.name,

          meta: {
            bgClass: `text-white 
                ${index % 2 === 0
                ? "bg-gray-800"
                : "bg-gray-700"}`,
            monthSeparator: true,
            headerClassName: "sticky top-0 z-30 border-none" 
          },

          columns: [
            columnHelper.display({
              id: `${month.key}_plan`,

              header: "План",
              meta: {
                monthSeparator: true,
                headerClassName: "border-l-2 border-l-black bg-gray-100 sticky top-7 z-30 border-b-black" 
              },

              cell: ({ row }) => {
                return (
                  format(row.original.values?.[
                    month.key
                  ]?.["План"]?.amount ?? "")
                );
              },
            }),

            columnHelper.display({
              id: `${month.key}_factForecast`,

              header:
                month.key < currentMonth
                  ? "Факт"
                  : "Прогноз",

              meta: {
                headerClassName: "bg-gray-200 sticky top-7 z-30 border-b-black" 
              },


              cell: ({ row, table }) => {
                const source = month.key < currentMonth ? "Факт" : "Прогноз";
                const rawAmount = row.original.values?.[month.key]?.[source]?.amount ?? 0; 
                const isEditable = row.original.values?.[month.key]?.[source]?.is_editable ?? false;
                if (!isEditable) {
                  return <span>{format(rawAmount)}</span>;
                }
                const recordId = row.original.values?.[month.key]?.[source]?.id || row.original.id;
                return (
                  <NumberInput
                    value={format(rawAmount)}
                    onChange={newValue => {
                      table.options.meta?.updateData?.(
                        recordId,
                        newValue
                      );
                    }}
                    onBlur={newValue => {
                      table.options.meta?.saveData(
                        recordId, 
                        newValue 
                      );
                    }}
                  />
                );
              }
            }),
          ],
        })
      ),


      columnHelper.group({
        id: "year_total",
      
        header: "Год, всего",
      
        meta: {
          bgClass: "bg-gray-900 text-white",
          monthSeparator: true,
          headerClassName:
            "sticky top-0 z-30 border-l-2 border-l-black",
        },
      
        columns: [
          columnHelper.display({
            id: "year_plan",
      
            header: "План",
            meta: {
              headerClassName: "bg-gray-200 sticky top-7 z-30 border-b-black border-l-2 border-l-black" 
            },
      
            cell: ({ row }) => {
              const total = months.reduce(
                (sum, month) =>
                  sum +
                  (row.original.values?.[
                    month.key
                  ]?.["План"]?.amount ?? 0),
                0
              );
      
              return format(total);
            },
          }),
      

          columnHelper.display({
            id: "year_factForecast",
      
            header: "Факт+Прогноз",

            meta: {
              headerClassName: "bg-gray-200 sticky top-7 z-30 border-b-black" 
            },
      
            cell: ({ row }) => {
              const total = months.reduce(
                (sum, month) => {
                  const source =
                    month.key < currentMonth
                      ? "Факт"
                      : "Прогноз";
      
                  return (
                    sum +
                    (row.original.values?.[
                      month.key
                    ]?.[source]?.amount ?? 0)
                  );
                },
                0
              );
      
              return format(total);
            },
          }),
        ],
      }),
    ];
  }, [hidePreviousMonths]);
}
