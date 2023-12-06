import { useState, useEffect } from "react";
import axios from "axios";
import {
  formatTime,
  unhideCurrentActiveParentChilds,
  convertTimeStringToSeconds,
  removeObjectsFromArraySlowly,
  convertInputToHHMMSS,
} from "../util/commonFunctions";
import Dropdown from "./dropdown";
import io from "socket.io-client";
import Tag from "./Tagdropdown";
import { format } from "date-fns";

export default function Timetracker({
  setTasksData,
  trackTime,
  setTrackTime,
  startTimer,
  setStartTimer,
  projects,
  showAddBtn,
  setAddBtn,
  setCancelBtn,
  setCounter,
  counter,
  userId,
  tags,
}) {
  const currentDate = new Date();
  const currentTime = format(currentDate, "HH:mm");

  const [taskName, setTaskName] = useState("");
  const [timeTrack, setTimeTrack] = useState("00:00:00");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [start_time, setStartTime] = useState(currentTime);
  const [stop_time, setStopTime] = useState(currentTime);
  const [showCancelPopUp, setCancelPopUp] = useState(false);
  const [warning, setWarning] = useState([]);
  const [timeInput, setTimeInput] = useState("00:00:00");
  const [billable, setBillable] = useState(false);

  // useEffect(() => {
  //   document.addEventListener("keydown", setOnClickEnter, true);
  // }, []);

  const handleInputChange = (event) => {
    const newTimeInput = event.target.value;
    setTimeInput(newTimeInput);
    const formattedTime = convertInputToHHMMSS(newTimeInput);
    if (formattedTime !== "Invalid Input") {
      setTimeTrack(formattedTime);
    }
  };

  const setManualInput = () => {
    const formattedTime = convertInputToHHMMSS(timeInput);
    if (formattedTime === "Invalid Input") {
      setTimeInput(timeInput);
    } else {
      setTimeInput(formattedTime);
      const seconds = convertTimeStringToSeconds(timeTrack);
      const milliseconds = seconds * 1000;
      const currentStopTime = Date.now() - milliseconds;
      const startManualTime = format(currentStopTime, "HH:mm");
      setStartTime(startManualTime);
    }
  };

  const setOnClickEnter = async (e) => {
    try {
      const result = await axios.post("/api/calculateStartEndTime", {
        startTime: start_time,
        stopTime: stop_time,
      });
      if (result) {
        console.log(result);
        setTimeInput(result.data.duration);
        setTimeTrack(result.data.duration);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const changeAddBtn = () => {
    const newShowAddbtn = true;
    setAddBtn(newShowAddbtn);
    localStorage.setItem("showAddBtn", newShowAddbtn.toString());
  };

  const cancelPopUp = () => {
    setCancelPopUp(!showCancelPopUp);
  };

  const workState = () => {
    setBillable(!billable);
    setTrackTime({ ...trackTime, billable: !billable });
  };

  const stopTimer = async () => {
    localStorage.clear();
    setStartTimer(!startTimer);
    setCancelPopUp(!showCancelPopUp);
    setCancelBtn(false);
    setCounter(null);
    try {
      const res = await axios.post("/api/startcounter?counter=stop", {
        user: userId,
      });
      if (res.ok) {
        console.log(res);
      }
    } catch (err) {
      console.log(err);
    }
    setTrackTime({
      taskName: null,
      project: "",
      startTime: null,
      stopTime: null,
      seconds: 0,
    });
  };

  const toTimeStampMilliseconds = (strDate) => {
    const timestampMilliseconds = Date.parse(strDate);
    return timestampMilliseconds;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    localStorage.clear();
    if (showAddBtn) {
      var seconds = convertTimeStringToSeconds(timeTrack);
      if (start_time || stop_time) {
        // Split the start_time and stop_time strings into hours and minutes
        const [startHours, startMinutes] = start_time.split(":").map(Number);
        const [stopHours, stopMinutes] = stop_time.split(":").map(Number);

        // Create Date objects for the current date with custom times
        const startDate = new Date();
        startDate.setHours(startHours);
        startDate.setMinutes(startMinutes);

        const stopDate = new Date();
        stopDate.setHours(stopHours);
        stopDate.setMinutes(stopMinutes);

        // Get timestamps for start_time and stop_time
        const startTimestamp = startDate.getTime();
        const stopTimestamp = stopDate.getTime();

        console.log("Start Time:", startTimestamp);
        console.log("Stop Time:", stopTimestamp);

        var newEntry = {
          ...trackTime,
          taskName,
          startTime: startTimestamp,
          stopTime: stopTimestamp,
          createdOn: toTimeStampMilliseconds(selectedDate),
          seconds: seconds,
        };
      } else {
        var milliseconds = seconds * 1000;
        const startTime = Date.now() - milliseconds;
        var stopTime = Date.now();
        var newEntry = {
          ...trackTime,
          taskName,
          startTime,
          stopTime,
          createdOn: toTimeStampMilliseconds(selectedDate),
          seconds: seconds,
        };
      }

      if (newEntry.taskName && newEntry.project && newEntry.seconds) {
        setTimeInput("00:00:00");
        setTrackTime(newEntry);
        setBillable(false);

        const result = await axios
          .post("api/tracktime", {
            data: newEntry,
          })
          .then((response) => {
            setTasksData(response.data.tasks);
            setTrackTime({
              startTime: null,
              stopTime: null,
              taskName: null,
              project: "",
              seconds: 0,
            });
            unhideCurrentActiveParentChilds();
          })
          .catch((error) => {
            console.error(error);
          });
        setTimeTrack("00:00:00");
        setTaskName("");
        setTrackTime({
          taskName: null,
          project: "",
          startTime: null,
          stopTime: null,
          seconds: 0,
        });
      } else {
        var warnings = [...warning, { id: Math.random() }];
        setWarning(warnings); // Set warning to true immediately
      }
    } else {
      var created_on = Date.now();
      const milliTrackseconds = trackTime.seconds * 1000;
      const startTime = Date.now() - milliTrackseconds;
      const stopTime = Date.now();
      var newEntry = {
        ...trackTime,
        stopTime,
        startTime,
        createdOn: created_on,
      };
      console.log("New Entry: ", newEntry);

      if (newEntry.taskName && newEntry.project) {
        setTrackTime(newEntry);
        setBillable(false);
        setCancelPopUp(false);
        setCounter(null);
        const newStartTimer = !startTimer;
        setStartTimer(newStartTimer);
        // Update local storage
        localStorage.setItem("startTimer", newStartTimer.toString());

        try {
          const res = await axios.post("/api/startcounter?counter=stop", {
            user: userId,
          });
          if (res.ok) {
            console.log(res);
          }
        } catch (err) {
          console.log(err);
        }
        const result = await axios
          .post("api/tracktime", {
            data: newEntry,
          })
          .then((response) => {
            setTasksData(response.data.tasks);
            setTrackTime({
              startTime: null,
              stopTime: null,
              taskName: null,
              project: "",
              seconds: 0,
            });
            setCounter(false);
            unhideCurrentActiveParentChilds();
          })
          .catch((error) => {
            console.error(error);
          });

        setTrackTime({
          taskName: null,
          project: "",
          startTime: null,
          stopTime: null,
          seconds: 0,
        });
      } else {
        var warnings = [...warning, { id: Math.random() }];
        setWarning(warnings); // Set warning to true immediately
      }
    }
  }

  function handleChange(e) {
    const field = e.target.getAttribute("name");
    const value = e.target.value;
    setTrackTime((prevValue) => {
      return {
        ...prevValue,
        [field]: value,
      };
    });
  }

  async function handleStart() {
    const newStartTimer = !startTimer;
    setStartTimer(newStartTimer);
    // Update local storage
    localStorage.setItem("startTimer", newStartTimer.toString());
    localStorage.setItem("trackTime", JSON.stringify(trackTime));
    try {
      const res = await axios.post("/api/startcounter?counter=start", {
        user: userId,
      });
      if (res.ok) {
        console.log(res);
      }
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    const storedValue = localStorage.getItem("startTimer");
    if (storedValue !== null) {
      setStartTimer(storedValue === "true");
    } else {
      // If not stored in localStorage, set it to false initially
      localStorage.setItem("startTimer", "false");
    }
  }, [setStartTimer]);

  useEffect(() => {
    const storedValue = localStorage.getItem("showAddBtn");
    if (storedValue !== null) {
      setAddBtn(storedValue === "true");
    } else {
      // If not stored in localStorage, set it to false initially
      localStorage.setItem("showAddBtn", "false");
    }
  }, [setAddBtn]);

  useEffect(() => {
    const socket = io("https://backend-timer-for-clockify-clone.onrender.com", {
      // const socket = io("http://localhost:8080", {
      transports: ["websocket"],
    });

    socket.on("counter-update", (counter) => {
      if (userId in counter) {
        const userCounter = counter[userId];
        setCounter(userCounter);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, setCounter]);

  const removalDelay = 2000; // Delay in milliseconds between each removal

  removeObjectsFromArraySlowly(warning, removalDelay)
    .then((resultArray) => {})
    .catch((error) => {
      console.error("Error:", error);
    });

  const restrictedWarnings = warning.slice(0, 7);

  return (
    <>
      <div className="relative sticky top-0 lg:pt-14 pt-4 bg-gray-50 z-10">
        <div className="border shadow-lg rounded  w-full h-14 bg-white items-center mb-14">
          <div className="bg-white justify-between items-center">
            <div className="flex w-full">
              <div className="px-[10px] py-[3px] my-[2px] w-full">
                {showAddBtn ? (
                  <input
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    type="text"
                    id="taskName"
                    name="taskName"
                    placeholder="What are you working on?"
                    className="transition duration-0 hover:duration-700 hover:border-gray-700 border-transparent border text-gray-900 text-md block w-full h-[38px] mt-[3px] p-2.5"
                    required
                  />
                ) : (
                  <input
                    value={
                      trackTime && trackTime.taskName ? trackTime.taskName : ""
                    }
                    onChange={handleChange}
                    type="text"
                    id="taskName"
                    name="taskName"
                    placeholder="What are you working on?"
                    className="transition duration-0 hover:duration-700 hover:border-gray-700 border-transparent border text-gray-900 text-md block w-full h-[38px] mt-[3px] p-2.5"
                    required
                  />
                )}
              </div>
              <div className="px-4 py-1.5 h-10 my-2">
                <div className="flex pointer">
                  <Dropdown
                    projects={projects}
                    handleChange={handleChange}
                    trackTime={trackTime}
                    setTrackTime={setTrackTime}
                  />
                </div>
              </div>
            </div>
            <div className="block ">
              <div className="flex items-center border-y shadow-lg">
                <div className="flex w-full">
                  <div className="border-r-2 border-dotted w-full my-1.5 px-4 py-3 cursor-pointer">
                    <Tag
                      projects={projects}
                      handleChange={handleChange}
                      trackTime={trackTime}
                      setTrackTime={setTrackTime}
                      tags={tags}
                    />
                  </div>
                  {/* #0000D1 */}
                  <div className="border-r-2 border-dotted w-full px-3 py-1 my-1.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      onClick={workState}
                      className="icon icon-tabler icon-tabler-currency-pound mx-auto"
                      width="30"
                      height="40"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke={`${billable ? "#0000D1" : "#2c3e50"}`}
                      fill="none"
                      opacity={`${billable ? "0.5" : "0.3"}`}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M17 18.5a6 6 0 0 1 -5 0a6 6 0 0 0 -5 .5a3 3 0 0 0 2 -2.5v-7.5a4 4 0 0 1 7.45 -2m-2.55 6h-7" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center">
                  {showAddBtn && (
                    <div className="flex w-full border-r-2 border-dotted lg:py-1 py-3 lg:px-4 px-3">
                      <div className="start-end-time  lg:block hidden">
                        <div className="flex w-[100%]  py-[3px]">
                          <input
                            type="text"
                            id="start-time"
                            name="start-time"
                            defaultValue={start_time}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="px-3 transition duration-0 hover:duration-700 hover:border-gray-700 border-transparent border text-gray-900 text-md block w-[65px]"
                            placeholder="00:00"
                            onBlur={setOnClickEnter}
                            required
                          />
                          <span className="py-1 px-1"> - </span>
                          <input
                            type="text"
                            id="stop-time"
                            name="stop-time"
                            defaultValue={stop_time}
                            onChange={(e) => setStopTime(e.target.value)}
                            className="px-3 transition duration-0 hover:duration-700 hover:border-gray-700 border-transparent border text-gray-900 text-sm block w-[65px]"
                            placeholder="00:00"
                            onBlur={setOnClickEnter}
                            required
                          />
                        </div>
                      </div>
                      <input
                        type="date"
                        id="date-input"
                        name="task-date"
                        // ref={dateInputRef}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="pointer border-none text-gray-900 text-md md:w-full w-6 md:px-2 px-1"
                        required
                      />
                    </div>
                  )}

                  {showAddBtn ? (
                    <div className="font-medium py-2 px-2">
                      <input
                        type="text"
                        id="time_track"
                        name="time_track"
                        value={timeInput}
                        onChange={handleInputChange}
                        onBlur={setManualInput}
                        className="text-center transition duration-0 hover:duration-700 hover:border-gray-700 border-transparent border text-gray-900 lg:text-lg text-sm block w-[100px] lg:h-[35px]"
                        required
                      />
                    </div>
                  ) : (
                    <div
                      id="counter"
                      className="my-3 px-6 md:text-lg text-sm font-medium"
                    >
                      {counter ? formatTime(counter) : "00:00:00"}
                    </div>
                  )}
                  <div>
                    {showAddBtn ? (
                      <button
                        onClick={handleSubmit}
                        className="bg-sky-500 cursor-pointer hover:bg-sky-600 text-white text-center font-medium w-[50px] py-1 text-sm "
                      >
                        Add
                      </button>
                    ) : (
                      <div
                        onClick={() => setCancelBtn(true)}
                        className="mx-auto"
                      >
                        {!startTimer ? (
                          <button
                            onClick={handleStart}
                            className="bg-sky-500 cursor-pointer hover:bg-sky-600   w-[50px]  py-1  text-sm  text-white text-center font-medium "
                          >
                            Start
                          </button>
                        ) : (
                          <div onClick={() => setCancelBtn(false)}>
                            <button
                              type="button"
                              onClick={handleSubmit}
                              className="bg-red-500 hover:bg-red-700 text-sm text-white text-center w-[50px] py-1 "
                            >
                              Stop
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {startTimer ? (
                    <div onClick={cancelPopUp} className="pointer px-3">
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
                  ) : (
                    <div className="text-blue-600 px-3 items-center">
                      <svg
                        onClick={() => {
                          const newShowAddbtn = false;
                          setAddBtn(newShowAddbtn);
                          localStorage.setItem(
                            "showAddBtn",
                            newShowAddbtn.toString()
                          );
                        }}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="pointer"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span> </span>
                      <svg
                        onClick={changeAddBtn}
                        xmlns="http://www.w3.org/2000/svg"
                        height="1em"
                        viewBox="0 0 512 512"
                        className="pointer h-18 w-5"
                      >
                        <path
                          d="M40 48C26.7 48 16 58.7 16 72v48c0 13.3 10.7 24 24 24H88c13.3 0 24-10.7 24-24V72c0-13.3-10.7-24-24-24H40zM192 64c-17.7 0-32 14.3-32 32s14.3 32 32 
                        32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32
                         32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zM16 232v48c0 13.3 10.7 24 24 24H88c13.3 0 24-10.7 24-24V232c0-13.3-10.7-24-24-24H40c-13.3 0-24 10.7-24 24zM40 368c-13.3 0-24 10.7-24
                          24v48c0 13.3 10.7 24 24 24H88c13.3 0 24-10.7 24-24V392c0-13.3-10.7-24-24-24H40z"
                        />
                      </svg>
                    </div>
                  )}
                  {showCancelPopUp && (
                    <div className="absolute right-0 items-center px-6 mt-32 shadow-lg bg-white text-gray-600 text-md font-normal">
                      <div className="flex">
                        <div className="py-5 px-3">Are you sure?</div>
                        <div
                          onClick={stopTimer}
                          className="bg-sky-500 items-center cursor-pointer hover:bg-sky-600 text-white font-medium my-[10px] py-[8px] px-[16px] w-[90px] h-[40px]"
                        >
                          <p>Discard</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {restrictedWarnings.map((warning, index) => {
          const verticalPosition = 50 * index; // * Adjust 50 to control vertical spacing
          return (
            <div
              key={warning.id}
              style={{ top: `${verticalPosition}px` }}
              className="absolute mt-[180px] right-0 text-white font-medium py-2 py-2 my-2 rounded bg-red-500 items-center px-2 transition-opacity duration-500 ease-in-out opacity-100"
            >
              <div className="flex">
                <div className="flex">
                  <svg
                    fill="#FFFFFF"
                    version="1.1"
                    id="Capa_1"
                    xmlns="http://www.w3.org/2000/svg"
                    xlink="http://www.w3.org/1999/xlink"
                    width="25px"
                    height="25px"
                    stroke="#FFFFFF"
                    viewBox="0 0 367.011 367.01"
                    space="preserve"
                  >
                    <g>
                      <g>
                        <path
                          d="M365.221,329.641L190.943,27.788c-1.542-2.674-4.395-4.318-7.479-4.318c-3.084,0-5.938,1.645-7.48,4.318L1.157,330.584
			                                 c-1.543,2.674-1.543,5.965,0,8.639c1.542,2.674,4.395,4.318,7.48,4.318h349.65c0.028,0,0.057,0,0.086,0
			                                c4.77,0,8.638-3.863,8.638-8.639C367.011,332.92,366.342,331.1,365.221,329.641z M23.599,326.266L183.464,49.381l159.864,276.885
			                                H23.599z"
                        />
                        <path
                          d="M174.826,136.801v123.893c0,4.773,3.867,8.638,8.638,8.638c4.77,0,8.637-3.863,8.637-8.638V136.801
			                                c0-4.766-3.867-8.637-8.637-8.637C178.693,128.165,174.826,132.036,174.826,136.801z"
                        />
                        <path
                          d="M183.464,279.393c-5.922,0-10.725,4.8-10.725,10.722s4.803,10.729,10.725,10.729c5.921,0,10.725-4.809,10.725-10.729
			                                C194.189,284.193,189.386,279.393,183.464,279.393z"
                        />
                      </g>
                    </g>
                  </svg>
                  <p className="pl-2 pr-24">Can&apos;t save, field missing!</p>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  onClick={() => {
                    const newArray = restrictedWarnings.filter(
                      (item) => item.id !== warning.id
                    );
                    setWarning(newArray);
                  }}
                  className="icon icon-tabler icon-tabler-x cursor-pointer"
                  width="22"
                  height="26"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="#FFFFFF"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
