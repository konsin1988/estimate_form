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


export const saveRevenueValue = async (
  id: number,
  field: string,
  value: number
) => {
  try {
    const res = await api.put(
      "/revenue/save/",
      {
        id,
        field,
        value,
      }
    );
    return res.data;
  } catch (error) {
    console.error("Failed to save revenue", error);
    throw error;
  }
};
