import { useState, useEffect } from "react"

import { useAuth } from "../auth/AuthProvider";
import FrcChoice from "../components/FrcChoice";
import SubmitButton from "../components/SubmitButton";
import CostForecastTable from "../components/CostForecastTable";

export default function RevenueForecastPage() {
  const {login, costsFrc} = useAuth();

  const [ frc, setFrc ] = useState<string>(costsFrc[0]);

  return (
    <>
          <FrcChoice
            frc={frc}
	        	setFrc={setFrc}
	        	listFrc={costsFrc} 
          /> 
          <div className={`fixed top-19/100 h-76/100 w-full overflow-auto left-3`}>
            < CostForecastTable frc={frc} />
          </div>
          <SubmitButton frc={frc} is_revenue={0} is_cost={1} />
    </>
  );
}
