import Sidebar from "../../components/sidebar";
import TimeSheetTask from "../../components/TimeSheetTask";
import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import {
  convertInputToHHMMSS,
  convertTimeStringToSeconds,
  formatTime,
  generateWeekArray,
  organizeTasks,
  calculateTotalSeconds,
} from "../../util/commonFunctions";
import Dropdown from "../../components/TimeSheetDropDown";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import clientPromise from "../../util/mongodb";
import { EJSON } from "bson";
import { format } from "date-fns";
import { startOfWeek, endOfWeek } from "date-fns";
import DateRangePickerComp from "../../components/DateRangePickerComp";
import axios from "axios";

export async function getServerSideProps(ctx) {
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

  const client = await clientPromise;
  const db = client.db(process.env.PROJECTS_DB);

  // Calculate the start and end dates of the current week
  const currentDate = new Date();
  const currentDayOfWeek = currentDate.getDay(); // 0 for Sunday, 1 for Monday, etc.
  const startDate = new Date(currentDate);
  startDate.setDate(startDate.getDate() - currentDayOfWeek); // Start of the week (Sunday)
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6); // End of the week (Saturday)
  endDate.setHours(23, 59, 59, 999);

  const userTasks = EJSON.serialize(
    await db
      .collection("tasks")
      .find({
        userId: userSession.user.id,
        createdOn: {
          $gte: startDate.getTime(),
          $lte: endDate.getTime(),
        },
      })
      .toArray()
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

  return {
    props: {
      tags: userProjectsTags,
      tasks: userTasks,
      projects: userProjects,
    },
  };
}

export default function TimeSheet({ projects, tasks, tags }) {
  const [showSidebar, setShowSidebar] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [taskData, setTasksData] = useState(tasks);
  const [trackTime, setTrackTime] = useState({ projectTag: null });
  const [previousValue, setPreviousValue] = useState("");
  const [enterKeyPressed, setEnterKeyPressed] = useState(false);
  const [currentValue, setCurrentValue] = useState("");
  const [timeSheetData, setTimeSheetData] = useState({});
  const [projectArray, setProjectArray] = useState([]);
  const today = new Date();
  const currentWeekStartDate = startOfWeek(today, { weekStartsOn: 0 }); // Assuming Monday is the start of the week
  const currentWeekEndDate = endOfWeek(today, { weekStartsOn: 0 });
  const [date, setDate] = useState({
    startDate: currentWeekStartDate,
    endDate: currentWeekEndDate,
    key: "selection",
  });

  const inputRef = useRef(null);

  useEffect(() => {
    const storeSidebarValue = localStorage.getItem("showSidebar");
    if (storeSidebarValue !== null) {
      setShowSidebar(storeSidebarValue === "true");
    } else {
      localStorage.setItem("showSidebar", "false");
    }
  }, []);

  // useEffect(() => {
  //   document.addEventListener("keydown", (e) => {
  //     if (e.key === "Enter") {
  //       const activeElement = document.activeElement;
  //       if (activeElement.tagName === "INPUT") {
  //         const inputName = activeElement.getAttribute("name");
  //         if (inputName === "task") {
  //           // Shift focus to a different element (e.g., the body) to avoid triggering onBlur
  //           document.body.focus();
  //         }
  //       }
  //     }
  //   });
  // });

  const timeSheetProject = (projectId) => {
    setConfirmDelete((prevState) => ({
      ...prevState,
      [projectId]: !prevState[projectId],
    }));
  };

  const weekArray = generateWeekArray(date);

  // useEffect(() => {
  //   const organizedData = organizeTasks(taskData, weekArray);
  //   console.log("organizedData:", organizedData);
  //   setTimeSheetTaskData(organizedData);
  // }, [taskData]);

  const handleSubmit = async (e, projectName, task, newValue) => {
    if (!enterKeyPressed && currentValue !== "" && newValue !== "00:00:00") {
      const seconds = convertTimeStringToSeconds(newValue);
      var milliseconds = seconds * 1000;

      // if (task.tasksdata.length === 0) {
      const currentTime = Date.now();
      const start_time = currentTime - milliseconds;

      var newEntry = {
        project: projectName,
        startTime: start_time,
        stopTime: currentTime,
        seconds: seconds,
        createdOn: Date.parse(task.date),
      };

      try {
        const result = await axios.post("/api/tracktime", { data: newEntry });
        console.log(result);

        const weekFirstDate = Date.parse(weekArray[0]);
        const weekLastDate = Date.parse(weekArray[6]);
        console.log(weekFirstDate, weekLastDate);

        const filterTasks = result.data.tasks.filter((task) => {
          const weekTasks = task.createdOn;
          return weekTasks >= weekFirstDate && weekTasks <= weekLastDate;
        });
        setTasksData(calculateTotalSeconds(filterTasks));
        e.target.value = convertInputToHHMMSS(currentValue);
      } catch (err) {
        console.log(err);
      }
      // Update the previous value to the current value
      setPreviousValue(newValue);
    }
    //  Reset the flag
    setEnterKeyPressed(false);
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setCurrentValue(newValue);
  };

  const handleKeySubmit = async (e, projectName, task, newValue, projectId) => {
    if (e.key === "Enter") {
      removeProject(projectId);
      setEnterKeyPressed(true);
      if (currentValue !== "" && newValue !== "00:00:00") {
        const taskInput = e.target.name;
        console.log(taskInput);
        const seconds = convertTimeStringToSeconds(newValue);
        var milliseconds = seconds * 1000;

        // if (task.tasksdata.length === 0) {
        const currentTime = Date.now();
        const start_time = currentTime - milliseconds;

        var newEntry = {
          project: projectName,
          startTime: start_time,
          stopTime: currentTime,
          seconds: seconds,
          createdOn: Date.parse(task.date),
        };

        try {
          const result = await axios.post("/api/tracktime", { data: newEntry });
          console.log(result);
          const weekFirstDate = Date.parse(weekArray[0]);
          const weekLastDate = Date.parse(weekArray[6]);
          console.log(weekFirstDate, weekLastDate);

          const filterTasks = result.data.tasks.filter((task) => {
            const weekTasks = task.createdOn;
            return weekTasks >= weekFirstDate && weekTasks <= weekLastDate;
          });
          setTasksData(calculateTotalSeconds(filterTasks));
          e.target.value = convertInputToHHMMSS(currentValue);
        } catch (err) {
          console.log(err);
        }
        // Update the previous value to the current value
        setPreviousValue(newValue);
      }
      // Remove focus after a short delay
      setTimeout(() => {
        inputRef.current.blur();
      }, 100);
    }
  };

  const removeProject = (projectId) => {
    const removeProjectId = projectId;
    console.log("removeProject", removeProjectId);
    const filteredProjectsArray = projectArray.filter(
      (project) => project.projectId !== removeProjectId
    );
    setProjectArray(filteredProjectsArray);
  };

  const organizedData = organizeTasks(taskData, weekArray);

  return (
    <>
      <Head>
        <link rel="icon" href="/icons8-clock-16.png" />
        <title>Task Manager</title>
      </Head>
      <div>
        <div>
          <Sidebar
            showSidebar={showSidebar}
            setShowSidebar={setShowSidebar}
            confirmDelete={confirmDelete}
          />
          <main
            className={`sticky top-0 z-0 ease-in-out duration-300 ${
              showSidebar ? "md:ml-16" : "md:ml-52"
            }  pt-14 h-screen bg-gray-50 overflow-auto`}
          >
            <div className="px-6 py-8">
              <div className="mt-6 max-w-4x1 mx-auto">
                <div className="pr-[43px] pb-8 flex w-full justify-between">
                  <div>
                    <h1 className="text-2xl text-slate-600">Timesheet</h1>
                  </div>
                  <DateRangePickerComp
                    date={date}
                    setDate={setDate}
                    setTasksData={setTasksData}
                  />
                </div>
                <div className="border font-sans border-neutral-300 w-full bg-slate-50">
                  <div className="flex justify-between border border-b-gray-300 w-full py-0.5 text-gray-500 text-sm items-center bg-gray-200">
                    <div className="px-6 py-2 ">Projects</div>
                    <div className="flex items-center">
                      {weekArray.map((date, i) => {
                        return (
                          <div key={i} className="w-[90px]">
                            {format(date, "EE, MMM d")}
                          </div>
                        );
                      })}
                      <div className="pr-16">Total:</div>
                    </div>
                  </div>
                  {organizedData.projects.map((project, index) => {
                    return (
                      <div
                        key={index}
                        className="bg-white flex border-t justify-between items-center font-sans "
                      >
                        <div className="px-3">
                          <div className="flex items-center">
                            <svg
                              className="bi pt-1 bi-dot"
                              fill="#5C5CFF"
                              height="35"
                              viewBox="0 0 16 16"
                              width="35"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
                            </svg>
                            <span>{project.project}</span>
                          </div>
                        </div>
                        <form>
                          <div className="flex pr-2">
                            {Object.keys(project.tasks).map((taskKey) => {
                              const task = project.tasks[taskKey];
                              const projectId = task.uniqueId;
                              return (
                                <div key={taskKey}>
                                  <div className="flex px-1">
                                    <input
                                      name="task"
                                      ref={inputRef}
                                      defaultValue={`${
                                        task.totalSeconds === 0
                                          ? ""
                                          : formatTime(task.totalSeconds)
                                      }`}
                                      className={`border border-gray-300 ${
                                        task.tasksData.length === 0
                                          ? "w-[80px] px-3"
                                          : "w-[65px] px-1"
                                      }  py-0.5 text-sm`}
                                      onBlur={(e) =>
                                        handleSubmit(
                                          e,
                                          project.project,
                                          task,
                                          convertInputToHHMMSS(e.target.value)
                                        )
                                      }
                                      onKeyDown={(e) =>
                                        handleKeySubmit(
                                          e,
                                          project.project,
                                          task,
                                          convertInputToHHMMSS(e.target.value)
                                        )
                                      }
                                      onChange={handleInputChange}
                                    />
                                    <div className="relative">
                                      {task.tasksData.length === 0 ? (
                                        ""
                                      ) : (
                                        <svg
                                          onClick={() => {
                                            timeSheetProject(projectId);
                                          }}
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="15"
                                          height="18"
                                          fill="currentColor"
                                          className="bi bi-three-dots-vertical border-y-[1.5px] border-r-[1.5px] h-full cursor-pointer"
                                          viewBox="0 0 16 16"
                                        >
                                          <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                                        </svg>
                                      )}
                                      {confirmDelete[projectId] && (
                                        <TimeSheetTask
                                          setConfirmDelete={setConfirmDelete}
                                          task={task}
                                          trackTime={trackTime}
                                          setTrackTime={setTrackTime}
                                          tags={tags}
                                        />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                            <div className="px-1">
                              {formatTime(project.totalWeekSeconds)}
                            </div>
                            <div className="pl-1 pr-3">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="icon icon-tabler icon-tabler-x cursor-pointer"
                                width="22"
                                height="26"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="#000000"
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
                          </div>
                        </form>
                      </div>
                    );
                  })}
                  {projectArray.map((project, index) => {
                    const projectId = project.projectId;
                    console.log(projectId);

                    return (
                      <div
                        key={index}
                        className="bg-white border-t flex justify-between items-center font-sans "
                      >
                        <div className="px-3">
                          <div className="flex items-center">
                            <svg
                              className="bi pt-1 bi-dot"
                              fill="#5C5CFF"
                              height="35"
                              viewBox="0 0 16 16"
                              width="35"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
                            </svg>
                            <div>{project.project}</div>
                          </div>
                        </div>
                        <div className="flex pr-2">
                          {Object.keys(project.tasks).map((taskKey, index) => {
                            const task = project.tasks[taskKey];
                            const taskProject = task.taskProject;

                            return (
                              <div key={index} className="px-1">
                                <input
                                  name="task"
                                  onBlur={(e) => {
                                    handleSubmit(
                                      e,
                                      taskProject,
                                      task,
                                      convertInputToHHMMSS(e.target.value)
                                    );
                                    removeProject(projectId);
                                  }}
                                  onKeyDown={(e) => {
                                    handleKeySubmit(
                                      e,
                                      project.project,
                                      task,
                                      convertInputToHHMMSS(e.target.value),
                                      projectId
                                    );
                                  }}
                                  onChange={handleInputChange}
                                  className="border border-gray-300 w-[80px] px-2 py-0.5 text-sm"
                                />
                              </div>
                            );
                          })}
                          <div className="px-1 text-gray-400">00:00:00</div>
                          <div className="pl-1 pr-3">
                            <svg
                              onClick={() => removeProject(projectId)}
                              xmlns="http://www.w3.org/2000/svg"
                              className="icon icon-tabler icon-tabler-x cursor-pointer"
                              width="22"
                              height="26"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="#000000"
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
                        </div>
                      </div>
                    );
                  })}
                  <div className="bg-white border-t flex justify-between items-center font-sans ">
                    <div className="px-3">
                      <div className="flex items-center">
                        <svg
                          className="bi pt-1 bi-dot"
                          fill="#5C5CFF"
                          height="35"
                          viewBox="0 0 16 16"
                          width="35"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
                        </svg>
                        <div>
                          <Dropdown
                            timeSheetData={timeSheetData}
                            setTimeSheetData={setTimeSheetData}
                            projects={projects}
                            setTasksData={setTasksData}
                            projectArray={projectArray}
                            setProjectArray={setProjectArray}
                            weekArray={weekArray}
                          />
                        </div>
                      </div>
                    </div>
                    <form>
                      <div className="flex pr-2">
                        <div className="px-1 relative group">
                          <input
                            disabled
                            className="border cursor-not-allowed border-gray-200 w-[80px] px-2 py-0.5 text-sm"
                          />
                          <div className="absolute top-0 right-20 w-[200%] hidden group-hover:block text-sm -mt-0.5 rounded alert bg-black text-white px-4 py-1.5">
                            Select project first.
                          </div>
                        </div>
                        <div className="px-1 relative group">
                          <input
                            disabled
                            className="border border-gray-200 cursor-not-allowed w-[80px] px-2 py-0.5 text-sm"
                          />
                          <div className="absolute top-0 right-20 w-[200%] hidden group-hover:block text-sm -mt-0.5 rounded alert bg-black text-white px-4 py-1.5">
                            Select project first.
                          </div>
                        </div>
                        <div className="px-1 relative group">
                          <input
                            disabled
                            className="border border-gray-200 cursor-not-allowed w-[80px] px-2 py-0.5 text-sm"
                          />
                          <div className="absolute top-0 right-20 w-[200%] hidden group-hover:block text-sm -mt-0.5 rounded alert bg-black text-white px-4 py-1.5">
                            Select project first.
                          </div>
                        </div>
                        <div className="px-1 relative group">
                          <input
                            disabled
                            className="border border-gray-200 cursor-not-allowed w-[80px] px-2 py-0.5 text-sm"
                          />
                          <div className="absolute top-0 right-20 w-[200%] hidden group-hover:block text-sm -mt-0.5 rounded alert bg-black text-white px-4 py-1.5">
                            Select project first.
                          </div>
                        </div>
                        <div className="px-1 relative group">
                          <input
                            disabled
                            className="border border-gray-200 cursor-not-allowed w-[80px] px-2 py-0.5 text-sm"
                          />
                          <div className="absolute top-0 right-20 w-[200%] hidden group-hover:block text-sm -mt-0.5 rounded alert bg-black text-white px-4 py-1.5">
                            Select project first.
                          </div>
                        </div>
                        <div className="px-1 relative group">
                          <input
                            disabled
                            className="border border-gray-200 cursor-not-allowed w-[80px] px-2 py-0.5 text-sm"
                          />
                          <div className="absolute top-0 right-20 w-[200%] hidden group-hover:block text-sm -mt-0.5 rounded alert bg-black text-white px-4 py-1.5">
                            Select project first.
                          </div>
                        </div>
                        <div className="px-1 relative group">
                          <input
                            disabled
                            className="border border-gray-200 cursor-not-allowed w-[80px] px-2 py-0.5 text-sm"
                          />
                          <div className="absolute top-0 right-20 w-[200%] hidden group-hover:block text-sm -mt-0.5 rounded alert bg-black text-white px-4 py-1.5">
                            Select project first.
                          </div>
                        </div>
                        <div className="px-1 text-gray-400">00:00:00</div>
                        <div className="pl-1 pr-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="icon icon-tabler icon-tabler-x cursor-pointer"
                            width="22"
                            height="26"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="#000000"
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
                    </form>
                  </div>
                  <div className="flex border-t justify-between items-center py-1.5 w-full bg-gray-200">
                    <div className="text-gray-400 px-6">
                      <div>Total:</div>
                    </div>
                    <div className="flex">
                      {/* Object.keys() */}
                      <div
                        className={`px-[15px] ${
                          !organizedData.WeekDaysTotalSeconds.day1 &&
                          "text-gray-400"
                        }`}
                      >
                        {`${
                          organizedData.WeekDaysTotalSeconds.day1
                            ? formatTime(
                                organizedData.WeekDaysTotalSeconds.day1
                              )
                            : "00:00:00"
                        }`}
                      </div>
                      <div
                        className={`px-[15px] ${
                          !organizedData.WeekDaysTotalSeconds.day2 &&
                          "text-gray-400"
                        }`}
                      >
                        {`${
                          organizedData.WeekDaysTotalSeconds.day2
                            ? formatTime(
                                organizedData.WeekDaysTotalSeconds.day2
                              )
                            : "00:00:00"
                        }`}
                      </div>
                      <div
                        className={`px-[15px] ${
                          !organizedData.WeekDaysTotalSeconds.day3 &&
                          "text-gray-400"
                        }`}
                      >
                        {`${
                          organizedData.WeekDaysTotalSeconds.day3
                            ? formatTime(
                                organizedData.WeekDaysTotalSeconds.day3
                              )
                            : "00:00:00"
                        }`}
                      </div>
                      <div
                        className={`px-[15px] ${
                          !organizedData.WeekDaysTotalSeconds.day4 &&
                          "text-gray-400"
                        }`}
                      >
                        {`${
                          organizedData.WeekDaysTotalSeconds.day4
                            ? formatTime(
                                organizedData.WeekDaysTotalSeconds.day4
                              )
                            : "00:00:00"
                        }`}
                      </div>
                      <div
                        className={`px-[15px] ${
                          !organizedData.WeekDaysTotalSeconds.day5 &&
                          "text-gray-400"
                        }`}
                      >
                        {`${
                          organizedData.WeekDaysTotalSeconds.day5
                            ? formatTime(
                                organizedData.WeekDaysTotalSeconds.day5
                              )
                            : "00:00:00"
                        }`}
                      </div>
                      <div
                        className={`px-[15px] ${
                          !organizedData.WeekDaysTotalSeconds.day6 &&
                          "text-gray-400"
                        }`}
                      >
                        {`${
                          organizedData.WeekDaysTotalSeconds.day6
                            ? formatTime(
                                organizedData.WeekDaysTotalSeconds.day6
                              )
                            : "00:00:00"
                        }`}
                      </div>
                      <div
                        className={`px-[15px] ${
                          !organizedData.WeekDaysTotalSeconds.day7 &&
                          "text-gray-400"
                        }`}
                      >
                        {`${
                          organizedData.WeekDaysTotalSeconds.day7
                            ? formatTime(
                                organizedData.WeekDaysTotalSeconds.day7
                              )
                            : "00:00:00"
                        }`}
                      </div>
                      <div
                        className={`pl-2 pr-12 ${
                          organizedData.WeekTotalSeconds === 0 &&
                          "text-gray-400"
                        }`}
                      >
                        {`${
                          organizedData.WeekTotalSeconds
                            ? formatTime(organizedData.WeekTotalSeconds)
                            : "00:00:00"
                        }`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
