import { useState, useEffect } from "react"

import { useAuth } from "../auth/AuthProvider";
import FrcChoice from "../components/FrcChoice";
import SubmitButton from "../components/SubmitButton";
import CostForecastTable from "../components/CostForecastTable";
import { useOutletContext } from 'react-router-dom';
import { saveCostsValues } from "../api/costs.api";
import { logUserVisit, logUserUpdateValues } from "../api/logs.api";

export default function CostForecastPage() {
  const {user, login, costsFrc} = useAuth();
  const [ frc, setFrc ] = useState<string>(costsFrc[0]);
  const [ hidePreviousMonths ] = useOutletContext();
  const [pendingChanges, setPendingChanges] = useState<
    {
      id: number;
      value: number;
    }[]
  >([]);

  //const handleSubmit = async()=>{
  //  await saveCostsValues(pendingChanges);
  //  setPendingChanges([]);
  //};


  const handleSubmit = async()=>{
    try {
      await saveCostsValues(pendingChanges);
      const response = await logUserUpdateValues({
        user: user,
        login: login,
        frc: frc,
        is_revenue: false,
        save_values: pendingChanges
      });
      console.log("Success:", response.message);
      
      setPendingChanges([]); 
    } catch (error) {
      console.error("Failed to sync values with Django backend:", error);
    }
  };

  useEffect(() => {
    const triggerVisitLog = async () => {
      try {
        const response = await logUserVisit({
          user: user,
          login: login,
          frc: frc,
          is_revenue: false, 
        });
        console.log("Visit log processed:", response.message);
      } catch (error) {
        console.error("Failed to log user visit:", error);
      }
    };

    triggerVisitLog();
  }, [frc]);


  return (
    <>
          <FrcChoice
            frc={frc}
	        	setFrc={setFrc}
	        	listFrc={costsFrc} 
          /> 
          <div className={`
                    fixed top-[19%] h-[67%] 
                    overflow-x-auto left-3 right-0 flex 
                    flex-col items-start custom-scrollbar
                    `}>
            < CostForecastTable 
              frc={frc} 
              hidePreviousMonths={hidePreviousMonths} 
              setPendingChanges={setPendingChanges}
            />
          </div>
          <SubmitButton frc={frc} is_revenue={0} is_cost={1} onSubmit={handleSubmit}/>
    </>
  );
}
