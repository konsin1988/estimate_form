import { useEffect } from "react";
import type { Table } from '@tanstack/react-table';

interface ColumnHeaderProps {
  table: Table<any>;
}

export default function ToggleCollapseButton({ table }: ColumnHeaderProps) {
  const buttonStyle = "shrink-0 ml-15  font-bold min-w-31 max-w-31 border py-0.5 rounded active:scale-102 active:shadow-lg"

  return (
          <div className="flex items-center gap-2 px-3 text-[12px]">
            <button
              onClick={table.getToggleAllRowsExpandedHandler()}
              className={`${ buttonStyle } ${table.getIsAllRowsExpanded() ? 'bg-[#a18775] text-white font-bold' : 'bg-gray-300 text-gray-700'}`}
            >
              {table.getIsAllRowsExpanded() ? "Скрыть статьи 1С" : "Показать статьи 1С"}
            </button>
          </div>
  );
}
