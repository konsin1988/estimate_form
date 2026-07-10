import api from "./axios";

export const fetchFrcByUser = async (hash: string) => {
		return api.get(`/frc/by_user?user=${encodeURIComponent(hash)}`)
    .then(res_frc => {
		    if (res_frc.status === 200) {
						if (res_frc.data.length > 0) {
              console.log(res_frc.data)
            }
        }
    })
}
