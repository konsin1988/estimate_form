import { useEffect, useState } from "react";
import { useNumberFormatter } from "../hooks/useNumberFormatter";

type Props = {
  value: number;
  onChange: (value: string) => void;
  onBlur: (value: number) => void;
};

export default function NumberInput({
  value,
  onChange,
  onBlur,
}: Props) {
  const { format, parse, checkNumbers } = useNumberFormatter();
  const [displayValue, setDisplayValue] =
    useState(format(value));
  

  useEffect(() => {
    setDisplayValue(format(parse(value)));
  }, [value]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const numericValue = parse(checkNumbers(
      e.target.value
    ));

    setDisplayValue(
      format(numericValue)
    );

    onChange(numericValue);
  };

  const handleBlur = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const numericValue = parse(checkNumbers(e.target.value));
    onBlur(numericValue);
  };

  return (
    <input
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      className="w-full text-center px-1 py-0.5 text-gray-700 bg-blue-100 focus:bg-[#fff9eb]"
    />
  );
}
