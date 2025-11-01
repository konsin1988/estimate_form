import React from "react";

export default function Header({ active = "Главная"}) {
  return (
    <header className="fixed top-0 left-0 w-full bg-gray-900 text-gray-100 z-40">
      <div className="flex items-center justify-between px-10 py-4">
        <div className="flex items-center">
          <img src="/logo.png" alt="logo" className="h-8 w-auto mr-3" />
          <span className="sr-only">Логотип</span>
        </div>
        <nav>
          <a
            href='https://skid.rtt.digital/'
            className={`px-3 py-2 rounded ${active === "Главная" ? "bg-gray-800 border border-white" : "text-gray-300"} `}
          >
				   Выйти 
          </a>
        </nav>
      </div>
    </header>
  );
}
