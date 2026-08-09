import { useState, useEffect } from "react"

import { useAuth } from "../auth/AuthProvider";
import FrcChoice from "../components/FrcChoice";
import SubmitButton from "../components/SubmitButton";
import  LastUpdatedComponent  from "../components/LastUpdatedComponent";
import CostForecastTable from "../components/CostForecastTable";

import { useOutletContext } from 'react-router-dom';
import { saveCostsValues } from "../api/costs.api";
import { logUserVisit, logUserUpdateValues, lastUpdated } from "../api/logs.api";

import type { LastUpdatedItem } from "../types/LogTypes";

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

  const [ lastUpdatedItem, setLastUpdatedItem ] = useState<LastUpdatedItem>({"user": "", "last_updated": ""});
  const [ isSaving, setIsSaving ] = useState(false);

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
      
      setPendingChanges([]); 
    } catch (error) {
      console.error("Failed to sync values with Django backend:", error);
    } finally {
      setIsSaving(prev => !prev);
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
  }, [ frc ]);


  useEffect(() => {
    const getLastUpdated = async () => {
      try {
        const response = await lastUpdated(frc, 0);
        setLastUpdatedItem({"user": response.user, "last_updated": response.last_updated})
        console.log("Get last_updated: user", response.user, " last_updated", response.last_updated );
      } catch (error) {
        console.error("Failed to upload last_updated:", error);
      }
    };

    getLastUpdated();
  }, [ frc, isSaving ]);

  return (
    <>
          <FrcChoice
            frc={frc}
	        	setFrc={setFrc}
	        	listFrc={costsFrc} 
          /> 
          <div className={`
                    fixed top-[19%] h-[69%] 
                    overflow-x-auto overflow-y-auto left-3 right-0 flex 
                    flex-col items-start custom-scrollbar
                    `}>
            < CostForecastTable 
              frc={frc} 
              hidePreviousMonths={hidePreviousMonths} 
              setPendingChanges={setPendingChanges}
            />
          </div>
          <LastUpdatedComponent lastUpdatedItem={lastUpdatedItem}/> 
          <SubmitButton frc={frc} is_revenue={0} is_cost={1} onSubmit={handleSubmit}/>
    </>
  );
}
