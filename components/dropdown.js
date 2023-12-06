import script from "next/script";
import { useState } from "react";

function Dropdown({ projects, handleChange, trackTime, setTrackTime }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropDown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelectOption = (value) => {
    console.log(value);
    setTrackTime({ ...trackTime, project: value });
    setIsOpen(false);
    console.log(trackTime);
  };

  return (
    <div className="relative">
      <div onClick={toggleDropDown} className="text-blue-600 rounded-md">
        {trackTime.project || "Project"}
      </div>
      {isOpen && (
        <div className="absolute right-0.5 mt-2 py-2 lg:w-[300px] w-[200px] bg-white rounded-md shadow-lg z-10">
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
