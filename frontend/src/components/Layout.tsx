import Header from "./Header";
import Footer from "./Footer";
import Navigation from "./Navigation";
import { Outlet } from "react-router-dom";
import { useState } from "react";
import MonthToggle from "./MonthToggle";

export default function Layout() {
  
  const [hidePreviousMonths, setHidePreviousMonths] = useState(false);
  return (
    <div className="select-none min-h-screen flex flex-col">
      <Header />

      <Navigation />

      <MonthToggle value={hidePreviousMonths} onChange={setHidePreviousMonths}/>
      <main className="bg-gray-200 border border border-gray-300 flex-1 overflow-x-scroll w-full scrollbar-custom [&::-webkit-scrollbar]:h-2 
            [&::-webkit-scrollbar]:h-2
            [&::-webkit-scrollbar-track]:bg-gray-100
            [&::-webkit-scrollbar-thumb]:bg-gray-400
            [&::-webkit-scrollbar-thumb]:rounded-full
            ">
          <Outlet context={[hidePreviousMonths]} />
      </main>

      <Footer />
    </div>
  );
}
