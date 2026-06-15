import React, { useEffect, useState, useMemo } from "react";

import { useAuth } from "../auth/AuthProvider"
import api from "../api/axios";
import Modal from "./Modal";

export default function SubmitButton({ frc, is_revenue, is_cost }){
  const [isOpen, setOpen] = useState(false);
  const { user, login } = useAuth();

  const buttonSubmitOnClick = async (event) => {
		event.preventDefault();

		const response = await api.post('/est/log/', {
		    user: user,
		    login: login,
		    frc: frc,
        is_revenue: is_revenue,
        is_cost: is_cost,
    });
		setOpen(true);
  }
  return (
    <>
     <div className="fixed w-full bottom-0 h-14/100 bg-gray-200 z-40"> 
      <div className="fixed bottom-7/100 left-78/100">
			  <button type="button" className={`
        min-w-[140px]
        h-9
        rounded-lg
        flex
        items-center
        justify-center
        text-[#ebe3dd]
        transition-colors
        bg-[#8a8a92] 
        hover:bg-[#a6a8ad]
        active:bg-white
        active:text-gray-700 
        py-1 
        px-6 
        border 
        rounded-md 
        border-gray-800
        `} onClick={buttonSubmitOnClick}>

			      Подтвердить ввод
			  </button>
      </div>
      </div>

			<Modal 
					isOpen={isOpen}
					onClose={() => setOpen(false)}
					message="Данные успешно сохранены"
			/>
    </>
  );
}
