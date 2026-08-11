import { useState, useEffect } from "react"
import { useOutletContext } from 'react-router-dom';

import { useAuth } from "../auth/AuthProvider";
import SubmitButton from "../components/SubmitButton";
import DupFileUpload from "../components/FileUpload";
import LastUpdatedComponent  from "../components/LastUpdatedComponent";
import DupForecastTable from "../components/DupForecastTable";
import { saveCostsValues } from "../api/costs.api";
import { logUserVisit, logUserUpdateValues, lastUpdated } from "../api/logs.api";

import type { LastUpdatedItem } from "../types/LogTypes";
import { getLastUpdated } from "../scripts/getLastUpdated";


export default function DupCostPage() {
  const frc = "Управление персоналом";
  const {user, login, costsFrc} = useAuth();
  const [ hidePreviousMonths ] = useOutletContext();
  const [pendingChanges, setPendingChanges] = useState<
    {
      id: number;
      value: number;
    }[]
  >([]);

  const [ lastUpdatedItem, setLastUpdatedItem ] = useState<LastUpdatedItem>({"user": "", "last_updated": ""});

  const [ refreshTrigger, setRefreshTrigger ] = useState(0);
  const handleRefresh = () => setRefreshTrigger(prev => prev + 1);

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
      getLastUpdated({frc: frc, is_revenue: 0, setLastUpdatedItem: setLastUpdatedItem});
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
    getLastUpdated({frc: frc, is_revenue: 0, setLastUpdatedItem: setLastUpdatedItem});
  }, [frc]);


  return (
    <>
      <DupFileUpload onUploadSuccess={handleRefresh}/>
      <div className={`
                    fixed top-[19%] h-[69%] 
                    overflow-x-auto left-3 right-0 flex 
                    flex-col items-start custom-scrollbar
        `}>
        < DupForecastTable 
          frc={frc} 
          hidePreviousMonths={hidePreviousMonths} 
          setPendingChanges={setPendingChanges}
          setLastUpdatedItem={ setLastUpdatedItem }
          refreshTrigger={refreshTrigger}
        />
      </div>
      <LastUpdatedComponent lastUpdatedItem={lastUpdatedItem}/> 
      <SubmitButton frc={frc} is_revenue={0} is_cost={0} onSubmit={handleSubmit}/>
    </>
  );
}

