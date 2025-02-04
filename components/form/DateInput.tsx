import { useEffect, useState } from "react";
interface Props {
  label?: string;
  updateDate: (date: string) => void;
}

const DateRangeInput = (props: Props) => {
  const [date, setDate] = useState("");

  useEffect(() => {
    const dateString = date ? `${date}T00:00` : "";
    props.updateDate(dateString);
  }, [date]);

  return (
    <div className="flex items-center ">
      <input
        type="date"
        id={`${props.label}`}
        name={`${props.label}`}
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 border-gray-300  text-gray-900 dark:border-gray-600 dark:bg-online-darkBlue dark:text-gray-200"
      />
    </div>
  );
};

export default DateRangeInput;
