import React from "react";

import Navigation from "./Navigation";

export default function Header({ active = "Главная"}) {
  return (
    <header className="fixed top-0 left-0 w-full bg-[#595961] text-[#ba9477] z-40">
      <div className="flex items-center justify-between px-10 py-3">
        <div className="flex items-center">
          <img src="/logo.png" alt="logo" className="h-8 w-auto mr-3" />
          <span className="sr-only">Логотип</span>
        </div>
          <Navigation/>
      </div>
    </header>
  );
}
