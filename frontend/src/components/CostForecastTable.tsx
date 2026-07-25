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
import { updateCostValue } from "../scripts/updateCostValue";


type CostForecastProps = {
  frc: string;
  hidePreviousMonths: boolean;
  setPendingChanges: React.Dispatch<
    React.SetStateAction<
      {
        id: number;
        value: number;
      }[]
    >
  >;
};


export default function CostForecastTable ({ frc, hidePreviousMonths, setPendingChanges }: CostForecastProps){
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
          updateData: async (
            id: number,
            value: number,
          ) => { 

            setPendingChanges(old => {
                const exists = old.some(
                    x =>
                        x.id === id 
                );
            
                if (exists) {
                    return old.map(x =>
                        x.id === id 
                            ? { ...x, value }
                            : x
                    );
                }
            
                return [...old, { id, value }];
            });

            setData(old => updateCostValue(old, id, value));
          }, 
        }
    });

  return (
      <table className={`border-separate border-spacing-0 mr-5 border-b border-b-gray-200`}>
        <thead> 
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  className={`
                              min-w-28 py-1 text-sm text-gray-700 
                              ${header.column.columnDef.meta?.headerClassName ?? ""}
                              ${header.column.columnDef.meta?.monthSeparator 
                                ? "border-l-2 border-l-gray-200 border-b border-b-gray-200"
                                : ""
                              }
                              ${header.column.columnDef.meta?.bgClass ?? ""}
                              ${header.column.id === "name"
                                  ? header.depth === 1
                                    ? "sticky left-0 top-0 z-40 bg-[#fafcff]"
                                    : "sticky left-0 top-7 z-40 bg-[#fafcff]"
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
                    ? "font-bold text-[13px]  pt-2 border-l border-l-gray-200"
                    : "text-[12px] border-y border-collapse border-l border-gray-200"
                }
              >
                {row
                  .getVisibleCells()
                  .map(cell => (
                    <td 
                      key={cell.id}
                      className={`
                          border-collapse px-2 py-1 text-center border-b border-b-gray-200 
                          ${cell.column.id.endsWith("_plan")
                            ? "border-l-2 border-gray-200 bg-transparent"
                            : "bg-gray-100 border-l-1 border-gray-200"}
                          ${cell.column.id === "name"
                            ? "sticky bg-[#fafcff] left-0 z-20 border-none text-left"
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
