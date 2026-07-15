import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import debounce from "lodash.debounce";
import dayjs from "dayjs";
import axios from "axios";

import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
} from "@tanstack/react-table";

import Modal from "./Modal";
import { getDupData } from "../api/dup.api";
import { dupApiToTableTransformer } from "../scripts/DupApiToTableTransformer";
import { useDupColumns } from "../hooks/useDupColumns";
import type { DupDivisionRow } from "..types/DupTypes";
import { updateDupValue } from "../scripts/updateDupValue";

const MONTHS_RU = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь", "Год, всего"];

type DupForecastProps = {
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


export default function DupForecastTable ({ frc, hidePreviousMonths, setPendingChanges }: DupForecastProps){
    const [ data, setData ] = useState<DupDivisionRow[]>([]);

    const columns = useDupColumns(hidePreviousMonths);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const raw_data = await getDupData();
          const transformedData = dupApiToTableTransformer(raw_data);
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
    
        getSubRows: row => row.subRows ?? [], 

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

            setData(old => updateDupValue(old, id, value));
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
                  row.original.type === "division"
                    ? "font-bold text-sm pt-2 text-gray-900"
                    : 
                      row.original.type === "frc" 
                      ? "text-sm font-bold text-gray-700 border-y border-collapse border-gray-700"
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
