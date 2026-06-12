import { useState, useEffect } from "react"

import { useAuth } from "../auth/AuthProvider";
import FrcChoice from "../components/FrcChoice";
import SubmitButton from "../components/SubmitButton";
import CostForecastTable from "../components/CostForecastTable";

export default function RevenueForecastPage() {
  const {login, costsFrc} = useAuth();

  const [ frc, setFrc ] = useState<string>(costsFrc[0]);

        //<div className="overflow-x-auto flex flex-col justify-start align-center h-full">
    return (
      <>
            <FrcChoice
              frc={frc}
	          	setFrc={setFrc}
	          	listFrc={costsFrc} 
            /> 
            <div className={`fixed top-19/100 h-76/100 w-full overflow-auto left-2/100`}>
              < CostForecastTable frc={frc} />
            </div>
            <SubmitButton frc={frc} is_revenue={0} />
      </>
    );
}
