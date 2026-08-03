import React, { useEffect, useState, useMemo } from "react";

import { useAuth } from "../auth/AuthProvider"
import api from "../api/axios";
import Modal from "./Modal";

export default function SubmitButton({ frc, is_revenue, is_cost, onSubmit }){
  const [isOpen, setOpen] = useState(false);
  const { user, login } = useAuth();

  const buttonSubmitOnClick = async (event) => {
		event.preventDefault();

    await onSubmit();
		setOpen(true);
  }
  return (
    <>
     <div className="fixed w-full bottom-0 h-12/100 bg-transparent z-40"> 
      <div className="text-sm fixed bottom-6/100 left-78/100">
			  <button type="button" className={`
        min-w-[100px]
        h-7
        rounded-lg
        flex
        items-center
        justify-center
        text-gray-600
        transition-colors
        bg-gray-200
        hover:bg-gray-300
        active:bg-white
        active:text-gray-700 
        py-1 
        px-5 
        rounded-lg
        `} 
        onClick={buttonSubmitOnClick}
        >
			     Сохранить данные 
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
