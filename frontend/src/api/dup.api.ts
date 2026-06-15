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
