import React, { useEffect, useState, useMemo, useRef } from "react";
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
import { updateRevenueValue } from "../scripts/updateRevenueValue";


type Props = {
  frc: string;
  hidePreviousMonths: boolean;
  setPendingChanges: React.Dispatch<
    React.SetStateAction<
      {
        id: number;
        field: string;
        value: number;
      }[]
    >
  >;
};


export default function RevenueForecastTable ({ frc, hidePreviousMonths, setPendingChanges }: Props){
    const mainTableRef = useRef(null);
    const minimapRef = useRef(null);

    const [ data, setData ] = useState<GroupRow[]>([]);
    const columns = useRevenueColumns(hidePreviousMonths);

    const handleMinimapScroll = () => {
      if (isSyncingMini.current) return;
      
      const main = mainTableContainerRef.current;
      const mini = minimapRef.current;
      if (!main || !mini) return;

      isSyncingMain.current = true;
      const ratio = mini.scrollLeft / (mini.scrollWidth - mini.clientWidth);
      main.scrollLeft = ratio * (main.scrollWidth - main.clientWidth);

    };
    const handleMainScroll = () => {
      if (isSyncingMain.current) return;

      const main = mainTableContainerRef.current;
      const mini = minimapRef.current;
      if (!main || !mini) return;

      isSyncingMini.current = true;
      const ratio = main.scrollLeft / (main.scrollWidth - main.clientWidth);
      mini.scrollLeft = ratio * (mini.scrollWidth - mini.clientWidth);

      setTimeout(() => { isSyncingMini.current = false; }, 50);
    };

      

    useEffect(() => {
      const fetchData = async () => {
        try {
          const raw_data = await getRevenueData(frc);
          const transformedData = revenueApiToTableTransformer(raw_data);
          setData(transformedData);
          
          table.toggleAllRowsExpanded(true)
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
            subgroupName: string,
            value: number,
          ) => { 
            setPendingChanges(old => {
                const exists = old.some(
                    x =>
                        x.id === id &&
                        x.subgroupName === subgroupName
                );
            
                if (exists) {
                    return old.map(x =>
                        x.id === id &&
                        x.subgroupName === subgroupName
                            ? { ...x, value }
                            : x
                    );
                }
            
                return [...old, { id, subgroupName, value }];
            });

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
