import api from "./axios";

export const getCostData = async (frc_owner: string) => {
		return api.get(`/costs/?frc_owner=${encodeURIComponent(frc_owner)}`)
    .then(res => {
		    if (res.status === 200) {
						if (res.data.length > 0) {
              return res.data
            }
        }
    })
}


//export const saveCostValue = async (
//  id: number,
//  value: number
//) => {
//  try {
//    const res = await api.put(
//      "/cost/save/",
//      {
//        id,
//        value,
//      }
//    );
//    return res.data;
//  } catch (error) {
//    console.error("Failed to save cost", error);
//    throw error;
//  }
//};


export const saveCostsValues = async (
  changes:{
    id: number;
    value: number;
  }[]
)=>{
  const res = await api.put(
    "/cost/save/",
    { changes }
  );

  return res.data;
};
