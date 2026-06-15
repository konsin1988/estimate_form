import { useState, useEffect } from "react"

import { useAuth } from "../auth/AuthProvider";
import SubmitButton from "../components/SubmitButton";
import DupForecastTable from "../components/DupForecastTable";


export default function DupCostPage() {
  const frc = "Управление персоналом";
  return (
    <>
      <div className={`fixed top-19/100 h-76/100 w-full overflow-auto left-3`}>
        < DupForecastTable frc={frc} />
      </div>
      <SubmitButton frc={frc} is_revenue={0} is_cost={0} />
    </>
  );
}

