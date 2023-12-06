import { useEffect, useState, useRef } from "react";
import Timetracker from "../../components/timetracker";
import clientPromise from "../../util/mongodb";
import {
  formatTime,
  formatSideTime,
  formatRecordTime,
  calculateTotalSeconds,
  groupTasksByWeeksAndCalculateTotals,
  convertInputToHHMMSS,
} from "../../util/commonFunctions";
import { EJSON } from "bson";
import axios from "axios";
import Head from "next/head";
import Sidebar from "../../components/sidebar";
import Script from "next/script";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import io from "socket.io-client";
import format from "date-fns/format";

export async function getServerSideProps(ctx) {
  const crypto = require("crypto");
  const userSession = await getServerSession(ctx.req, ctx.res, authOptions);

  if (!userSession) {
    // Handle the case when userSession is null
    // For example, redirect the user to the login page.
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  delete userSession.user.name;
  delete userSession.user.image;

  const client = await clientPromise;
  const db = client.db(process.env.PROJECTS_DB);
  const userTasks = EJSON.serialize(
    await db.collection("tasks").find({ userId: userSession.user.id }).toArray()
  );

  const projectDb = client.db(process.env.PROJECTS_DB);
  const userProjects = EJSON.serialize(
    await projectDb
      .collection("project")
      .find({ userId: userSession.user.id })
      .toArray()
  );

  const projectTagDb = client.db(process.env.PROJECTS_DB);
  const userProjectsTags = EJSON.serialize(
    await projectTagDb
      .collection("projectTag")
      .find({ userId: userSession.user.id })
      .toArray()
  );

  console.log(userSession);

  const serializedTasks = EJSON.serialize(calculateTotalSeconds(userTasks));

  function hashString(inputString) {
    const hash = crypto.createHash("sha256"); // You can use other algorithms like 'sha512' as well
    hash.update(inputString);
    return hash.digest("hex"); // 'hex' encoding for hexadecimal output
  }

  return {
    props: {
      tasks: serializedTasks,
      projects: userProjects,
      tags: userProjectsTags,
      userId: hashString(userSession.user.id),
    },
  };
}

export default function Home({ tasks, projects, userId, tags }) {
  const [children, setChildren] = useState(true);
  const [showAddBtn, setAddBtn] = useState(false);
  const [showCancelBtn, setCancelBtn] = useState(false);
  const [tasksData, setTasksData] = useState(tasks);
  const [openChildren, setOpenChildren] = useState({});
  const [startTimer, setStartTimer] = useState(false);
  const [counter, setCounter] = useState();
  const [deleteTaskId, setDeleteTaskId] = useState({});
  const [showSidebar, setShowSidebar] = useState(false);
  const [editTask, setEditTask] = useState({});
  const [editMsg, setEditMsg] = useState();
  const [timeTrack, setTimeTrack] = useState();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [billable, setBillable] = useState(false);
  const [trackTime, setTrackTime] = useState({
    startTime: null,
    stopTime: null,
    taskName: null,
    project: null,
    seconds: 0,
  });

  const handleEditBillable = async (taskId, taskState) => {
    if (taskState === true) {
      const editBillable = false;
      try {
        const result = await axios.post("/api/editTask", {
          id: taskId,
          fieldToUpdate: "billable",
          updateValue: editBillable,
        });
        console.log(result.data.updatedTasks);
        setTasksData(calculateTotalSeconds(result.data.updatedTasks));
        setEditMsg({ id: Math.random(), billable: editBillable }); // Set warning to true immediately
      } catch (err) {
        console.log(err);
      }
    } else {
      const editBillable = true;
      try {
        const result = await axios.post("/api/editTask", {
          id: taskId,
          fieldToUpdate: "billable",
          updateValue: editBillable,
        });
        console.log(result.data.updatedTasks);
        setTasksData(calculateTotalSeconds(result.data.updatedTasks));
        setEditMsg({ id: Math.random(), billable: editBillable }); // Set warning to true immediately
      } catch (err) {
        console.log(err);
      }
    }
  };

  const handleTimeClick = (taskTime) => {
    if (taskTime.startTime) {
      setEditTask({ ...editTask, startTime: taskTime.startTime });
    } else if (taskTime.stopTime) {
      setEditTask({ ...editTask, stopTime: taskTime.stopTime });
    }
  };

  const handleChange = (e) => {
    const updateValue = e.target.value;
    const fieldToUpdate = e.target.name; // Assuming the input has the 'name' attribute set to the field name

    // Create an object with a computed property name to update the field dynamically
    const updatedEditTask = {
      fieldToUpdate: fieldToUpdate,
      updateValue: updateValue,
    };

    // Now, you can update the 'editTask' state with the new value
    setEditTask(updatedEditTask);
  };

  const handleBlur = (e, taskId) => {
    if (e.target.name === "seconds") {
      e.target.value = convertInputToHHMMSS(timeTrack.seconds);
      handleEditSubmit(taskId);
    } else {
      handleEditSubmit(taskId);
    }
  };

  useEffect(() => {
    // Add this event listener to your component or document
    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const activeElement = document.activeElement;
        if (activeElement.tagName === "INPUT") {
          const inputName = activeElement.getAttribute("name");
          if (
            inputName === "taskName" ||
            inputName === "startTime" ||
            inputName === "stopTime" ||
            inputName === "seconds"
          ) {
            activeElement.blur(); // Remove focus from the currently focused input
          }
        }
      }
    });
  });

  const handleKeyDown = (e, taskId) => {
    if (e.key === "Enter") {
      if (e.target.name === "seconds") {
        e.target.value = convertInputToHHMMSS(timeTrack.seconds);
        handleEditSubmit(taskId);
      } else {
        handleEditSubmit(taskId);
      }
    }
  };

  const handleEditSubmit = async (taskId) => {
    if (editTask.startTime && editTask.stopTime) {
      try {
        const res = await axios.post("api/editTask", {
          ...editTask,
          id: taskId,
        });
        console.log(res);
        setTasksData(calculateTotalSeconds(res.data.updatedTasks));
        setEditMsg({ id: Math.random(), edit: "time" }); // Set warning to true immediately
        console.log("Message: ", editMsg);
      } catch (err) {
        console.log(err);
      }
    } else {
      try {
        const result = await axios.post("api/editTask", {
          ...editTask,
          id: taskId,
        });
        if (result.status === 200) {
          console.log(result);
          setEditMsg({ id: Math.random(), edit: "description" }); // Set warning to true immediately
          console.log("Message: ", editMsg);
        }
      } catch (err) {
        console.log(err);
      }
    }
    console.log(editTask);
  };

  const DeletePopUp = (taskId) => {
    setDeleteTaskId((prevState) => ({
      ...prevState,
      [taskId]: !prevState[taskId],
    }));
  };

  const deleteConfirmation = (taskId) => {
    setConfirmDelete((prevState) => ({
      ...prevState,
      [taskId]: !prevState[taskId],
    }));
  };

  const showChildrenTask = (taskId) => {
    setOpenChildren((prevState) => ({
      ...prevState,
      [taskId]: !prevState[taskId],
    }));
  };

  const startCounter = () => {
    setStartTimer(true);
    var startTime = Date.now();
    setTrackTime({ ...trackTime, startTime });
  };

  const deleteTask = async (taskId) => {
    const result = await axios
      .post("/api/deleteTask", { taskId })
      .then((response) => {
        setTasksData(response.data.tasks);
        setEditMsg({ id: Math.random(), edit: "deleted" }); // Set warning to true immediately
      });
  };

  async function handleClick(task, isChildTask = false) {
    const newStartTimer = !startTimer;
    setStartTimer(newStartTimer);
    // Update local storage
    localStorage.setItem("startTimer", newStartTimer.toString());
    await axios
      .post("/api/startcounter?counter=start", { user: userId })
      .then((response) => {
        if (response.status === 200) {
          console.log(response);
          var startTime = Date.now();
          var childTask = {
            parentTaskId: isChildTask ? task.parentTaskId : task._id.$oid,
            taskName: task.taskName,
            project: task.project,
            projectTag: task.projectTag,
            billable: task.billable,
            startTime,
            stopTime: null,
            seconds: 0,
          };
          setTrackTime(childTask);
          localStorage.setItem("trackTime", JSON.stringify(trackTime));
          console.log("Counter started");
        }
      })
      .catch((error) => {
        console.error("Error starting counter:", error);
      });
  }

  useEffect(() => {
    const storedValue = localStorage.getItem("startTimer");
    if (storedValue !== null) {
      setStartTimer(storedValue === "true");
    } else {
      // If not stored in localStorage, set it to false initially
      localStorage.setItem("startTimer", "false");
    }
  }, []);

  function formatDateToCustomFormat(dateString) {
    const dateObject = new Date(dateString);

    const options = {
      weekday: "short",
      month: "short",
      day: "numeric",
    };

    const formattedDate = dateObject.toLocaleDateString("en-US", options);
    return formattedDate;
  }

  useEffect(() => {
    const storedValue = localStorage.getItem("startTimer");
    if (storedValue !== null) {
      setStartTimer(storedValue === "true");
    } else {
      // If not stored in localStorage, set it to false initially
      localStorage.setItem("startTimer", "false");
    }
  }, []);

  useEffect(() => {
    const storeSidebarValue = localStorage.getItem("showSidebar");
    if (storeSidebarValue !== null) {
      setShowSidebar(storeSidebarValue === "true");
    } else {
      localStorage.setItem("showSidebar", "false");
    }
  }, []);

  // Main effect for handling socket and timer logic
  useEffect(() => {
    const storedTrackTime = JSON.parse(localStorage.getItem("trackTime"));
    if (storedTrackTime) {
      setTrackTime(storedTrackTime);
    }
    const socket = io("https://backend-timer-for-clockify-clone.onrender.com", {
      // const socket = io("http://localhost:8080", {
      transports: ["websocket"],
    });

    socket.on("counter-update", (counter) => {
      // Check if the userEmail exists in counters object
      if (userId in counter) {
        console.log("user counter on client side: ", counter);
        const userCounter = counter[userId];
        setTrackTime((prevTrackTime) => ({
          ...prevTrackTime,
          seconds: userCounter,
        }));
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [userId]);

  useEffect(() => {
    // Set the state to an empty object after 3 seconds
    const timer = setTimeout(() => {
      setEditMsg(false);
    }, 3000);

    // Clear the timer when the component unmounts to avoid memory leaks
    return () => {
      clearTimeout(timer);
    };
  }, [editMsg]);

  const orderedTasks = tasksData.sort(
    (a, b) => new Date(a.createdOn) - new Date(b.createdOn)
  );
  const groupedTasks = groupTasksByWeeksAndCalculateTotals(orderedTasks);

  // const removalDelay = 2000; // Delay in milliseconds between each removal

  // removeObjectsFromArraySlowly(warning, removalDelay)
  //   .then((resultArray) => {})
  //   .catch((error) => {
  //     console.error("Error:", error);
  //   });

  // const restrictedWarnings = warning.slice(0, 7);

  return (
    <div>
      <Head>
        <link rel="icon" href="/icons8-clock-16.png" />
        <title>
          {counter ? formatSideTime(counter) + " Time Tracker" : "Task Manager"}
        </title>
      </Head>
      <div>
        <Sidebar
          startTimer={startTimer}
          trackTime={trackTime}
          counter={counter}
          setCounter={setCounter}
          userId={userId}
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          confirmDelete={confirmDelete}
        />
        {editMsg && (
          <div className="absolute right-8 md:mt-[550px] mt-[530px] z-10 text-white font-medium py-2 py-2 my-2 rounded bg-green-500 items-center px-2 transition-opacity duration-500 ease-in-out opacity-100">
            <div className="flex">
              <div className="flex">
                <svg
                  version="1.1"
                  id="Layer_1"
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  width="30px"
                  height="30px"
                  stroke="#000000"
                  fill="#FFFFFF"
                  viewBox="0 0 122.881 122.88"
                  enable-background="new 0 0 122.881 122.88"
                >
                  <g>
                    <path d="M61.44,0c16.966,0,32.326,6.877,43.445,17.995s17.996,26.479,17.996,43.444c0,16.967-6.877,32.327-17.996,43.445 S78.406,122.88,61.44,122.88c-16.966,0-32.326-6.877-43.444-17.995S0,78.406,0,61.439c0-16.965,6.877-32.326,17.996-43.444 S44.474,0,61.44,0L61.44,0z M34.556,67.179c-1.313-1.188-1.415-3.216-0.226-4.529c1.188-1.313,3.216-1.415,4.529-0.227L52.3,74.611 l31.543-33.036c1.223-1.286,3.258-1.336,4.543-0.114c1.285,1.223,1.336,3.257,0.113,4.542L54.793,81.305l-0.004-0.004 c-1.195,1.257-3.182,1.338-4.475,0.168L34.556,67.179L34.556,67.179z M100.33,22.55C90.377,12.598,76.627,6.441,61.44,6.441 c-15.188,0-28.938,6.156-38.89,16.108c-9.953,9.953-16.108,23.702-16.108,38.89c0,15.188,6.156,28.938,16.108,38.891 c9.952,9.952,23.702,16.108,38.89,16.108c15.187,0,28.937-6.156,38.89-16.108c9.953-9.953,16.107-23.702,16.107-38.891 C116.438,46.252,110.283,32.502,100.33,22.55L100.33,22.55z" />
                  </g>
                </svg>

                <p className="pl-2 pr-24">
                  {editMsg.edit === "description"
                    ? "Successfully updated task description!"
                    : editMsg.edit === "time"
                    ? "Successfully updated date and time!"
                    : editMsg.edit === "deleted"
                    ? "Entery deleted Successfully!"
                    : editMsg.billable === true
                    ? "Time entry successfully marked as billable"
                    : "Time entry successfully marked as non-billable"}
                </p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                onClick={() => {
                  setEditMsg();
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
        )}
        <main
          className={`sticky top-0 z-0 ease-in-out duration-300 ${
            showSidebar ? "md:ml-16" : "lg:ml-52"
          }  pt-14 h-screen bg-gray-50 overflow-auto`}
        >
          <div className="md:px-6">
            <div className="relative max-w-4x1 time-track-records">
              <Timetracker
                setTasksData={setTasksData}
                trackTime={trackTime}
                setTrackTime={setTrackTime}
                startCounter={(resume) => startCounter(resume)}
                startTimer={startTimer}
                setStartTimer={setStartTimer}
                projects={projects}
                showAddBtn={showAddBtn}
                setAddBtn={setAddBtn}
                showCancelBtn={showCancelBtn}
                setCancelBtn={setCancelBtn}
                setCounter={setCounter}
                counter={counter}
                userId={userId}
                tags={tags}
                billable={billable}
                setBillable={setBillable}
              />

              {Object.keys(groupedTasks)
                .reverse()
                .map((weekKey) => {
                  const currentDate = new Date();
                  const weekStartDate = new Date(weekKey);
                  const weekEndDate = new Date(weekStartDate);

                  // Set time components to the same value for both current date and week start/end dates
                  currentDate.setHours(0, 0, 0, 0);
                  weekStartDate.setHours(0, 0, 0, 0);
                  weekEndDate.setHours(23, 59, 59, 999);

                  weekEndDate.setDate(weekStartDate.getDate() + 6);

                  // Calculate the start date of the previous week (Last week)
                  const oneWeekAgo = new Date(currentDate);
                  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

                  // Define the variable to store the week label
                  let weekLabel;

                  // Compare the current date with the week's start and end dates
                  if (
                    currentDate >= weekStartDate &&
                    currentDate <= weekEndDate
                  ) {
                    weekLabel = "This week";
                  } else if (currentDate < weekStartDate) {
                    weekLabel = "Last week";
                  } else {
                    // Format the start and end dates for any other week
                    const formattedStartDate =
                      formatDateToCustomFormat(weekStartDate);
                    const formattedEndDate =
                      formatDateToCustomFormat(weekEndDate);
                    weekLabel = `${formattedStartDate} - ${formattedEndDate}`;
                  }

                  function isCurrentWeekFunction(weekKey) {
                    const currentDate = new Date();
                    const weekStartDate = new Date(weekKey);
                    const weekEndDate = new Date(weekStartDate);

                    // Set time components to the same value for both current date and week start/end dates
                    currentDate.setHours(0, 0, 0, 0);
                    weekStartDate.setHours(0, 0, 0, 0);
                    weekEndDate.setHours(0, 0, 0, 0);

                    weekEndDate.setDate(weekStartDate.getDate() + 6); // Calculate the end of the week

                    // Check if the current date falls within the week's start and end dates
                    return (
                      currentDate >= weekStartDate && currentDate <= weekEndDate
                    );
                  }

                  const weekTotalSeconds = groupedTasks[weekKey].weekTotal;
                  const isCurrentWeek = isCurrentWeekFunction(weekKey); // Implement this function

                  // Calculate the week total with or without the counter
                  const weekTotalWithCounter = isCurrentWeek
                    ? weekTotalSeconds + (counter || 0)
                    : weekTotalSeconds;

                  return (
                    <div key={weekKey}>
                      <div className="md:flex justify-between md:py-5 pt-12 md:px-0 px-4 items-center">
                        <h3 className="text-md text-slate-900 font-sans">
                          {weekLabel}
                        </h3>
                        <h2 className="text-md text-slate-400 font-sans">
                          Week Total: {""}
                          <strong className="text-lg font-medium text-slate-600 w-[30px] px-2">
                            {formatTime(weekTotalWithCounter)}
                          </strong>
                        </h2>
                      </div>
                      {groupedTasks[weekKey].tasks
                        .reverse()
                        .map((task, index) => {
                          const taskId = task._id.$oid;
                          // console.log(task.totalSeconds);
                          return !task.parentTaskId ? (
                            <div className="md:pt-0 pt-3" key={index}>
                              <div className="parent relative cursor-pointer mb-3">
                                <div className="flex item-center justify-between rounded border-x border-t  bg-gray-200">
                                  <div className="px-3 py-1 text-sm text-slate-400 text-center font-sans">
                                    {formatDateToCustomFormat(task.createdOn)}
                                  </div>
                                  <div className="flex mr-6 px-3 py-1  text-sm text-slate-400 font-sans">
                                    <div className="mt-1">Total:</div>
                                    <div className="mx-1.5 text-lg font-medium text-slate-700">
                                      {formatTime(task.totalSeconds)}
                                    </div>
                                  </div>
                                </div>
                                <div
                                  className={`md:flex block  ${
                                    children ? "border-b-2" : "border-b"
                                  } border-x justify-between bg-white overflow-hidden`}
                                >
                                  <div className="md:flex items-center justify-between w-full ">
                                    <div className="flex pl-6 md:pt-0 pt-6 text-base items-center w-full whitespace-nowrap  ">
                                      {task.totalCount > 1 ? (
                                        <div
                                          onClick={() =>
                                            showChildrenTask(taskId)
                                          }
                                        >
                                          <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2 py-1 rounded dark:bg-green-900 dark:text-green-300">
                                            {task.totalCount}
                                          </span>
                                        </div>
                                      ) : (
                                        ""
                                      )}
                                      <div className="w-64">
                                        <input
                                          onChange={handleChange}
                                          onBlur={(e) => handleBlur(e, taskId)} // Call handleEditSubmit on onBlur
                                          onKeyDown={(e) =>
                                            handleKeyDown(e, taskId)
                                          } // Call handleEditSubmit on Enter key press
                                          name="taskName"
                                          defaultValue={task.taskName}
                                          className="transition duration-0 hover:duration-700 hover:border-gray-700 border-transparent border text-gray-900 text-md block w-full px-2 py-2"
                                          placeholder="Add description..."
                                        />
                                      </div>
                                    </div>
                                    <div className="flex px-[23px] md:py-0 w-full items-center md:pt-0 pt-4">
                                      <div>
                                        <svg
                                          className="bi bi-dot"
                                          fill="#5C5CFF"
                                          height="30"
                                          viewBox="0 0 16 16"
                                          width="30"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
                                        </svg>
                                      </div>
                                      <div className="text-base text-blue-600 dark:text-white">
                                        {task.project}
                                      </div>
                                    </div>
                                    <div className="md:hidden block px-8 pt-4 pb-6">
                                      {task.projectTag ? (
                                        <div>
                                          <span className="px-[5px] py-[1px] bg-sky-100 text-gray-500 text-sm">
                                            {task.projectTag}
                                          </span>
                                        </div>
                                      ) : (
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          strokeWidth="1.5"
                                          stroke="currentColor"
                                          opacity="0.5"
                                          className="w-6 h-6"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                                          />
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M6 6h.008v.008H6V6z"
                                          />
                                        </svg>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex md:border-0 border-t md:h-fit h-12 items-center">
                                    <div className="flex w-full  items-center">
                                      <div className="md:border-x-2 md:block hidden border-r-2 border-dotted px-4 md:py-3 py-2 w-full items-center">
                                        {task.projectTag ? (
                                          <div className="w-full flex justify-center">
                                            <span className="px-[5px] py-[1px] bg-sky-100 text-gray-500 text-sm">
                                              {task.projectTag}
                                            </span>
                                          </div>
                                        ) : (
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth="1.5"
                                            stroke="currentColor"
                                            opacity="0.5"
                                            className="w-6 h-6 mx-auto"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                                            />
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              d="M6 6h.008v.008H6V6z"
                                            />
                                          </svg>
                                        )}
                                      </div>
                                      <div className="px-4 w-full">
                                        <svg
                                          onClick={() => {
                                            const taskState = task.billable;
                                            handleEditBillable(
                                              taskId,
                                              taskState
                                            );
                                          }}
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="icon icon-tabler icon-tabler-currency-pound mx-auto"
                                          width="30"
                                          height="40"
                                          viewBox="0 0 24 24"
                                          strokeWidth="2"
                                          stroke={`${
                                            task.billable
                                              ? "#0000D1"
                                              : "#2c3e50"
                                          }`}
                                          fill="none"
                                          opacity={`${
                                            task.billable ? "0.5" : "0.3"
                                          }`}
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <path
                                            stroke="none"
                                            d="M0 0h24v24H0z"
                                            fill="none"
                                          />
                                          <path d="M17 18.5a6 6 0 0 1 -5 0a6 6 0 0 0 -5 .5a3 3 0 0 0 2 -2.5v-7.5a4 4 0 0 1 7.45 -2m-2.55 6h-7" />
                                        </svg>
                                      </div>
                                    </div>
                                    <div className="flex items-center">
                                      <div className="border-x-2 border-dotted md:px-4 px-2 h-10 text-base text-sm dark:text-white ">
                                        <div className="pointer items-center flex">
                                          <div>
                                            <input
                                              defaultValue={formatRecordTime(
                                                task.startTime
                                              )}
                                              name="startTime"
                                              type="text"
                                              // Create a ref for the input element
                                              onClick={() => {
                                                const stop_Time = format(
                                                  task.stopTime,
                                                  "HH:mm"
                                                );
                                                const taskTime = {
                                                  stopTime: stop_Time,
                                                };
                                                handleTimeClick(taskTime);
                                              }}
                                              onBlur={(e) =>
                                                handleBlur(e, taskId)
                                              } // Call handleEditSubmit on onBlur
                                              onKeyDown={(e) =>
                                                handleKeyDown(e, taskId)
                                              } // Call handleEditSubmit on Enter key press
                                              onChange={(e) => {
                                                setEditTask({
                                                  ...editTask,
                                                  startTime: e.target.value,
                                                });
                                              }}
                                              className="transition duration-0 hover:duration-700 hover:border-gray-700 border-transparent border text-gray-900 text-md w-14 px-2 py-2"
                                            />
                                          </div>
                                          <span className="px-2">-</span>
                                          <div>
                                            <input
                                              type="text"
                                              defaultValue={formatRecordTime(
                                                task.stopTime
                                              )}
                                              name="stopTime"
                                              // Create a ref for the input element
                                              onClick={() => {
                                                const start_Time = format(
                                                  task.startTime,
                                                  "HH:mm"
                                                );
                                                const taskTime = {
                                                  startTime: start_Time,
                                                };
                                                handleTimeClick(taskTime);
                                              }}
                                              onBlur={(e) =>
                                                handleBlur(e, taskId)
                                              } // Call handleEditSubmit on onBlur
                                              onKeyDown={(e) =>
                                                handleKeyDown(e, taskId)
                                              } // Call handleEditSubmit on Enter key press
                                              onChange={(e) => {
                                                setEditTask({
                                                  ...editTask,
                                                  stopTime: e.target.value,
                                                });
                                              }}
                                              className="transition duration-0 hover:duration-700 hover:border-gray-700 border-transparent border text-gray-900 text-md w-14 px-2 py-2"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                      <div className="border-r-2 border-dotted py-2 md:px-2 px-2 md:text-lg text-sm font-medium text-slate-700">
                                        <input
                                          defaultValue={formatTime(
                                            task.seconds
                                          )}
                                          type="text"
                                          name="seconds"
                                          // Create a ref for the input element
                                          onClick={() => {
                                            const start_Time = format(
                                              task.startTime,
                                              "HH:mm"
                                            );
                                            const end_Time = format(
                                              task.stopTime,
                                              "HH:mm"
                                            );
                                            setEditTask({
                                              ...editTask,
                                              startTime: start_Time,
                                              stopTime: end_Time,
                                            });
                                          }}
                                          onChange={(e) => {
                                            setEditTask({
                                              ...editTask,
                                              seconds: e.target.value,
                                            });
                                            setTimeTrack({
                                              seconds: e.target.value,
                                            });
                                          }}
                                          onBlur={(e) => {
                                            handleBlur(e, taskId);
                                          }} // Call handleEditSubmit on onBlur
                                          onKeyDown={(e) => {
                                            handleKeyDown(e, taskId);
                                          }} // Call handleEditSubmit on Enter key press
                                          className="text-center transition duration-0 hover:duration-700 hover:border-gray-700 border-transparent border text-gray-900 lg:text-lg text-sm block w-[100px] lg:h-[35px]"
                                        />
                                      </div>
                                      <div className="py-3 px-3 items-center">
                                        <div
                                          className="flex py-2"
                                          onClick={() => setAddBtn(false)}
                                        >
                                          <a
                                            className="mx-3 pointer"
                                            onClick={() => handleClick(task)}
                                          >
                                            <svg
                                              onClick={() =>
                                                setCancelBtn(!showCancelBtn)
                                              }
                                              xmlns="http://www.w3.org/2000/svg"
                                              fill="none"
                                              viewBox="0 0 24 24"
                                              strokeWidth="1.5"
                                              stroke="currentColor"
                                              opacity="0.5"
                                              className="w-6 h-6"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
                                              />
                                            </svg>
                                          </a>
                                          <div
                                            onClick={() => DeletePopUp(taskId)}
                                            className="text-blue-600 rounded-md"
                                          >
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              width="20"
                                              height="20"
                                              fill="currentColor"
                                              className="bi bi-three-dots-vertical mt-[2px] cursor-pointer"
                                              viewBox="0 0 16 16"
                                            >
                                              <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                                            </svg>
                                          </div>
                                          {deleteTaskId[taskId] && (
                                            <div className="absolute right-0 md:top-20 top-[230px] mt-2 py-2 w-[100px] bg-white rounded-md shadow-lg z-10">
                                              <ul>
                                                <li
                                                  onClick={() => {
                                                    deleteConfirmation(taskId);
                                                    setDeleteTaskId(false);
                                                  }}
                                                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                                                >
                                                  Delete
                                                </li>
                                              </ul>
                                            </div>
                                          )}
                                          {confirmDelete[taskId] && (
                                            <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity z-10">
                                              <div className="transition ease-in-out py-[40px] shadow drop-shadow-lg rounded-md bg-white absolute top-1/3 m-auto inset-x-0 -translate-y-1/2 w-2/5">
                                                <div className="absolute w-full top-0 right-0 pointer bg-white">
                                                  <div className="flex px-5 items-center justify-between w-full py-5">
                                                    <div>
                                                      <h1 className="text-2xl text-gray-500">
                                                        Delete
                                                      </h1>
                                                    </div>
                                                    <svg
                                                      onClick={() => {
                                                        setConfirmDelete(false);
                                                        setDeleteTaskId(false);
                                                      }}
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
                                                      <line
                                                        x1="18"
                                                        y1="6"
                                                        x2="6"
                                                        y2="18"
                                                      />
                                                      <line
                                                        x1="6"
                                                        y1="6"
                                                        x2="18"
                                                        y2="18"
                                                      />
                                                    </svg>
                                                  </div>
                                                  <div className="w-full border-y px-5 py-[20px] text-sm">
                                                    <p>
                                                      Are you sure you want to
                                                      delete entry?
                                                    </p>
                                                  </div>
                                                  <div className="flex py-4 items-center float-right px-6">
                                                    <div
                                                      onClick={() =>
                                                        setConfirmDelete(false)
                                                      }
                                                      className="text-blue-400 hover:underline hover:text-blue-500 font-medium rounded w-fit text-sm px-8 text-center"
                                                    >
                                                      Cancel
                                                    </div>
                                                    {"  "}
                                                    <button
                                                      onClick={() => {
                                                        deleteTask(
                                                          task._id.$oid
                                                        );
                                                        setConfirmDelete(false);
                                                        setDeleteTaskId(false);
                                                      }}
                                                      className="text-white bg-red-500 hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium text-sm w-[110px] px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                                    >
                                                      DELETE
                                                    </button>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="border-b-4">
                                  {openChildren[taskId] && (
                                    <div>
                                      {groupedTasks[weekKey].tasks.map(
                                        (childTask, index) => {
                                          const taskId = childTask._id.$oid;
                                          return childTask.parentTaskId ==
                                            task._id.$oid ? (
                                            <div
                                              key={index}
                                              className="md:flex relative bg-gray-50 border-b border-x w-full"
                                            >
                                              <div className="md:flex items-center w-full ">
                                                <div className="px-8 md:py-2 py-6 text-base w-[70%] whitespace-nowrap ">
                                                  <input
                                                    name="taskName"
                                                    onChange={handleChange}
                                                    onBlur={() =>
                                                      handleBlur(taskId)
                                                    } // Call handleEditSubmit on onBlur
                                                    onKeyDown={(e) =>
                                                      handleKeyDown(e, taskId)
                                                    } // Call handleEditSubmit on Enter key press
                                                    defaultValue={
                                                      childTask.taskName
                                                    }
                                                    className="transition duration-0 hover:duration-700 hover:border-gray-700 bg-gray-50 border-transparent border text-gray-900 text-md block w-full px-2 py-2"
                                                  />
                                                </div>
                                                <div className="flex items-center">
                                                  <div>
                                                    <svg
                                                      className="bi bi-dot"
                                                      fill="#5C5CFF"
                                                      height="30"
                                                      viewBox="0 0 16 16"
                                                      width="30"
                                                      xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                      <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
                                                    </svg>
                                                  </div>
                                                  <div className="text-base text-blue-600 dark:text-white">
                                                    {childTask.project}
                                                  </div>
                                                </div>
                                                <div className="md:hidden block px-8 pt-4 pb-6">
                                                  {childTask.projectTag ? (
                                                    <div>
                                                      <span className="px-[5px] py-[1px] bg-sky-100 text-gray-500 text-sm">
                                                        {task.projectTag}
                                                      </span>
                                                    </div>
                                                  ) : (
                                                    <svg
                                                      xmlns="http://www.w3.org/2000/svg"
                                                      fill="none"
                                                      viewBox="0 0 24 24"
                                                      strokeWidth="1.5"
                                                      stroke="currentColor"
                                                      opacity="0.5"
                                                      className="w-6 h-6"
                                                    >
                                                      <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                                                      />
                                                      <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M6 6h.008v.008H6V6z"
                                                      />
                                                    </svg>
                                                  )}
                                                </div>
                                              </div>
                                              <div className="flex md:border-0 border-t md:h-fit h-12 items-center">
                                                <div className="flex w-full  items-center">
                                                  <div className="md:border-x-2 md:block hidden border-r-2 border-dotted px-4 md:py-3 py-2 w-full items-center">
                                                    {childTask.projectTag ? (
                                                      <div className="w-full flex justify-center">
                                                        <span className="px-[5px] py-[1px] bg-sky-100 text-gray-500 text-sm">
                                                          {childTask.projectTag}
                                                        </span>
                                                      </div>
                                                    ) : (
                                                      <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth="1.5"
                                                        stroke="currentColor"
                                                        opacity="0.5"
                                                        className="w-6 h-6 mx-auto"
                                                      >
                                                        <path
                                                          strokeLinecap="round"
                                                          strokeLinejoin="round"
                                                          d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                                                        />
                                                        <path
                                                          strokeLinecap="round"
                                                          strokeLinejoin="round"
                                                          d="M6 6h.008v.008H6V6z"
                                                        />
                                                      </svg>
                                                    )}
                                                  </div>
                                                  <div className="px-4 w-full">
                                                    <svg
                                                      onClick={() => {
                                                        const taskState =
                                                          childTask.billable;
                                                        handleEditBillable(
                                                          taskId,
                                                          taskState
                                                        );
                                                      }}
                                                      xmlns="http://www.w3.org/2000/svg"
                                                      className="icon icon-tabler icon-tabler-currency-pound mx-auto"
                                                      width="30"
                                                      height="40"
                                                      viewBox="0 0 24 24"
                                                      strokeWidth="2"
                                                      stroke={`${
                                                        childTask.billable
                                                          ? "#0000D1"
                                                          : "#2c3e50"
                                                      }`}
                                                      fill="none"
                                                      opacity={`${
                                                        childTask.billable
                                                          ? "0.5"
                                                          : "0.3"
                                                      }`}
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"
                                                    >
                                                      <path
                                                        stroke="none"
                                                        d="M0 0h24v24H0z"
                                                        fill="none"
                                                      />
                                                      <path d="M17 18.5a6 6 0 0 1 -5 0a6 6 0 0 0 -5 .5a3 3 0 0 0 2 -2.5v-7.5a4 4 0 0 1 7.45 -2m-2.55 6h-7" />
                                                    </svg>
                                                  </div>
                                                </div>
                                                <div className="flex items-center">
                                                  <div className="border-x-2 border-dotted md:px-4 px-2 py-1 items-center h-10 text-base text-sm dark:text-white ">
                                                    <div className="pointer items-center flex">
                                                      <div>
                                                        <input
                                                          defaultValue={formatRecordTime(
                                                            childTask.startTime
                                                          )}
                                                          name="startTime"
                                                          type="text"
                                                          onClick={() => {
                                                            const stop_Time =
                                                              format(
                                                                childTask.stopTime,
                                                                "HH:mm"
                                                              );
                                                            const taskTime = {
                                                              stopTime:
                                                                stop_Time,
                                                            };
                                                            handleTimeClick(
                                                              taskTime
                                                            );
                                                          }}
                                                          onBlur={() =>
                                                            handleBlur(taskId)
                                                          } // Call handleEditSubmit on onBlur
                                                          onKeyDown={(e) =>
                                                            handleKeyDown(
                                                              e,
                                                              taskId
                                                            )
                                                          } // Call handleEditSubmit on Enter key press
                                                          onChange={(e) => {
                                                            setEditTask({
                                                              ...editTask,
                                                              startTime:
                                                                e.target.value,
                                                            });
                                                          }}
                                                          className="transition duration-0 hover:duration-700 bg-gray-50 hover:border-gray-700 border-transparent border text-gray-900 text-md w-14 px-2 py-2"
                                                        />
                                                      </div>
                                                      <span className="px-2">
                                                        -
                                                      </span>
                                                      <div>
                                                        <input
                                                          defaultValue={formatRecordTime(
                                                            childTask.stopTime
                                                          )}
                                                          name="stopTime"
                                                          onClick={() => {
                                                            const start_Time =
                                                              format(
                                                                childTask.startTime,
                                                                "HH:mm"
                                                              );
                                                            const taskTime = {
                                                              startTime:
                                                                start_Time,
                                                            };
                                                            handleTimeClick(
                                                              taskTime
                                                            );
                                                          }}
                                                          onBlur={() =>
                                                            handleBlur(taskId)
                                                          } // Call handleEditSubmit on onBlur
                                                          onKeyDown={(e) =>
                                                            handleKeyDown(
                                                              e,
                                                              taskId
                                                            )
                                                          } // Call handleEditSubmit on Enter key press
                                                          onChange={(e) => {
                                                            setEditTask({
                                                              ...editTask,
                                                              stopTime:
                                                                e.target.value,
                                                            });
                                                          }}
                                                          className="transition duration-0 hover:duration-700 bg-gray-50 hover:border-gray-700 border-transparent border text-gray-900 text-md w-14 px-2 py-2"
                                                        />
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <div className="border-r-2 border-dotted py-2 md:px-2 px-2 md:text-lg text-sm font-medium text-slate-700">
                                                    <input
                                                      defaultValue={formatTime(
                                                        childTask.seconds
                                                      )}
                                                      type="text"
                                                      name="seconds"
                                                      // Create a ref for the input element
                                                      onClick={() => {
                                                        const start_Time =
                                                          format(
                                                            task.startTime,
                                                            "HH:mm"
                                                          );
                                                        const end_Time = format(
                                                          task.stopTime,
                                                          "HH:mm"
                                                        );
                                                        setEditTask({
                                                          ...editTask,
                                                          startTime: start_Time,
                                                          stopTime: end_Time,
                                                        });
                                                      }}
                                                      onChange={(e) => {
                                                        setEditTask({
                                                          ...editTask,
                                                          seconds:
                                                            e.target.value,
                                                        });
                                                        setTimeTrack({
                                                          seconds:
                                                            e.target.value,
                                                        });
                                                      }}
                                                      onBlur={(e) => {
                                                        handleBlur(e, taskId);
                                                      }} // Call handleEditSubmit on onBlur
                                                      onKeyDown={(e) => {
                                                        handleKeyDown(
                                                          e,
                                                          taskId
                                                        );
                                                      }} // Call handleEditSubmit on Enter key press
                                                      className="transition duration-0 hover:duration-700 hover:border-gray-700 border-transparent border text-gray-900 bg-gray-50 px-2 py-1 w-24"
                                                    />
                                                  </div>
                                                  <div className="py-3 px-3 items-center">
                                                    <div
                                                      className="flex py-2"
                                                      onClick={() =>
                                                        setAddBtn(false)
                                                      }
                                                    >
                                                      <a
                                                        className="mx-3 pointer"
                                                        onClick={() =>
                                                          handleClick(
                                                            childTask,
                                                            true
                                                          )
                                                        }
                                                      >
                                                        <svg
                                                          onClick={() =>
                                                            setCancelBtn(
                                                              !showCancelBtn
                                                            )
                                                          }
                                                          xmlns="http://www.w3.org/2000/svg"
                                                          fill="none"
                                                          viewBox="0 0 24 24"
                                                          strokeWidth="1.5"
                                                          stroke="currentColor"
                                                          opacity="0.5"
                                                          className="w-6 h-6"
                                                        >
                                                          <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
                                                          />
                                                        </svg>
                                                      </a>
                                                      <div
                                                        onClick={() =>
                                                          DeletePopUp(taskId)
                                                        }
                                                        className="text-blue-600 rounded-md"
                                                      >
                                                        <svg
                                                          xmlns="http://www.w3.org/2000/svg"
                                                          width="20"
                                                          height="20"
                                                          fill="currentColor"
                                                          className="bi bi-three-dots-vertical mt-[2px] cursor-pointer"
                                                          viewBox="0 0 16 16"
                                                        >
                                                          {" "}
                                                          <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                                                        </svg>
                                                      </div>
                                                      {deleteTaskId[taskId] && (
                                                        <div className="absolute right-0 md:top-6 mt-8 mt-2 py-2 w-[100px] bg-white rounded-md shadow-lg z-10">
                                                          <ul>
                                                            <li
                                                              onClick={() => {
                                                                setConfirmDelete(
                                                                  true
                                                                );
                                                                setDeleteTaskId(
                                                                  {}
                                                                );
                                                              }}
                                                              className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                                                            >
                                                              Delete
                                                            </li>
                                                          </ul>
                                                        </div>
                                                      )}
                                                      {confirmDelete && (
                                                        <div className="fixed inset-0 bg-black bg-opacity-80 transition-opacity z-10">
                                                          <div className="transition ease-in-out py-[40px] shadow drop-shadow-lg rounded-md bg-white absolute top-1/3 m-auto inset-x-0 -translate-y-1/2 w-2/5">
                                                            <div className="absolute w-full top-0 right-0 pointer bg-white">
                                                              <div className="flex px-5 items-center justify-between w-full py-5">
                                                                <div>
                                                                  <h1 className="text-2xl text-gray-500">
                                                                    Delete
                                                                  </h1>
                                                                </div>
                                                                <svg
                                                                  onClick={() =>
                                                                    setConfirmDelete(
                                                                      false
                                                                    )
                                                                  }
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
                                                                  <line
                                                                    x1="18"
                                                                    y1="6"
                                                                    x2="6"
                                                                    y2="18"
                                                                  />
                                                                  <line
                                                                    x1="6"
                                                                    y1="6"
                                                                    x2="18"
                                                                    y2="18"
                                                                  />
                                                                </svg>
                                                              </div>
                                                              <div className="w-full border-y px-5 py-[20px] text-sm">
                                                                <p>
                                                                  Are you sure
                                                                  you want to
                                                                  delete entry?
                                                                </p>
                                                              </div>
                                                              <div className="flex py-4 items-center float-right px-6">
                                                                <div
                                                                  onClick={() =>
                                                                    setConfirmDelete(
                                                                      false
                                                                    )
                                                                  }
                                                                  className="text-blue-400 hover:underline hover:text-blue-500 font-medium rounded w-fit text-sm px-8 text-center"
                                                                >
                                                                  Cancel
                                                                </div>
                                                                {"  "}
                                                                <button
                                                                  onClick={() => {
                                                                    deleteTask(
                                                                      childTask
                                                                        ._id
                                                                        .$oid
                                                                    );
                                                                    setConfirmDelete(
                                                                      false
                                                                    );
                                                                  }}
                                                                  className="text-white bg-red-500 hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium text-sm w-[110px] px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                                                >
                                                                  DELETE
                                                                </button>
                                                              </div>
                                                            </div>
                                                          </div>
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          ) : (
                                            ""
                                          );
                                        }
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            ""
                          );
                        })}
                    </div>
                  );
                })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
