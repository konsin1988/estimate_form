import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function AccessDeniedPage() {
  return (
    <>
      <Header />
      <main className="bg-[#1f1f24] flex flex-col items-center justify-center w-screen h-screen text-white">
        <div className="text-center bg-[#2b2b30] border border-transparent px-20 py-7 rounded-xl">
          <h1 className="font-semibold">Нет доступа</h1>
          <p className="py-2">Попробуйте повторно зайти через портал <a className="text-blue-400 hover:text-blue-300 active:text-white transition-all active:scale-104" href="https://skid.rtt.digital">https://skid.rtt.digital</a></p>
          <p className="text-sm">...или обратиться к администраторам: </p>
          <a className="text-blue-200 text-md hover:text-purple-100 active:text-white transition-all active:scale-104" href="https://bitrix.rt-techpriemka.ru/company/personal/user/1049/">Чайковский Илья Сергеевич</a> <br/>
          <a className="text-blue-200 text-md hover:text-purple-100 active:text-white transition-all active:scale-104" href="https://bitrix.rt-techpriemka.ru/company/personal/user/1055/">Коньшин Дмитрий Сергеевич</a>
        </div>
      </main>
      <Footer />
    </>
  );
}
