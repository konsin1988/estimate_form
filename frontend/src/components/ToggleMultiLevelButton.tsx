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

    if (targetDepth === 0 && areAllExpanded) {
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
  };

  const styles = `shrink-0 
                  text-sm 
                  rounded-lg
                  py-0.5 
                  font-bold 
                  min-w-31 
                  max-w-31 
                  py-0.5 
                  active:scale-102 
                  hover:bg-gray-300 
                  active:shadow-lg`

  const currentExpanded = table.getState().expanded;
  const level0Rows = allRows.filter(r => r.depth === 0);
  const level1Rows = allRows.filter(r => r.depth === 1);
  
  const isLvl0Expanded = level0Rows.length > 0 && level0Rows.every(r => currentExpanded[r.id]);
  const isLvl1Expanded = level1Rows.length > 0 && level1Rows.every(r => currentExpanded[r.id]);

  return (
    <div className="flex flex-col gap-1 items-center ">
      <div className="flex gap-1 text-[12px]">
      <button
          onClick={() => toggleDepth(0)}

          className= { `${styles} ${isLvl0Expanded ? "text-white bg-[#a18775] text-white font-bold" : 'text-gray-600 bg-gray-200'}`  }
        >
          {isLvl0Expanded ? "Скрыть ЦФО" : "Показать ЦФО"}
        </button>

        {isLvl0Expanded && <button
          onClick={() => toggleDepth(1)}
          className={ `${styles} ${isLvl1Expanded ? 'bg-[#a18775] text-white font-bold' : 'text-gray-500 bg-gray-200'}` }
        >
          {isLvl1Expanded ? "Скрыть статьи 1С" : "Показать статьи 1С"}
        </button>}
      </div>
    </div>
  );
}
