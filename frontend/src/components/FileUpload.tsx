import { useRef, useState } from "react";

import { uploadCostExcel } from "../api/dup.api";
import Modal from "./Modal";

export default function DupFileUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [ message, setMessage ] = useState("");

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

		e.preventDefault();
    const selected = e.target.files?.[0];
  
    if (!selected) return;

    setFile(selected);
  
    try {
      setLoading(true);
  
      await uploadCostExcel(selected);
  
      setMessage(`Файл ${selected.name} успешно загружен`);
    } catch (err) {
      console.error(err);
      setMessage("Ошибка загрузки");
    } finally {
      setLoading(false);
		  setOpen(true);
  
      e.target.value = "";
    }
  };

  return (
    <>
		<div className="text-[13px] w-full flex px-12 fixed top-12/100">
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={ handleFileChange }
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`border 
                    border-gray-200 
                    text-gray-600 
                    hover:bg-gray-300 
                    bg-gray-200 
                    px-5 py-0.25
                    rounded-lg
        `}>
        Загрузить файл
      </button>
    </div>
	  <Modal 
	  		isOpen={isOpen}
	  		onClose={() => setOpen(false)}
	  		message={ message }
	  />
    </>
  );
}
