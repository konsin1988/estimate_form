import { useState, useEffect } from "react"

import { useAuth } from "../auth/AuthProvider";
import FrcChoice from "../components/FrcChoice";
import SubmitButton from "../components/SubmitButton";
import CostForecastTable from "../components/CostForecastTable";

export default function RevenueForecastPage() {
  const {login, costsFrc} = useAuth();

  const [ frc, setFrc ] = useState<string>(costsFrc[0]);

    return (
      <main className="pt-55 min-w-screen"> 
        <div className="overflow-x-auto flex flex-col justify-center align-center h-full">
	        <div className="w-full h-5/12" >
            <FrcChoice
              frc={frc}
	          	setFrc={setFrc}
	          	listFrc={costsFrc} 
            /> 
          </div>
            < CostForecastTable frc={frc} />
          <div className="fixed top-75/100 left-70/100">
            <SubmitButton frc={frc} is_revenue={0} />
          </div>
        </div>
      </main>
    );
}
