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
      <div className={`fixed top-19/100 h-76/100 w-full overflow-auto left-3`}>
        < DupForecastTable frc={frc} hidePreviousMonths={hidePreviousMonths} />
      </div>
      <SubmitButton frc={frc} is_revenue={0} is_cost={0} />
    </>
  );
}

