import { useEffect, useRef, useState } from "react";
import { Calendar } from "react-date-range";
import format from "date-fns/format";

import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file

export default function CalenderComp() {
  const [calendar, setCalendar] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setCalendar(format(new Date(), "MM/dd/yyyy"));
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

  const handleSelect = (date) => {
    setCalendar(format(date, "MM/dd/yyyy"));
  };

  return (
    <>
      <div className="relative calendarWrap">
        <input
          value={calendar}
          readOnly
          className="inputBox"
          onClick={() => setOpen((open) => !open)}
        />

        {open && (
          <div className="absolute right-0">
            <Calendar
              date={new Date()}
              onChange={handleSelect}
              className="calendarElement"
            />
          </div>
        )}
      </div>
    </>
  );
}
