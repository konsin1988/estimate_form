import React from "react";
import { useState, useEffect } from "react"
import Header from "./components/Header";
import Footer from "./components/Footer";
import ForecastTable from "./components/ForecastTable";
import NotTable from "./components/NotTable";
import api from "./api";
import { encryptParam } from "./scripts/encryptParam";

function App() {
    const [loading, setLoading] = useState(true)
    const [frc, setFrc] = useState("")
    const [user, setUser] = useState("")
    const [isValid, setIsValid] = useState(false)
    const [listFrc, setListFrc] = useState([])
    const [isAdmin, setIsAdmin] = useState(false)

    /* Loading frc by user */
    const fetchFrcByUser = () => {
	const url = window.location.pathname;
	const segments = url.split("/").filter(Boolean);
    	const user = segments[segments.length - 1];
    	try {
    	    api.get(`/frc/by_user?user=${encodeURIComponent(user)}`).then(res_frc => {
    		if (res_frc.status === 200) {
		    if (res_frc.data.frc === 'admin') {
			setIsAdmin(true)
			setFrc('Стратегия и инвестиции')
		    } else {
			setFrc(res_frc.data.frc);
		    }
		    setUser(res_frc.data.login);
		    api.get(`/frc/list/`).then(res_list => {
			if (res_list.status === 200) {
			    setListFrc(res_list.data)
			    setLoading(false)
			}
		    });
    	    }});
    	} catch (error) {
    	    console.log("Frc by user is not loaded");
    	}
    };

    useEffect(() => {
	// const enc_string = encryptParam('i.grudcov');
	const enc_string = encryptParam('i.chaykovskiy');
	//const enc_string = encryptParam('n.vetrova');
	// const enc_string = encryptParam('d.konshin');
	console.log(enc_string);
	fetchFrcByUser();
   }, [])  

    useEffect(() => {
	if(listFrc.includes(frc)) { 
	    setIsValid(true)
	} 
    }, [listFrc])

    return (
	<div className="min-h-screen bg-gray-300 select-none">
	    <Header />
	    <main className="pt-16 pb-16">
		{loading ? <NotTable type="loading"/> : 
		    (isValid ? <ForecastTable user={user} 
						init_frc={frc} 
						list_frc={listFrc}
						is_admin={isAdmin}/> : <NotTable type="not_valid"/>)}
	    </main>
	    <Footer />
	</div>
    );
}

export default App;
