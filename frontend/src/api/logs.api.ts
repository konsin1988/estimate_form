import api from "./axios";
import type { LastUpdatedItem } from '../types/LogTypes';


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


export const lastUpdated = async (frc: string,  is_revenue: string ): Promise<LastUpdatedItem | null> => {
  const res = await api.get<LastUpdatedItem>('/logs/lastupdated/', {
    params: { 
      frc: frc,
      is_revenue: is_revenue } 
  })
  if (res.status === 200 && res.data) {
    return res.data
    }
  return null;
};
