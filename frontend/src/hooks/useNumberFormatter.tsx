import { useCallback } from "react";

export function useNumberFormatter() {
    const format = useCallback((value) => {
	if (value == null || value === "") return "";
	return new Intl.NumberFormat("fr-FR").format(Math.round(value))
    }, []);

    const parse = useCallback((value) => {
	if (value == null || value === "") return 0; 
	const numeric = value.toString().replace(/\s/g, "");
	return Number(numeric)
    }, []);

    const checkNumbers = useCallback((raw) => {
	return raw.toString().replace(/\D/g, "");
    }, []);

    return { format, parse, checkNumbers };
}
