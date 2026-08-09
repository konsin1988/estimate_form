import { useState, useEffect } from "react"

import { useAuth } from "../auth/AuthProvider";
import FrcChoice from "../components/FrcChoice";
import SubmitButton from "../components/SubmitButton";
import  LastUpdatedComponent  from "../components/LastUpdatedComponent";
import RevenueForecastTable from "../components/RevenueForecastTable";
import { useOutletContext } from 'react-router-dom';
import { saveRevenueValues } from "../api/revenue.api";
import { logUserVisit, logUserUpdateValues, lastUpdated } from "../api/logs.api";

import type { LastUpdatedItem } from "../types/LogTypes";


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

  const [ lastUpdatedItem, setLastUpdatedItem ] = useState<LastUpdatedItem>({"user": "", "last_updated": ""});
  const [ isSaving, setIsSaving ] = useState(false);

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
          is_revenue: true 
        });
        console.log("Visit log processed:", response.message);
      } catch (error) {
        console.error("Failed to log user visit:", error);
      }
    };

    triggerVisitLog();
  }, [frc]);

  useEffect(() => {
    const getLastUpdated = async () => {
      try {
        const response = await lastUpdated(frc, 1);
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
          <LastUpdatedComponent lastUpdatedItem={lastUpdatedItem}/> 
          <SubmitButton frc={frc} is_revenue={1} is_cost={0} onSubmit={handleSubmit} />
    </>
  );
}
