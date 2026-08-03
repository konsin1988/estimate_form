import api from "./axios";

export const getDupData = async () => {
		return api.get(`/costs/dup`)
    .then(res => {
		    if (res.status === 200) {
						if (res.data.length > 0) {
              return res.data
            }
        }
    })
}

export const uploadCostExcel = async (
  file: File
) => {
  const formData = new FormData();

  formData.append("file", file);

  const res = await api.post(
    "/import/dup/",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
};
