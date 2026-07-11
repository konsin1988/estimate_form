import api from "./axios";

export const getRevenueData = async (frc: string) => {
		return api.get(`/revenue/?frc=${encodeURIComponent(frc)}`)
    .then(res => {
		    if (res.status === 200) {
						if (res.data.length > 0) {
              return res.data
            }
        }
    })
}


export const saveRevenueValues = async (
  changes:{
    id:number;
    field:string;
    value:number;
  }[]
)=>{
  const res = await api.put(
    "/revenue/save/",
    { changes }
  );

  return res.data;
};
