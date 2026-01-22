"use client";

import { format } from "date-fns";
import { Input } from "@/components/ui/input";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  minDate?: string;
  className?: string;
}

const DatePicker = ({
  value,
  onChange,
  minDate,
  className,
}: DatePickerProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const displayValue = value
    ? format(new Date(value), "EEE, MMM dd, yyyy")
    : "";

  return (
    <div className="relative">
      <Input
        type="date"
        value={value}
        onChange={handleChange}
        min={minDate}
        className={`pr-10 ${className}`}
      />
    </div>
  );
};

export default DatePicker;
