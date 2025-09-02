import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateField, saveEst } from "../store/estSlice";
import debounce from "lodash.debounce";
import api from "../api";
import dayjs from "dayjs";
import axios from "axios";
import { useNumberFormatter } from "../hooks/useNumberFormatter";

import { encryptParam } from "../scripts/encryptParam";
const MONTHS_RU = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
const ROW_NAMES = ["Выручка", "Контракт", "ВСК", "Прогноз"]; 

export default function ForecastTable({ user, init_frc, list_frc, is_admin }) {
    const dispatch = useDispatch();
    const { data, loading, error } = useSelector((state) => state.profile);

    const listFrc = list_frc;
    const isAdmin = is_admin;
    const [frc, setFrc] = useState(init_frc);
    const [planByMonth, setPlanByMonth] = useState({}); 
    const [estByMonth, setEstByMonth] = useState({}); 
    const [factByMonth, setFactByMonth] = useState({});
    const currentYear = dayjs().year();
    const currentMonth = dayjs().month() + 1; // 1..12
    const currentDay = dayjs().date();
    // const currentDay = 13;
    
    const debouncedSave = useMemo(() => 
	debounce((newData) => {
	    dispatch(saveEst(newData));
	}, 800),
	[dispatch]
    );

    const { format, parse, checkNumbers } = useNumberFormatter();

    /* Loading if frc changes */
    useEffect(() => {
	if (!frc) return;

	// fetch plan
	const fetchPlan = async () => {
	    api.get(`/plan/?frc=${encodeURIComponent(frc)}`).then(res => {
		// map by month (date_dt)
		const map = {};
		res.data.forEach(item => {
		    if (item.date_dt) {
			const m = new Date(item.date_dt).getMonth() + 1;
			map[m] = item.amount; 
		    }
		});
	    setPlanByMonth(map);
	    }).catch(e => {
	console.error(e);
	});}
	fetchPlan()

      // fetch estimates
	api.get(`/est/?frc=${encodeURIComponent(frc)}`).then(res=>{
	    const e = {};
	    Object.keys(res.data || {}).forEach(k=>{
		const m = parseInt(k,10);
		e[m] = {
		    id: res.data[k].id,
		    date_dt: res.data[k].date_dt,
		    estimate_date: res.data[k].estimate_date || null,
		    sum_amount: res.data[k].sum_amount || 0,
		    est_amount: res.data[k].est_amount || "",
		    hcl_amount: res.data[k].hcl_amount || "",
		    contr_amount: res.data[k].contr_amount || ""
		}
	    });
	    setEstByMonth(e)
	}).catch(e=>console.error(e));

	// fetch fact
	api.get(`/fact/?frc=${encodeURIComponent(frc)}`).then(res=>{
	    const e = {};
	    Object.keys(res.data || {}).forEach(k=>{
		const m = parseInt(k,10);
		e[m] = {
		    month: res.data[k].month,
		    month_amount: res.data[k].month_amount
		}
	    });
	    setFactByMonth(e)
	}).catch(e=>console.error(e));
	
    }, [frc]);

    const handleChange = (est_data, month, field, rawValue) => {
	const value = parse(checkNumbers(rawValue))
	var sum_amount = value ? value : 0
	const diffList = ['hcl_amount', 'est_amount', 'contr_amount']
	const index = diffList.indexOf(field)
	if (index !== -1) {
	    diffList.splice(index, 1)
	}
	diffList.map((value) => {
	    if (est_data[value]) {
		sum_amount += est_data[value]
	    }
	})

	setEstByMonth(prev => ({
	...prev,
	[month]: {
	    ...(prev[month] || {}),
	    [field]: value, 'sum_amount': sum_amount
	}
	}));
	const newData = { ...data, 'field': field, 
			    'field_value': value, 
			    'id': est_data['id']};
	debouncedSave(newData);
    };

    async function handleSave() {
	const items = [];
	for (let m = currentMonth; m <= 12; m++) {
	    const row = estByMonth[m];
	    if (!row) continue;
	    const date_dt = `${currentYear}-${String(m).padStart(2,"0")}-01`;
	    items.push({
		month: m,
		date_dt,
		estimate_date: row.estimate_date || dayjs().format("YYYY-MM-DD"),
		est_amount: row.est_amount || null,
		hcl_amount: row.hcl_amount || null,
		contr_amount: row.contr_amount || null,
	    });
	}
	try {
	    const resp = await api.post("/est/save/", {
		frc,
		year: currentYear,
		items
	    });
	alert(`Сохранено: created ${resp.data.created}, updated ${resp.data.updated}`);
	// refresh data
	const resp2 = await api.get(`/est/?frc=${encodeURIComponent(frc)}`);
	setEstByMonth(resp2.data || {});
	} catch (err) {
	    console.error(err);
	    alert("Ошибка при сохранении");
	}
    }

    const onKeyPressHandler = (e) => {
	return e.charCode >= 48 && e.charCode <= 57
    };

    // Helper to render cell background alternating gray
    const cellBg = (monthIndex, subcol) => {
	// subcol 0 = Бюджет, 1 = Прогноз
	const base = (subcol % 2 === 0) ? "bg-gray-100" : "bg-gray-200";
	return base
    };

    return (
    <div className="pt-50 pb-20 text-gray-700"> 
      <div className="px-3">
	{isAdmin && <>
	    <div className="p-4">
	    <label className="block mb-2 text-lg font-medium">FRC:</label>
	    <select
		value={frc}
		onChange={(e) => setFrc(e.target.value)}
		className="p-2 border rounded-lg">
		{listFrc.map((item, index) => 
		    <option key={index}>{item}</option> 
		)}
	    </select>
	    </div>
	    </>} 
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed border-collapse text-sm">
            <thead>
              <tr>
                <th rowSpan={2} className="w-40 border px-1 py-1 bg-gray-50"></th>
                {MONTHS_RU.map((m,i)=>(
		    <th key={m} colSpan={2} className={`text-center border px-1 py-1 ${i%2===0? 'bg-gray-800 text-white' : 'bg-gray-700 text-white'}`}>
                    {m}
		    </th>
                ))}
              </tr>
              <tr>
                {/* второй уровень: Бюджет, Прогноз */}
                {Array.from({length:12}).map((_,i)=> { 
                    const monthIndex = i+1;
		    return monthIndex >= currentMonth ? (
                  <>
                    <th key={`b_${i}`} className={`w-32 border border-l-2 px-6 py-1 border-b-2 
			text-center text-gray-700 ${cellBg(i,0)}`}>Бюджет</th>
                    <th key={`p_${i}`} className={`w-40 border px-5 py-2 border-b-2 
			text-center text-gray-700 ${cellBg(i,1)}`}>Прогноз</th>
                  </>) : (
                  <>
                    <th key={`b_${i}`} className={`w-32 border border-l-2 px-6 py-1 border-b-2 
			text-center text-gray-700 ${cellBg(i,0)}`}>Бюджет</th>
                    <th key={`p_${i}`} className={`w-40 border px-7 py-2 border-b-2 
			text-center text-gray-700 ${cellBg(i,1)}`}>Факт</th>
                  </>) 
		})}
              </tr>
            </thead>

            <tbody>
              {ROW_NAMES.map((rname, rowIdx) => (
                <tr key={rowIdx} className={rowIdx>=2? "h-10" : ""}>
                  <td className="border px-1 py-1 font-bold text-center">{rname}</td>
                  {Array.from({length:12}).map((_,mi)=>{
                    const monthIndex = mi+1;
                    if (rowIdx === 0) {
                      const val = planByMonth[monthIndex] ?? "";
                      return (
                        <React.Fragment key={`mi_${rowIdx}_${mi}`}>
                          <td className={`border px-1 py-1 
			      text-center font-semibold border-l-2 text-gray-800 ${cellBg(mi,0)}`}>{format(val)}</td>
                          <td className={`border px-1 py-1 text-black ${cellBg(mi,1)}`}>
                              <div className={`text-gray-800 
				font-semibold text-center`}>{monthIndex < currentMonth ? (
				    format(factByMonth[monthIndex]?.month_amount ?? '' )) : (
				    format(estByMonth[monthIndex]?.sum_amount) 
				    )}
			  </div>
                          </td>
                        </React.Fragment>
                      );
                    }

                    // For rows Контракт (rowIdx==3), ВСК (4), Прогноз (5) -> fill only from estByMonth (contr_amount/hcl_amount/est_amount)
                    const fieldMap = {1: "contr_amount", 2: "hcl_amount", 3: "est_amount"};
                    const field = fieldMap[rowIdx];
                    return (
                      <React.Fragment key={`${rowIdx}_${mi}`}>
                        <td className={`border px-1 py-1 border-l-2 ${cellBg(mi,0)} `}></td>
                        <td className={`border px-1 py-1 ${cellBg(mi,1)}`}>
                          { monthIndex < currentMonth ? (
                            <div className="text-gray-800 text-right"></div>
                          ) : currentDay > 20 ? (
                            <div
                              className={`w-full 
				text-center px-1 py-0.5 bg-transparent text-gray-700 `}
                            >{format(estByMonth[monthIndex]?.[field]) ?? ""}</div>
			    ) : (
                            <input
			      id={`${mi}_${field}`}
                              type="text"
                              className={`w-full 
				text-center px-1 py-0.5 bg-transparent text-gray-700 !bg-blue-100`}
                              value={format(estByMonth[monthIndex]?.[field]) ?? ""}
                              onChange={(e)=>handleChange(estByMonth[monthIndex], monthIndex, field, e.target.value)}
                            />
                          )}
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
