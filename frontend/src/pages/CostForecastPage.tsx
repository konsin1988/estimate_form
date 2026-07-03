import { useState, useEffect } from "react"

import { useAuth } from "../auth/AuthProvider";
import FrcChoice from "../components/FrcChoice";
import SubmitButton from "../components/SubmitButton";
import CostForecastTable from "../components/CostForecastTable";
import { useOutletContext } from 'react-router-dom';

export default function CostForecastPage() {
  const {login, costsFrc} = useAuth();
  const [ frc, setFrc ] = useState<string>(costsFrc[0]);
  const [ hidePreviousMonths ] = useOutletContext();

  return (
    <>
          <FrcChoice
            frc={frc}
	        	setFrc={setFrc}
	        	listFrc={costsFrc} 
          /> 
          <div className={`
                    fixed top-[19%] h-[67%] 
                    overflow-x-auto left-3 right-0 flex 
                    flex-col items-start custom-scrollbar
                    `}>
            < CostForecastTable frc={frc} hidePreviousMonths={hidePreviousMonths} />
          </div>
          <SubmitButton frc={frc} is_revenue={0} is_cost={1} />
    </>
  );
}
