import { useCallback } from "react";

export function useNumberFormatter() {
    const format = useCallback((value) => {
	if (value == null || value === "") return "";
	return new Intl.NumberFormat("de-DE").format(Math.round(value))
    }, []);

    const parse = useCallback((value) => {
	if (value == null || value === "") return null;
	const numeric = value.toString().replace(/\./g, "");
	return Number(numeric)
    }, []);

    const checkNumbers = useCallback((raw) => {
	return raw.toString().replace(/\D/g, "");
    }, []);

    return { format, parse, checkNumbers };
}
