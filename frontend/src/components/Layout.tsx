import Header from "./Header";
import Footer from "./Footer";
import Navigation from "./Navigation";
import { Outlet } from "react-router-dom";

export default function Layout() {
    return (
        <div className="select-none min-h-screen flex flex-col">
            <Header />

            <Navigation />

            <main className="bg-gray-200 flex-1">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}
