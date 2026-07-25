import React, { useState } from 'react';

type Props = {
  value: boolean;
  onChange: () => void;
};

export default function MonthToggle({value, onChange}: Props) {
  return (
    <div className="fixed flex item-center justify-center top-20 right-20 z-50 text-gray-700 w-30/100">
      <label htmlFor="month-toggle" className="mr-3 text-sm">
      {"Скрыть предыдущие месяцы"} 
      </label>
      <input
        id="month-toggle"
        type="checkbox"
        checked={value}
        onChange={() => onChange(prevState => !prevState)}
        className={`
            w-5 h-5 cursor-pointer checked:bg-gray-400 
            appearance-none bg-gray-300 
            flex items-center justify-center text-white font-bold
            checked:after:content-['✓'] checked:border-2 checked:border-red-500
            rounded
            `}
      />
    </div>
  );
};

