import { useEffect, useState } from "react";
import { useNumberFormatter } from "../hooks/useNumberFormatter";

type Props = {
  value: number;
  onChange: (value: string) => void;
  onBlur?: (value: number) => void;
};

export default function NumberInput({
  value,
  onChange,
  onBlur,
}: Props) {
  const { format, parse, checkNumbers } = useNumberFormatter();
  const [displayValue, setDisplayValue] = useState(format(value));
  const [isFocused, setIsFocused] = useState(false);
  

  useEffect(() => {
    if (value === "0" && isFocused){
      setDisplayValue("");
    } else {
      setDisplayValue(format(parse(value)));
    }
  }, [value]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const numericValue = parse(checkNumbers(e.target.value));
    onChange(numericValue);
  };


  const handleFocus = () => {
    setIsFocused(true);
    if (parse(displayValue) === 0) {
      setDisplayValue("");
    }
  };


  const handleBlur = (
    e: React.FucusEvent<HTMLInputElement>
  ) => {

    setIsFocused(false);

    const inputValue = e.target.value.trim();
    if (inputValue === "") {
      setDisplayValue("0");
      onChange(0);
      return;
    }
    const numericValue = parse(checkNumbers(inputValue));
    setDisplayValue(format(numericValue));
    onChange(numericValue);
    onBlur?.(numericValue);

  };

  return (
    <input
      value={displayValue}
      onFocus={handleFocus}
      onChange={handleChange} 
      onBlur={handleBlur}
      className="w-full text-center rounded-md px-1 py-0.5 text-gray-700 bg-[#deebfc] focus:bg-[#f7f5f0]"
    />
  );
}
