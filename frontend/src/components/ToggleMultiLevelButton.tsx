import type { Table } from '@tanstack/react-table';

interface MultiLevelHeaderProps {
  table: Table<any>;
}

export default function MultiLevelHeader({ table }: MultiLevelHeaderProps) {
  const allRows = table.getCoreRowModel().flatRows;

  const toggleDepth = (targetDepth: number) => {
    const currentExpanded = table.getState().expanded;
    const rowsAtDepth = allRows.filter(row => row.depth === targetDepth);
    
    const areAllExpanded = rowsAtDepth.every(row => currentExpanded[row.id] === true);
    const newExpanded = { ...currentExpanded };

    // --- NEW LOGIC ADDED HERE ---
    if (targetDepth === 0 && areAllExpanded) {
      // If we are collapsing Level 0, wipe out the ENTIRE expanded state object
      // This instantly closes all depths, including Level 1
      table.setExpanded({}); 
      return;
    }
    // -----------------------------

    rowsAtDepth.forEach(row => {
      if (areAllExpanded) {
        delete newExpanded[row.id];
      } else {
        newExpanded[row.id] = true;
      }
    });

    table.setExpanded(newExpanded);
    //const currentExpanded = table.getState().expanded;
    //const rowsAtDepth = allRows.filter(row => row.depth === targetDepth);
    //
    //const areAllExpanded = rowsAtDepth.every(row => currentExpanded[row.id] === true);

    //const newExpanded = { ...currentExpanded };

    //rowsAtDepth.forEach(row => {
    //  if (areAllExpanded) {
    //    delete newExpanded[row.id];
    //  } else {
    //    newExpanded[row.id] = true;
    //  }
    //});

    //table.setExpanded(newExpanded);
  };

  const styles = `shrink-0 text-sm bg-[#8a8a92] text-gray-100 py-0.5 font-bold min-w-28 max-w-28 py-0.5 active:scale-102 active:shadow-lg`

  const currentExpanded = table.getState().expanded;
  const level0Rows = allRows.filter(r => r.depth === 0);
  const level1Rows = allRows.filter(r => r.depth === 1);
  
  const isLvl0Expanded = level0Rows.length > 0 && level0Rows.every(r => currentExpanded[r.id]);
  const isLvl1Expanded = level1Rows.length > 0 && level1Rows.every(r => currentExpanded[r.id]);

  return (
    <div className="flex flex-col gap-1 items-center ">
      <div className="flex gap-1">
      <button
          onClick={() => toggleDepth(0)}

          className= { `${styles} ${isLvl0Expanded ? 'bg-[#a18775] text-white font-bold' : ''}`  }
        >
          {isLvl0Expanded ? "Скрыть ЦФО" : "Показать ЦФО"}
        </button>

        {isLvl0Expanded && <button
          onClick={() => toggleDepth(1)}
          className={ `${styles} ${isLvl1Expanded ? 'bg-[#a18775] text-white font-bold' : ''}` }
        >
          {isLvl1Expanded ? "Скрыть счета" : "Показать счета"}
        </button>}
      </div>
    </div>
  );
}
