import React from "react";
import { useState } from "react"

import FrcChoice from "../components/FrcChoice";
import RevenueForecastTable from "../components/RevenueForecastTable";
import { useAuth } from "../auth/AuthProvider"
import SubmitButton from "../components/SubmitButton";

export default function RevenueForecastPage() {
  const { user, login, revenueFrc } = useAuth();
  const [ frc, setFrc ] = useState<string | null>(revenueFrc[0])

  return (
    <main className="pt-55 min-w-screen"> 
        <div className="overflow-x-auto flex flex-col justify-center align-center h-full">
          <FrcChoice
            frc={frc}
	        	setFrc={setFrc}
	        	listFrc={revenueFrc} 
          /> 
          <RevenueForecastTable  
            frc={frc}
            target_user={user}
	        	target_login={login}
          /> 
          <SubmitButton frc={frc} is_revenue={1}/>
        </div>
    </main>
  );
}
