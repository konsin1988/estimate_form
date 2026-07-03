import { useState, useEffect } from "react"
import { useOutletContext } from 'react-router-dom';

import { useAuth } from "../auth/AuthProvider";
import SubmitButton from "../components/SubmitButton";
import DupForecastTable from "../components/DupForecastTable";


export default function DupCostPage() {
  const frc = "Управление персоналом";
  const [ hidePreviousMonths ] = useOutletContext();

  return (
    <>
      <div className={`
                    fixed top-[19%] h-[67%] 
                    overflow-x-auto left-3 right-0 flex 
                    flex-col items-start custom-scrollbar
        `}>
        < DupForecastTable frc={frc} hidePreviousMonths={hidePreviousMonths} />
      </div>
      <SubmitButton frc={frc} is_revenue={0} is_cost={0} />
    </>
  );
}

