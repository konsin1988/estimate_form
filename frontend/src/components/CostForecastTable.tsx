import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateField, saveEst } from "../store/estSlice";
import debounce from "lodash.debounce";
import dayjs from "dayjs";
import axios from "axios";

import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
} from "@tanstack/react-table";

import { useNumberFormatter } from "../hooks/useNumberFormatter";
import Modal from "./Modal";
import { getCostData } from "../api/costs.api";
import { getDelta } from "../scripts/getDelta";
import { costApiToTableTransformer } from "../scripts/CostApiToTableTransformer";
import { useCostColumns } from "../hooks/useCostColumns";
import type { GroupRow } from "..types/CostTypes";

const MONTHS_RU = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь", "Год, всего"];
const ROW_NAMES = ["Выручка", "Контракт", "ВСК", "Прогноз"]; 

type CostForecastProps = {
  frc: string;
};


export default function CostForecastTable ({ frc }: CostForecastProps){
    const [ data, setData ] = useState<GroupRow[]>([]);

    const columns = useCostColumns();

    useEffect(() => {
      const fetchData = async () => {
        try {
          const raw_data = await getCostData(frc);
          const transformedData = costApiToTableTransformer(raw_data);
          setData(transformedData);
          console.log(transformedData);
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
    });

  return (
    <table>
      <thead>
        {table
          .getHeaderGroups()
          .map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(
                header => (
                  <th key={header.id}>
                    {flexRender(
                      header.column
                        .columnDef.header,
                      header.getContext()
                    )}
                  </th>
                )
              )}
            </tr>
          ))}
      </thead>

      <tbody>
        {table
          .getRowModel()
          .rows.map(row => (
            <tr key={row.id}>
              {row
                .getVisibleCells()
                .map(cell => (
                  <td key={cell.id}>
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
