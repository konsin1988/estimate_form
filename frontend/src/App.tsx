import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import Layout from "./components/Layout";

import HashEntryPage from "./pages/HashEntryPage";
import RevenueForecastPage from "./pages/RevenueForecastPage";
import CostForecastPage from "./pages/CostForecastPage";
import DupCostPage from "./pages/DupCostPage";
import AuthProvider from "./auth/AuthProvider";
import ProtectedRoute from "./auth/ProtectedRoute";
import AccessDeniedPage from "./pages/AccessDeniedPage";

export default function App() {
    return (
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={<Navigate to="/access-denied" replace />}
            />
            <Route
              path="*"
              element={<HashEntryPage />}
            />
            <Route
              path="/user"
              element={
                <AuthProvider>
                  <ProtectedRoute />
                </AuthProvider>
              }
            >
              <Route 
                element={<Layout />}
              >
                <Route index 
                  element={<Navigate to="revenues" replace />}
                />

                <Route 
                  path="revenues"
                  element={<RevenueForecastPage/>} 
                />
                <Route
                  path="costs"
                  element={<CostForecastPage/>}
                />
                <Route
                  path="dup"
                  element={<DupCostPage/>}
                />
              </Route>
            </Route>
            <Route 
              path="access-denied" 
              element={<AccessDeniedPage/>}
            />
          </Routes>
        </BrowserRouter>
    );
}


//import React from "react";
//import { useState, useEffect } from "react"
//import { useParams } from "react-router-dom";
//
//import Header from "./components/Header";
//import Footer from "./components/Footer";
//import ForecastTable from "./components/ForecastTable";
//import NotTable from "./components/NotTable";
//import api from "./services/api";
//import { encryptParam } from "./scripts/encryptParam";
//
//function App() {
//    const [loading, setLoading] = useState(true)
//    const [frc, setFrc] = useState("")
//    const [isValid, setIsValid] = useState(false)
//    const [listFrc, setListFrc] = useState([])
//    const [isAdmin, setIsAdmin] = useState(false)
//    const [user, setUser] = useState('')
//    const [login, setLogin] = useState('')
//
//    /* Loading frc by user */
//    const fetchFrcByUser = () => {
//				const url = window.location.pathname;
//				const segments = url.split("/").filter(Boolean);
//
//				const user = segments[segments.length - 1];
//        //const { user } = useParams();
//				api.get(`/frc/by_user?user=${encodeURIComponent(user)}`).then(res_frc => {
//    		    if (res_frc.status === 200) {
//								if (res_frc.data.length > 0) {
//								    setUser(res_frc.data[0].user)
//								    setLogin(res_frc.data[0].login)
//		                api.get(`/frc/list/`).then(res_list => {
//			                  if (res_list.status === 200) {
//							            	if (res_frc.data[0].frc === 'admin') {
//							            			setIsAdmin(true)
//																setFrc('Стратегия и инвестиции')
//																setListFrc(res_list.data)
//												    } else {
//												        const frc_res_list = res_frc.data
//																						.map(item => item.frc)
//																				    .filter(f => res_list.data.includes(f));
//																if (frc_res_list.length > 0) {
//																				setListFrc(frc_res_list)
//																				setFrc(frc_res_list[0])
//																}
//			                      }}
//												}) 
//		           }
//    	    }
//				setLoading(false)
//				});
//    };
//
//    useEffect(() => {
//        fetchFrcByUser();
//   }, [])  
//
//    useEffect(() => {
//	if(listFrc.includes(frc)) { 
//	    setIsValid(true)
//	} 
//    }, [listFrc])
//
//    return (
//	<div className="select-none">
//	    <Header />
//	    <main className="bg-gray-300 h-screen min-w-screen"> 
//		{loading ? <NotTable type="loading"/> : 
//		    (isValid ? <ForecastTable  
//				    target_user={user}
//				    target_login={login}
//						init_frc={frc} 
//						list_frc={listFrc} /> : <NotTable type="not_valid"/>)}
//	    </main>
//	    <Footer />
//	</div>
//    );
//}
//
//export default App;
