import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
} from "@tanstack/react-table";

import Modal from "./Modal";
import { getRevenueData } from "../api/revenue.api";
import { revenueApiToTableTransformer } from "../scripts/RevenueApiToTableTransformer";
import { useRevenueColumns } from "../hooks/useRevenueColumns";
import type { GroupRow } from "..types/CostTypes";
import { saveRevenueValue } from "../api/revenue.api";
import { updateRevenueValue } from "../scripts/updateRevenueValue";


type Props = {
  frc: string;
  hidePreviousMonths: boolean;
};


export default function RevenueForecastTable ({ frc, hidePreviousMonths }: Props){
    const [ data, setData ] = useState<GroupRow[]>([]);

    const columns = useRevenueColumns(hidePreviousMonths);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const raw_data = await getRevenueData(frc);
          const transformedData = revenueApiToTableTransformer(raw_data);
          setData(transformedData);
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
            field: string,
            value: number,
          ) => { 
            await saveRevenueValue(id, field, value);
          },
          updateData: async (
            id: number,
            subgroupName: string,
            value: number,
          ) => { 
            setData(old => updateRevenueValue(old, id, subgroupName, value));
          }, 
        }
    });


  return (
      <table className={`border-collapse mb-20 mr-10 `}>
        <thead> 
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  className={`border min-w-28 border-gray-400
                              py-1 text-sm text-gray-700 
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
                    ? "font-bold text-[1.18vw] pt-2"
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
                          px-2 py-1 text-center 
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
