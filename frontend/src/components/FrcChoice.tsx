import React, { useEffect, useState, useMemo } from "react";


export default function FrcChoise({ frc, setFrc, listFrc }) {

  return (
    <div className="w-full fixed bg-transparent top-0 h-16/100 z-30">
		  <div className="w-full px-4 fixed top-11/100">
		    <label className="mb-2 text-sm text-gray-700 font-medium">ЦФО: </label>
	      <select
	        value={frc}
	        onChange={(e) => setFrc(e.target.value)}
	        className="p-2 border text-sm rounded-lg text-gray-700"
        >
	        {listFrc.map((item, index) => 
	        <option key={index}>{item}</option> 
	        )}
	      </select>
	    </div>
    </div>
  );
}
