import { useEffect, useState } from "react";
interface Props {
  label?: string;
  updateTimes: (times: { start: string; end: string }) => void;
  className?: string;
}

const TimeRangeInput = (props: Props) => {
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  new Date()

  useEffect(() => {
    const startTime = fromTime ? `${fromTime}` : "";
    const endTime = toTime ? `${toTime}` : "";
    props.updateTimes({ start: startTime, end: endTime });
  }, [fromTime, toTime]);

  return (
    <div className={"w-full max-w-xs mx-auto my-3 " + props.className ?? ""}>
      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
        {props.label}
      </label>
      <div className="flex items-center ">
        <input
          type="time"
          id={`${props.label}-from`}
          name={`${props.label}-from`}
          value={fromTime}
          onChange={(e) => setFromTime(e.target.value)}
          className="border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 border-gray-300  text-gray-900 dark:border-gray-600 dark:bg-online-darkBlue dark:text-gray-200"
        />
        <span className="mx-4 text-gray-500 dark:text-gray-300">til</span>
        <input
          type="time"
          id={`${props.label}-to`}
          name={`${props.label}-to`}
          value={toTime}
          onChange={(e) => setToTime(e.target.value)}
          className="border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 border-gray-300 text-gray-900 dark:border-gray-600 dark:bg-online-darkBlue dark:text-gray-200"
        />
      </div>
    </div>
  );
};

export default TimeRangeInput;
