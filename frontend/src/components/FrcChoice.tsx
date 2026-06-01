import React, { useEffect, useState, useMemo } from "react";


export default function FrcChoise({ frc, setFrc, listFrc }) {

  return (
		<div className="px-4 fixed top-12/100">
		  <label className="block mb-2 text-lg text-gray-700 font-medium">ЦФО:</label>
	    <select
	      value={frc}
	      onChange={(e) => setFrc(e.target.value)}
	      className="p-2 border rounded-lg text-gray-700"
      >
	      {listFrc.map((item, index) => 
	      <option key={index}>{item}</option> 
	      )}
	    </select>
	  </div>
  );
}
