import { useEffect } from "react";
import type { Table } from '@tanstack/react-table';

interface ColumnHeaderProps {
  table: Table<any>;
}

export default function ToggleCollapseButton({ table }: ColumnHeaderProps) {
  const buttonStyle = "shrink-0 ml-15 text-sm text-gray-100 font-bold min-w-30 max-w-30 border py-0.5 rounded bg-[#8a8a92] active:scale-102 active:shadow-lg"

  return (
          <div className="flex items-center gap-2 px-3">
            <button
              onClick={table.getToggleAllRowsExpandedHandler()}
              className={`${ buttonStyle } ${table.getIsAllRowsExpanded() ? 'bg-[#a18775] text-white font-bold' : ''}`}
            >
              {table.getIsAllRowsExpanded() ? "Скрыть счета" : "Показать счета"}
            </button>
          </div>
  );
}
