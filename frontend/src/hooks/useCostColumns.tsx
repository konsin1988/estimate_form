import { useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";

import type {
  GroupRow,
  SubgroupRow,
} from "../types/CostTypes";

const columnHelper =
  createColumnHelper<GroupRow | SubgroupRow>();

export function useCostColumns() {
  return useMemo(() => {
    return [
      columnHelper.accessor("name", {
        header: "Статья",

        cell: ({ row, getValue }) => (
          <div
            style={{
              paddingLeft:
                `${row.depth * 20}px`,
            }}
          >
            {row.getCanExpand() && (
              <button
                type="button"
                onClick={
                  row.getToggleExpandedHandler()
                }
              >
                {row.getIsExpanded()
                  ? "−"
                  : "+"}
              </button>
            )}

            {" "}
            {getValue()}
          </div>
        ),
      }),
    ];
  }, []);
}
