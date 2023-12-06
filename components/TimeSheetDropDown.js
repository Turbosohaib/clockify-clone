import { useState, useEffect } from "react";
import axios from "axios";

function Dropdown({
  projects,
  timeSheetData,
  weekArray,
  projectArray,
  setProjectArray,
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.addEventListener("keydown", hideOnEscape, true);
    document.addEventListener("click", hideOnClickOutSide, true);
  });

  const hideOnEscape = (e) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const hideOnClickOutSide = (e) => {
    if (!e.target.closest(".dropdown")) {
      setIsOpen(false);
    }
  };

  const toggleDropDown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelectOption = (value) => {
    setProjectArray([
      ...projectArray,
      {
        project: value,
        projectId: Math.floor(1000 + Math.random() * 9000),
        tasks: {
          day1: { taskProject: value, date: weekArray[0] },
          day2: { taskProject: value, date: weekArray[1] },
          day3: { taskProject: value, date: weekArray[2] },
          day4: { taskProject: value, date: weekArray[3] },
          day5: { taskProject: value, date: weekArray[4] },
          day6: { taskProject: value, date: weekArray[5] },
          day7: { taskProject: value, date: weekArray[6] },
        },
      },
    ]);
    setIsOpen(false);
  };

  return (
    <div className="relative cursor-pointer hover:underline">
      <div
        onClick={toggleDropDown}
        className="text-blue-600 text-md rounded-md"
      >
        {timeSheetData.project || "Select project"}
      </div>
      {isOpen && (
        <div className="dropdown absolute mt-2 py-2 lg:w-[300px] w-[200px] bg-white rounded-md shadow-lg z-10">
          <input
            className="py-2 px-2 mx-2 my-2 lg:w-[285px] w-[185px] border bg-gray-60"
            placeholder="Find Project"
          ></input>
          <ul>
            {projects.map((project) => (
              <li
                key={project._id.$oid}
                data-value={project._id.$oid}
                onClick={() => handleSelectOption(project.project)}
                className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
              >
                {project.project}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Dropdown;
