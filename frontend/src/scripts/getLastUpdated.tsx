import React from "react";
import { lastUpdated } from "../api/logs.api";

type LastUpdatedProps = {
  frc: string;
  is_revenue: number;
  setLastUpdatedItem: React.Dispatch<
    React.SetStateAction<
      {
        user: string;
        last_updated: string;
      }[]
    >
  >;
};

export async function getLastUpdated({ frc, is_revenue, setLastUpdatedItem }: LastUpdatedProps) {
  try {
    const response = await lastUpdated(frc, is_revenue);
    setLastUpdatedItem({"user": response.user, "last_updated": response.last_updated})
  } catch (error) {
    console.error("Failed to upload last_updated:", error);
  }
};

