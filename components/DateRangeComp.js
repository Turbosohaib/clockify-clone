import { useEffect, useRef, useState } from "react";
import { DateRange } from "react-date-range";
import format from "date-fns/format";
import { addDays } from "date-fns";

import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file

export default function DateRangeComp() {
  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
      key: "selection",
    },
  ]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.addEventListener("keydown", hideOnEscape, true);
    document.addEventListener("click", hideOnClickOutSide, true);
  }, []);

  const hideOnEscape = (e) => {
    console.log(e.key);
    if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const hideOnClickOutSide = (e) => {
    if (!e.target.closest(".calendarElement")) {
      setOpen(false);
    }
  };

  return (
    <>
      <div className="relative calendarWrap">
        <input
          value={`${format(range[0].startDate, "MM/dd/yyyy")} to ${format(
            range[0].endDate,
            "MM/dd/yyyy"
          )}`}
          readOnly
          className="inputBox w-48"
          onClick={() => setOpen((open) => !open)}
        />

        {open && (
          <div className="absolute right-0 z-10">
            <DateRange
              onChange={(item) => setRange([item.selection])}
              editableDateInputs={true}
              moveRangeOnFirstSelection={false}
              ranges={range}
              months={1}
              direction="horizontal"
              className="calendarElement"
            />
          </div>
        )}
      </div>
    </>
  );
}
