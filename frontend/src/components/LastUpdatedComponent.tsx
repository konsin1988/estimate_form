import React from "react";

import type { LastUpdatedItem } from "../types/LogTypes";

type LastUpdatedProps = {
  lastUpdatedItem: LastUpdatedItem;
};

export default function LastUpdatedComponent({ lastUpdatedItem }: LastUpdatedProps) {
  return (
		<div className="ml-5 mb-1 text-gray-400 text-[12px] fixed h-3/100 bottom-4/100 z-1000">
        <div>
          <span className="font-bold mr-1"> Последнее изменение: </span>
          <span> {lastUpdatedItem.user} </span>
          <span> {lastUpdatedItem.last_updated} </span>
        </div>
    </div>
  );
}
