import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
} from "@tanstack/react-table";

import Modal from "./Modal";
import { getCostData } from "../api/costs.api";
import { costApiToTableTransformer } from "../scripts/CostApiToTableTransformer";
import { useCostColumns } from "../hooks/useCostColumns";
import type { GroupRow } from "..types/CostTypes";
import { saveCostValue } from "../api/costs.api";
import { updateCostValue } from "../scripts/updateCostValue";


type CostForecastProps = {
  frc: string;
  hidePreviousMonths: boolean;
};


export default function CostForecastTable ({ frc, hidePreviousMonths }: CostForecastProps){
    const [ data, setData ] = useState<GroupRow[]>([]);

    const columns = useCostColumns(hidePreviousMonths, frc);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const raw_data = await getCostData(frc);
          const transformedData = costApiToTableTransformer(raw_data);
          setData(transformedData);
          table.setExpanded({}); 
        } catch (error) {
          console.error(error);
        }
      };
      fetchData();
    }, [frc])


    const table = useReactTable({
        data,
        columns,
    
        getCoreRowModel:
          getCoreRowModel(),
    
        getExpandedRowModel:
          getExpandedRowModel(),

        getSubRows: row =>
          row.type === "group"
            ? row.subRows
            : [],

        meta: {
          saveData: async (
            id: number,
            value: number,
          ) => { 
            await saveCostValue(id, value);
          },
          updateData: async (
            id: number,
            value: number,
          ) => { 
            setData(old => updateCostValue(old, id, value));
          }, 
        }
    });

  return (
      <table className={`table-fixed w-max border-collapse mb-5 mr-10 `}>
        <thead> 
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  className={`border min-w-28 border-gray-400
                              py-1 h-9 w-28 text-sm text-gray-700 
                              ${header.column.columnDef.meta?.headerClassName ?? ""}
                              ${header.column.columnDef.meta?.monthSeparator 
                                ? "border-l-2 border-l-gray-800 "
                                : ""
                              }
                              ${header.column.columnDef.meta?.bgClass ?? ""}
                              ${header.column.id === "name"
                                  ? header.depth === 1
                                    ? "sticky left-0 top-0 z-40 bg-gray-200 border-none"
                                    : "sticky left-0 top-7 z-40 bg-gray-200 border-none" 
                                  : ""}
                  `}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody className={`text-gray-800`}>
          {table
            .getRowModel()
            .rows.map(row => (
              <tr 
                key={row.id}
                className={
                  row.original.type === "group"
                    ? "font-bold text-sm pt-2"
                    : "text-sm border-y border-collapse border-gray-700"
                }
              >
                {row
                  .getVisibleCells()
                  .map(cell => (
                    <td 
                      key={cell.id}
                      className={`
                          border border-collapse
                          px-2 py-1 h-9 text-center 
                          ${cell.column.id.endsWith("_plan")
                            ? "border-l-2 border-l-black bg-gray-100"
                            : ""}
                          ${cell.column.id === "name"
                            ? "sticky left-0 z-20 bg-gray-200 border-none text-left"
                            : ""}
                      `}
                    >
                      {flexRender(
                        cell.column
                          .columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
              </tr>
            ))}
        </tbody>
      </table>
  );
}
