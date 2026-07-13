import { useState, useEffect } from "react"

import { useAuth } from "../auth/AuthProvider";
import FrcChoice from "../components/FrcChoice";
import SubmitButton from "../components/SubmitButton";
import RevenueForecastTable from "../components/RevenueForecastTable";
import { useOutletContext } from 'react-router-dom';
import { saveRevenueValues } from "../api/revenue.api";
import { logUserVisit, logUserUpdateValues } from "../api/logs.api";

export default function RevenueForecastPage() {
  const {user, login, revenueFrc} = useAuth();
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
    try {
      await saveRevenueValues(pendingChanges);
      const response = await logUserUpdateValues({
        user: user,
        login: login,
        frc: frc,
        is_revenue: true,
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
          is_revenue: true 
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
