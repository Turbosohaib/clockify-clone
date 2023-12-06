import { useState } from "react";
import axios from "axios";
import { formatTimestamp } from "../util/commonFunctions";

export default function ProjectTable({ projects }) {
  const [openPopUp, setPopUp] = useState(false);
  const [showRates, setShowRates] = useState({});
  const [projectRates, setProjectRates] = useState({});
  const [projectData, setProjectData] = useState(projects);

  const showHourlyRates = (projectid) => {
    setShowRates((prevState) => ({
      ...prevState,
      [projectid]: !prevState[projectid],
    }));
  };

  const newRatesPopUp = (projectid) => {
    setProjectRates((prevState) => ({
      ...prevState,
      [projectid]: !prevState[projectid],
    }));
  };

  const popUp = () => {
    setPopUp(!openPopUp);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    var randomSixDigitNumber = Math.floor(100000 + Math.random() * 900000);
    let projectName = {
      projectid: randomSixDigitNumber,
      project: e.target.projectname.value,
      newRates: [
        {
          currency: "£",
          newHourlyRate: e.target.hourlyrate.value,
          date_from: e.target.date_from.value,
          date_to: null,
        },
      ],
    };
    try {
      const result = await axios.post("/api/addProject", { projectName });
      setProjectData(result.data.projects);
    } catch (error) {
      console.log(error);
    }
    console.log(projectName);
    setPopUp(false);
  }

  const handleNewRatesSubmit = async (event, projectid, project) => {
    event.preventDefault();
    const newHourlyRate = parseFloat(event.target.hourlyrate.value);

    try {
      // Fetch the existing project document
      const response = await axios.post("/api/getProject", {
        projectid: projectid,
      });
      const existingProject = response.data.project;

      // Create a new rate object
      const newRate = {
        newHourlyRate,
        date_from: event.target.date_from.value,
        currency: "£",
      };

      // Push the new rate object into the newRates array
      const updatedNewRates = [...existingProject.newRates, newRate];

      // Create the updated project object with the modified newRates
      const updatedProject = {
        ...existingProject,
        newRates: updatedNewRates,
        newRate: newHourlyRate,
        date_from: event.target.date_from.value,
        currency: "£",
      };

      // Send the updated project to the server htmlFor updating in the database
      const result = await axios.post("/api/updateRates", updatedProject);
      console.log("response projects: ", result.data.projects);
      setProjectData(result.data.projects);
      setProjectRates("");
    } catch (error) {
      console.log(error);
    }
  };

  const getRateColor = (rate, projectId) => {
    var currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    var dateFrom = new Date(rate.date_from.$date);
    dateFrom.setHours(0, 0, 0, 0);
    var dateTo = rate.date_to ? new Date(rate.date_to.$date) : null;
    if (dateTo) {
      dateTo.setHours(23, 59, 59, 999);
    }
    if (dateFrom <= currentDate && (!dateTo || dateTo >= currentDate)) {
      return showRates[projectId] ? "text-blue-600" : "text-black";
    } else if (dateFrom < currentDate && dateTo < currentDate) {
      var classes = ["text-black"];
      if (!showRates[projectId]) {
        classes.push("hidden");
      }
      return classes.join(" ");
    } else if (
      dateFrom > currentDate &&
      (dateTo == null || dateTo > currentDate)
    ) {
      var classes = ["text-emerald-400"];
      if (!showRates[projectId]) {
        classes.push("hidden");
      }
      return classes.join(" ");
    }
  };

  return (
    <div className="w-full">
      {openPopUp && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
          {" "}
          <form
            onSubmit={handleSubmit}
            className="transition ease-in-out px-[40px] py-[40px] shadow drop-shadow-lg rounded-md bg-white absolute top-1/2 m-auto inset-x-0 -translate-y-1/2 w-2/5"
          >
            <div
              onClick={() => setPopUp(false)}
              className="absolute top-0 right-0 mx-3 my-2 pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon icon-tabler icon-tabler-x"
                width="25"
                height="44"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="#2c3e50"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <div className="grid gap-6 mb-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="first_name"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Project name
                </label>
                <input
                  type="text"
                  id="project-name"
                  name="projectname"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Project"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="hourlyrate"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Hourly rate
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="hourlyrate"
                  name="houtlyrate"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="£0.00"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="date_from"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Date from
                </label>
                <input
                  type="date"
                  id="date_from"
                  name="date_from"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="£0.00"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Submit
            </button>
          </form>
        </div>
      )}
      <div className="flex flex-col">
        <div className="overflow-x-auto shadow-md sm:rounded-lg">
          <div className="inline-block w-full align-middle">
            <div className="overflow-hidden ">
              <table className="max-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-700">
                <thead className="bg-gray-200 h-[70px] dark:bg-gray-700">
                  <tr>
                    <th
                      scope="col"
                      className="py-3 px-6 text-xs w-[8%] font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400"
                    >
                      id
                    </th>
                    <th
                      scope="col"
                      className="py-3 px-6 text-xs w-[30%] font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400"
                    >
                      Project Name
                    </th>
                    <th
                      scope="col"
                      className="py-3 px-6 text-xs w-[15%] font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400"
                    >
                      Hourly Rate
                    </th>
                    <th
                      scope="col"
                      className="py-3 px-6 text-xs w-[20%] font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400"
                    >
                      Notes
                    </th>
                    <th scope="col" className="p-4 w-[10%]">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {projectData.map((project, index) => {
                    const projectid = project.projectid;

                    const handleSubmit = (event) => {
                      handleNewRatesSubmit(event, project.projectid, project);
                    };

                    console.log(projectRates);
                    return (
                      <tr
                        key={index}
                        className="hover:bg-gray-100 h-[60px] dark:hover:bg-gray-700"
                      >
                        <td className="content-start p-4 w-4 align-top">
                          <div className="text-blue-600 ml-[2px] mr-[2px] pointer">
                            {project.projectid}
                          </div>
                        </td>
                        <td className="flex py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
                          <div
                            onClick={() => showHourlyRates(projectid)}
                            className="pointer mt-[3px] mr-[5px]"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="1em"
                              viewBox="0 0 512 512"
                            >
                              <path d="M40 48C26.7 48 16 58.7 16 72v48c0 13.3 10.7 24 24 24H88c13.3 0 24-10.7 24-24V72c0-13.3-10.7-24-24-24H40zM192 64c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zM16 232v48c0 13.3 10.7 24 24 24H88c13.3 0 24-10.7 24-24V232c0-13.3-10.7-24-24-24H40c-13.3 0-24 10.7-24 24zM40 368c-13.3 0-24 10.7-24 24v48c0 13.3 10.7 24 24 24H88c13.3 0 24-10.7 24-24V392c0-13.3-10.7-24-24-24H40z" />
                            </svg>
                          </div>
                          <div>{project.project}</div>
                        </td>
                        <td className="py-4 px-6 text-sm font-medium text-gray-500 whitespace-nowrap dark:text-white">
                          <ul>
                            {project.newRates.map((rate, index) => {
                              return (
                                <li
                                  key={index}
                                  className={`pb-2 ${getRateColor(
                                    rate,
                                    project.projectid
                                  )}`}
                                >
                                  {rate.currency}
                                  {rate.newHourlyRate}
                                </li>
                              );
                            })}
                          </ul>
                        </td>
                        <td className="content-start py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
                          <ul>
                            {project.newRates.map((rate, index) => {
                              return (
                                <li
                                  key={index}
                                  className={`pb-2 ${getRateColor(
                                    rate,
                                    project.projectid
                                  )}`}
                                >
                                  {showRates[project.projectid]
                                    ? `Effective from ${new Date(
                                        rate.date_from.$date
                                      ).toLocaleDateString("en-us", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      })}${
                                        rate.date_to
                                          ? " to " +
                                            new Date(
                                              rate.date_to.$date
                                            ).toLocaleDateString("en-us", {
                                              weekday: "long",
                                              year: "numeric",
                                              month: "short",
                                              day: "numeric",
                                            })
                                          : ""
                                      }`
                                    : "Active"}
                                </li>
                              );
                            })}
                          </ul>
                        </td>
                        <td className="py-4 px-6 text-sm font-medium text-right whitespace-nowrap">
                          <a
                            onClick={() => newRatesPopUp(projectid)}
                            className="pointer text-blue-600 dark:text-blue-500 hover:underline"
                          >
                            Edit
                          </a>
                          {projectRates[projectid] && (
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
                              <form
                                onSubmit={handleSubmit}
                                className="transition ease-in-out px-[40px] py-[40px] shadow drop-shadow-lg rounded-md bg-white absolute top-1/2 m-auto inset-x-0 -translate-y-1/2 w-2/5"
                              >
                                <div
                                  onClick={() => setProjectRates(false)}
                                  className="absolute top-0 right-0 mx-3 my-2 pointer"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="icon icon-tabler icon-tabler-x"
                                    width="25"
                                    height="44"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="#2c3e50"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path
                                      stroke="none"
                                      d="M0 0h24v24H0z"
                                      fill="none"
                                    />
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                  </svg>
                                </div>
                                <div className="grid gap-6 mb-6 md:grid-cols-2">
                                  <div>
                                    <label
                                      htmlFor="hourlyrate"
                                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                    >
                                      New hourly rate
                                    </label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      id="hourlyrate"
                                      name="houtlyrate"
                                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                      placeholder="£0.00"
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label
                                      htmlFor="date_from"
                                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                    >
                                      Date from
                                    </label>
                                    <input
                                      type="date"
                                      id="date_from"
                                      name="date_from"
                                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                      placeholder="£0.00"
                                      required
                                    />
                                  </div>
                                </div>
                                <button
                                  type="submit"
                                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                >
                                  Submit
                                </button>
                              </form>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-8 mt-4 float-right">
        <div className="h-14 w-24">
          <button
            type="submit"
            onClick={popUp}
            className="bg-blue-500 hover:bg-blue-700 text-white rounded font-bold mt-1 mr-1.5 py-2.5 px-6 border"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
