import { useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { useNumberFormatter } from "../hooks/useNumberFormatter";
import NumberInput from "../components/NumberInput";
import dayjs from "dayjs";
import ToggleCollapseButton from "../components/ToggleCollapseButton";

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
const thresholdMonth = dayjs().subtract(1, "month").startOf("month").format("YYYY-MM-DD"); 

const columnHelper =
  createColumnHelper<GroupRow | SubgroupRow>();

export function useRevenueColumns(hidePreviousMonths) {
  const { format, parse, checkNumbers } = useNumberFormatter();
  const currentMonthIndex = new Date().getMonth();

  return useMemo(() => {
    return [
      columnHelper.accessor("name", {
        header: "",

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
                className="shrink-0 mt-0.5"
              >
                {row.getIsExpanded()
                  ? "−"
                  : "+"}
              </button>
            )}

            <span className={`${row.getCanExpand()
                  ? "ml-2" 
                  : ""}`}>
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
            bgClass: `text-[#b2b2b8]
                ${index % 2 === 0
                ? "bg-gray-100"
                : "bg-gray-200"}`,
            monthSeparator: true,
            headerClassName: "sticky top-0 z-30 border-t border-t-gray-200",
          },

          columns: [
            columnHelper.display({
              id: `${month.key}_plan`,

              header: "План",
              meta: {
                monthSeparator: true,
                headerClassName: `
                    border-l-1 border-r border-r-gray-200 
                    border-b border-b-gray-200 border-l-gray-200 
                    bg-transparent sticky top-7 z-30 border-b-[#c3c5c9]
                ` 
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
                month.key < thresholdMonth
                  ? "Факт"
                  : "Прогноз",

              meta: {
                headerClassName: "bg-gray-100 border-b border-b-gray-200 sticky top-7 z-30 border-b-[#c3c5c9]" 
              },


              cell: ({ row, table }) => {
                const source = month.key < thresholdMonth ? "Факт" : "Прогноз";
                const rawAmount = row.original.values?.[month.key]?.[source]?.amount ?? 0; 
                const isEditable = row.original.values?.[month.key]?.[source]?.is_editable ?? false;
                if (!isEditable) {
                  return <span>{format(rawAmount)}</span>;
                }
                const recordId = row.original.values?.[month.key]?.[source]?.id || row.original.id;
                const subgroupName = row.original.values?.[month.key]?.[source]?.name || row.original.name; 

                return (
                  <NumberInput
                    value={format(rawAmount)}
                    onChange={newValue => {
                      table.options.meta?.updateData(
                        recordId,
                        subgroupName,
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
          bgClass: "bg-gray-100 text-[#b2b2b8]",
          monthSeparator: true,
          headerClassName:
            `sticky top-0 z-30 border-l-2 border-l-gray-200 
            border-b border-b-gray-200 border-t border-t-gray-200 
            border-r border-r-gray-200
            `,
        },
      
        columns: [
          columnHelper.display({
            id: "year_plan",
      
            header: "План",
            meta: {
              headerClassName: "bg-transparent sticky top-7 z-30 border-b border-b-gray-200 border-l-2 border-l-gray-200"
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
              headerClassName: "bg-gray-100 border-r border-r-gray-200 border-b border-b-gray-200 border-l border-l-gray-200  sticky top-7 z-30" 
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
