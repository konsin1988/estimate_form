import { useState, useEffect } from "react"
import { useOutletContext } from 'react-router-dom';

import { useAuth } from "../auth/AuthProvider";
import SubmitButton from "../components/SubmitButton";
import DupForecastTable from "../components/DupForecastTable";
import { saveCostsValues } from "../api/costs.api";


export default function DupCostPage() {
  const frc = "Управление персоналом";
  const [ hidePreviousMonths ] = useOutletContext();
  const [pendingChanges, setPendingChanges] = useState<
    {
      id: number;
      value: number;
    }[]
  >([]);

  const handleSubmit = async()=>{
    await saveCostsValues(pendingChanges);
    setPendingChanges([]);
  };

  return (
    <>
      <div className={`
                    fixed top-[19%] h-[67%] 
                    overflow-x-auto left-3 right-0 flex 
                    flex-col items-start custom-scrollbar
        `}>
        < DupForecastTable 
          frc={frc} 
          hidePreviousMonths={hidePreviousMonths} 
          setPendingChanges={setPendingChanges}
        />
      </div>
      <SubmitButton frc={frc} is_revenue={0} is_cost={0} onSubmit={handleSubmit}/>
    </>
  );
}

