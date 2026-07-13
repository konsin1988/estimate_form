import api from "./axios";


export interface VisitedLogPayload {
  user: string;
  login: string;
  frc: string;
  is_revenue: boolean;
}

export const logUserVisit = async (payload: VisitedLogPayload) => {
  const res = await api.post(
    "/logs/visited/", 
    payload
  );
  
  return res.data;
};



export interface SaveValueItem {
  id: number;
  subgroupName?: string; // Optional field, handles both your simple and composite ID cases
  value: number;
}

export interface UpdatedLogPayload {
  user: string;
  login: string;
  frc: string;
  is_revenue: boolean;
  save_values: SaveValueItem[]; 
}

export const logUserUpdateValues = async (payload: UpdatedLogPayload) => {
  const res = await api.post(
    "/logs/updated/", 
    payload
  );
  return res.data;
};
