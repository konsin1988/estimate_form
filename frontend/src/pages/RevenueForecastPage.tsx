import { useState, useEffect } from "react"

import { useAuth } from "../auth/AuthProvider";
import FrcChoice from "../components/FrcChoice";
import SubmitButton from "../components/SubmitButton";
import RevenueForecastTable from "../components/RevenueForecastTable";
import { useOutletContext } from 'react-router-dom';
import { saveRevenueValues } from "../api/revenue.api";

export default function RevenueForecastPage() {
  const {login, revenueFrc} = useAuth();
  const [ frc, setFrc ] = useState<string>(revenueFrc[0]);
  const [ hidePreviousMonths ] = useOutletContext();
  const [pendingChanges, setPendingChanges] = useState<
    {
      id: number;
      field: string;
      value: number;
    }[]
  >([]);

  const handleSubmit = async()=>{
    await saveRevenueValues(pendingChanges);
    setPendingChanges([]);
  };

  return (
    <>
          <FrcChoice
            frc={frc}
	        	setFrc={setFrc}
	        	listFrc={revenueFrc} 
          /> 
          <div className={`
                    fixed top-[19%] h-[67%] 
                    overflow-x-auto left-3 right-0 flex 
                    flex-col items-start custom-scrollbar
            `}>
            < RevenueForecastTable 
              frc={frc} 
              hidePreviousMonths={hidePreviousMonths} 
              setPendingChanges={setPendingChanges}
            />
          </div>
          <SubmitButton frc={frc} is_revenue={1} is_cost={0} onSubmit={handleSubmit} />
    </>
  );
}
