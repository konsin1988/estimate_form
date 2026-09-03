import React, { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
} from "@tanstack/react-table";

import Modal from "./Modal";
import { getRevenueData, saveRevenueValues } from "../api/revenue.api";
import { revenueApiToTableTransformer } from "../scripts/RevenueApiToTableTransformer";
import { useRevenueColumns } from "../hooks/useRevenueColumns";
import type { GroupRow } from "..types/CostTypes";
import { updateRevenueValue } from "../scripts/updateRevenueValue";
import { useAuth } from "../auth/AuthProvider";
import { getLastUpdated } from "../scripts/getLastUpdated";
import { logUserUpdateValues } from "../api/logs.api";


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
  setLastUpdatedItem: React.Dispatch<
    React.SetStateAction<
      {
        user: string;
        last_updated: string;
      }[]
    >
  >;
};


export default function RevenueForecastTable ({ frc, hidePreviousMonths, setPendingChanges, setLastUpdatedItem }: Props){
    const mainTableRef = useRef(null);
    const minimapRef = useRef(null);

    const [ data, setData ] = useState<GroupRow[]>([]);
    const columns = useRevenueColumns(hidePreviousMonths);
    const { user, login } = useAuth();
    

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
          saveData: async (id: number, subgroupName: string, value: number) => {
            try {
              await saveRevenueValues([{id: id, subgroupName: subgroupName, value: value}]);
              await logUserUpdateValues({
                user: user,
                login: login,
                frc: frc,
                is_revenue: true,
                save_values: [{ id: id, subgroupName: subgroupName, value: value }] 
              });
              getLastUpdated({frc: frc, is_revenue: 1, setLastUpdatedItem: setLastUpdatedItem});
            } catch {
              console.log("Error in revenue table");
            }
          },
        }
    });


  return (
      <table className={`border-collapse border-spacing-0 border-b border-gray-200 mr-5`}>
        <thead> 
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  className={`min-w-28 
                              py-1 text-sm text-gray-700  
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
                  .map(cell => {
                    const isYearVar = cell.column.id === "year_var";
                    const isOverload = cell.getValue() > 0;
                    return (<td 
                      key={cell.id}
                      className={`
                          border-collapse px-2 py-1 text-center border-b border-b-gray-200
                          ${cell.column.id.endsWith("_plan")
                            ? "border-l-2 border-gray-200 bg-transparent"
                            : "bg-gray-100 border-l-1 border-gray-200"}
                          ${cell.column.id === "name"
                            ? "sticky bg-[#fafcff] left-0 z-20 border-none text-left"
                            : ""}
                          ${isYearVar
                            ? "border-r-2 border-gray-200 bg-transparent"
                            : ""}
                          ${isYearVar && row.original.type === "group" && isOverload 
                            ? "!bg-[#ffe9e8] text-gray-700"
                            : "" }
                      `}
                    >
                      {flexRender(
                        cell.column
                          .columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  )})}
              </tr>
            ))}
        </tbody>
      </table>
    );
}
