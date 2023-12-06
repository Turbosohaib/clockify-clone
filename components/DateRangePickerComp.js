import { useEffect, useState } from "react";
import { DateRangePicker } from "react-date-range";
import format from "date-fns/format";
import { addDays } from "date-fns";
import {
  isThisWeek,
  isWithinInterval,
  subWeeks,
  startOfWeek,
  endOfWeek,
  addWeeks,
} from "date-fns";

import axios from "axios"; // Import Axios

import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file

export default function DateRangePickerComp({ date, setDate, setTasksData }) {
  const [open, setOpen] = useState(false);

  // const handleSubmit = async () => {
  //   const startDate = date.startDate;
  //   const endDate = date.endDate;

  //   // Use Axios to make the HTTP request
  //   await axios
  //     .post("/api/getTasksInRanges", {
  //       startDate,
  //       endDate,
  //     })
  //     .then((response) => {
  //       // Handle the response data here, e.g., update the state with the fetched tasks.
  //       console.log(response.data);
  //     })
  //     .catch((error) => {
  //       console.error("Error:", error);
  //     });
  // };

  useEffect(() => {
    document.addEventListener("keydown", hideOnEscape, true);
    document.addEventListener("click", hideOnClickOutSide, true);
  });

  const hideOnEscape = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
      handleSubmit();
    }
  };

  const hideOnClickOutSide = (e) => {
    if (!e.target.closest(".calendarElement")) {
      setOpen(false);
    }
  };

  const formatLabel = (date) => {
    if (isThisWeek(date.startDate, { weekStartsOn: 0 })) {
      return "This week";
    }

    // Calculate the date range for the previous week
    const lastWeekStartDate = startOfWeek(subWeeks(new Date(), 1), {
      weekStartsOn: 0,
    });
    const lastWeekEndDate = endOfWeek(subWeeks(new Date(), 1), {
      weekStartsOn: 0,
    });

    if (
      isWithinInterval(date.startDate, {
        start: lastWeekStartDate,
        end: lastWeekEndDate,
      })
    ) {
      return "Last week";
    }

    // // If it's not this week or last week, format the date range
    // const startDate = startOfWeek(date.startDate, { weekStartsOn: 1 });
    // const endDate = endOfWeek(date.startDate, { weekStartsOn: 1 });
    return `${format(date.startDate, "MM/dd/yyyy")} - ${format(
      date.endDate,
      "MM/dd/yyyy"
    )}`;
  };

  const selectPreviousWeek = async () => {
    const newStartDate = subWeeks(date.startDate, 1); // Go back one week
    const newEndDate = endOfWeek(newStartDate); // End of the week (Sunday)

    setDate({
      startDate: startOfWeek(newStartDate), // Start of the week (Monday)
      endDate: newEndDate,
      key: "selection",
    });

    try {
      const result = await axios.post("/api/getTasksInRanges", {
        startDate: newStartDate,
        endDate: newEndDate,
      });
      console.log(result);
      setTasksData(result.data.tasks);
    } catch (err) {
      console.log("Error: ", err);
    }
  };

  const selectNextWeek = async () => {
    const newStartDate = addWeeks(date.startDate, 1); // Go forward one week
    const newEndDate = endOfWeek(newStartDate); // End of the week (Sunday)

    setDate({
      startDate: startOfWeek(newStartDate), // Start of the week (Monday)
      endDate: newEndDate,
      key: "selection",
    });

    try {
      const result = await axios.post("/api/getTasksInRanges", {
        startDate: newStartDate,
        endDate: newEndDate,
      });
      console.log(result);
      setTasksData(result.data.tasks);
    } catch (err) {
      console.log("Error: ", err);
    }
  };

  const handleSelect = async (ranges) => {
    setOpen(false);
    const { startDate, endDate } = ranges.selection;

    // Calculate the start and end of the week containing the selected startDate
    const startOfWeek = new Date(startDate);
    startOfWeek.setDate(startDate.getDate() - startDate.getDay()); // Start of the week (Sunday)
    const endOfWeek = new Date(startDate);
    endOfWeek.setDate(startDate.getDate() + (6 - startDate.getDay())); // End of the week (Monday)

    setDate({
      startDate: startOfWeek,
      endDate: endOfWeek,
      key: "selection",
    });
    try {
      const result = await axios.post("/api/getTasksInRanges", {
        startDate: startOfWeek,
        endDate: endOfWeek,
      });
      console.log(result);
      setTasksData(result.data.tasks);
    } catch (err) {
      console.log("Error: ", err);
    }
  };

  return (
    <>
      <div className="relative calendarWrap">
        <span className="flex bg-white border w-[115%] justify-between cursor-pointer">
          <div
            onClick={() => setOpen((open) => !open)}
            className="w-[100%] flex pl-3 py-1.5 items-center transition duration-300 ease-in-out hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              data-name="Layer 1"
              viewBox="0 0 64 64"
              id="calendar"
              width="25"
              height="25"
              opacity="0.5"
            >
              <rect
                width="60"
                height="52"
                x="2"
                y="9"
                fill="none"
                stroke="#010101"
                strokeMiterlimit="10"
                strokeWidth="4"
              ></rect>
              <line
                x1="2"
                x2="62"
                y1="21.06"
                y2="21.06"
                fill="none"
                stroke="#010101"
                strokeMiterlimit="10"
                strokeWidth="4"
              ></line>
              <line
                x1="24"
                x2="28"
                y1="29"
                y2="29"
                fill="none"
                stroke="#010101"
                strokeMiterlimit="10"
                strokeWidth="4"
              ></line>
              <line
                x1="36"
                x2="40"
                y1="29"
                y2="29"
                fill="none"
                stroke="#010101"
                strokeMiterlimit="10"
                strokeWidth="4"
              ></line>
              <line
                x1="48"
                x2="52"
                y1="29"
                y2="29"
                fill="none"
                stroke="#010101"
                strokeMiterlimit="10"
                strokeWidth="4"
              ></line>
              <line
                x1="48"
                x2="52"
                y1="37"
                y2="37"
                fill="none"
                stroke="#010101"
                strokeMiterlimit="10"
                strokeWidth="4"
              ></line>
              <line
                x1="36"
                x2="40"
                y1="37"
                y2="37"
                fill="none"
                stroke="#010101"
                strokeMiterlimit="10"
                strokeWidth="4"
              ></line>
              <line
                x1="24"
                x2="28"
                y1="37"
                y2="37"
                fill="none"
                stroke="#010101"
                strokeMiterlimit="10"
                strokeWidth="4"
              ></line>
              <line
                x1="12"
                x2="16"
                y1="37"
                y2="37"
                fill="none"
                stroke="#010101"
                strokeMiterlimit="10"
                strokeWidth="4"
              ></line>
              <line
                x1="12"
                x2="16"
                y1="45"
                y2="45"
                fill="none"
                stroke="#010101"
                strokeMiterlimit="10"
                strokeWidth="4"
              ></line>
              <line
                x1="24"
                x2="28"
                y1="45"
                y2="45"
                fill="none"
                stroke="#010101"
                strokeMiterlimit="10"
                strokeWidth="4"
              ></line>
              <line
                x1="36"
                x2="40"
                y1="45"
                y2="45"
                fill="none"
                stroke="#010101"
                strokeMiterlimit="10"
                strokeWidth="4"
              ></line>
              <line
                x1="48"
                x2="52"
                y1="45"
                y2="45"
                fill="none"
                stroke="#010101"
                strokeMiterlimit="10"
                strokeWidth="4"
              ></line>
              <line
                x1="12"
                x2="16"
                y1="53"
                y2="53"
                fill="none"
                stroke="#010101"
                strokeMiterlimit="10"
                strokeWidth="4"
              ></line>
              <line
                x1="24"
                x2="28"
                y1="53"
                y2="53"
                fill="none"
                stroke="#010101"
                strokeMiterlimit="10"
                strokeWidth="4"
              ></line>
              <line
                x1="36"
                x2="40"
                y1="53"
                y2="53"
                fill="none"
                stroke="#010101"
                strokeMiterlimit="10"
                strokeWidth="4"
              ></line>
              <line
                x1="14"
                x2="14"
                y1="3"
                y2="15"
                fill="none"
                stroke="#010101"
                strokeMiterlimit="10"
                strokeWidth="4"
              ></line>
              <line
                x1="50"
                x2="50"
                y1="3"
                y2="15"
                fill="none"
                stroke="#010101"
                strokeMiterlimit="10"
                strokeWidth="4"
              ></line>
            </svg>
            <div className="pl-3">{formatLabel(date)}</div>
          </div>
          <div className="flex">
            <div className="border py-1.5 px-2 items-center transition duration-300 ease-in-out hover:bg-gray-100">
              <button onClick={() => selectPreviousWeek(setDate)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  opacity="0.5"
                >
                  <path d="M15.293 3.293 6.586 12l8.707 8.707 1.414-1.414L9.414 12l7.293-7.293-1.414-1.414z" />
                </svg>
              </button>
            </div>
            <div className="border py-1.5 px-2 items-center transition duration-300 ease-in-out hover:bg-gray-100">
              <button onClick={() => selectNextWeek(setDate)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  opacity="0.5"
                  width="24"
                  height="24"
                >
                  <path d="M7.293 4.707 14.586 12l-7.293 7.293 1.414 1.414L17.414 12 8.707 3.293 7.293 4.707z" />
                </svg>
              </button>
            </div>
          </div>
        </span>

        {open && (
          <div className="absolute right-0 z-10">
            <DateRangePicker
              onChange={handleSelect}
              moveRangeOnFirstSelection={false}
              ranges={[date]}
              months={2}
              direction="horizontal"
              className="calendarElement"
              style={{
                width: "250px",
                // Adjust the width as needed
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}
