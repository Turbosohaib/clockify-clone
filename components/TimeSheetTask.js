import { format } from "date-fns";
import { formatRecordTime, formatTime } from "../util/commonFunctions";
import TimeSheetTags from "./TimeSheetTags";
import { useState } from "react";

export default function TimeSheetTask({
  setConfirmDelete,
  task,
  trackTime,
  setTrackTime,
  tags,
}) {
  const [isChecked, setIsChecked] = useState(task.tasksData[0].billable);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity z-10 ">
      <div
        // onSubmit={handleSubmit}
        className="transition ease-in-out shadow drop-shadow-lg rounded bg-white absolute top-1/2 m-auto inset-x-0 -translate-y-1/2 w-[40%]"
      >
        <div className="flex justify-between px-5 py-4 border-b border-gray-300 items-center w-full">
          <div>
            <h1 className="text-2xl text-gray-500">Edit time</h1>
          </div>
          <svg
            onClick={() => setConfirmDelete(false)}
            xmlns="http://www.w3.org/2000/svg"
            className="icon icon-tabler icon-tabler-x cursor-pointer"
            width="25"
            height="44"
            opacity="0.5"
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
        <div className="border-b border-gray-300 mx-5 py-2">
          <div className="text-sm py-2 text-gray-400">
            {task ? format(task.tasksData[0].createdOn, "dd/MM/yyyy") : ""}
          </div>
          <div className="py-2">
            {task.tasksData.length === 1 ? task.tasksData[0].project : ""}
          </div>
        </div>
        <div className="flex items-center border-b border-gray-300 mx-5 py-4">
          <div className={`${task.tasksData.length > 1 ? "px-48" : "px-4"} `}>
            <input
              name="seconds"
              defaultValue={`${
                task.tasksData.length > 1
                  ? formatTime(task.totalSeconds)
                  : formatTime(task.tasksData[0].seconds)
              }`}
              className="text-center font-medium text-bold border border-gray-400 text-gray-900 lg:text-lg text-sm block w-[100px] lg:h-[35px]"
            />
          </div>
          <div
            className={`flex w-[100%] px-4 py-[3px] ${
              task.tasksData.length > 1 ? "hidden" : ""
            }`}
          >
            <input
              type="text"
              id="start-time"
              name="start-time"
              defaultValue={formatRecordTime(
                task.tasksData[0].startTime,
                "hh:mm"
              )}
              // onChange={(e) => setStartTime(e.target.value)}
              className="px-3 py-1 border border-gray-400 text-gray-900 text-md block w-[65px]"
              placeholder="00:00"
              // onBlur={setOnClickEnter}
              required
            />
            <span className="py-1 px-1"> - </span>
            <input
              type="text"
              id="stop-time"
              name="stop-time"
              defaultValue={formatRecordTime(task.tasksData[0].stopTime)}
              // onChange={(e) => setStopTime(e.target.value)}
              className="px-3 py-1 border border-gray-400 text-gray-900 text-sm block w-[65px]"
              placeholder="00:00"
              // onBlur={setOnClickEnter}
              required
            />
          </div>
        </div>
        <div className="border-b border-gray-300">
          <div className="flex justify-between py-4 px-5 w-full">
            <div className="pt-2">Description</div>
            <textarea
              id="story"
              defaultValue={task.tasksData[0].taskName}
              name="taskName"
              className="px-2 border border-gray-300"
              rows="3"
              cols="33"
            ></textarea>
          </div>
          <div className="flex justify-between items-center px-5">
            <div>Tags</div>
            <div className="relative flex justify-between items-center hover:bg-gray-100 cursor-pointer px-3 py-2 border border-gray-200 w-[59%]">
              <TimeSheetTags
                trackTime={trackTime}
                setTrackTime={setTrackTime}
                tags={tags}
              />
            </div>
          </div>
          <div className="flex justify-between items-center py-6 px-5">
            <div>Billable</div>
            <div className="flex items-center pr-[46%]">
              <div className="pt-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    value=""
                    className="sr-only peer"
                    checked={isChecked}
                    onChange={handleCheckboxChange}
                  />
                  <div
                    className={`w-8 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer ${
                      isChecked
                        ? "peer-checked:after:translate-x-full peer-checked:after:border-white"
                        : ""
                    } after:content-[''] after:absolute after:top-[3px] after:left-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[15px] after:w-[15px] after:transition-all dark:border-gray-600 peer-checked:bg-blue-600`}
                  ></div>
                  <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                    {isChecked ? "Yes" : "No"}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between w-full px-3 py-5">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              fill="currentColor"
              className="bi bi-three-dots-vertical cursor-pointer"
              viewBox="0 0 16 16"
            >
              <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
            </svg>
          </div>
          <div className="px-4 flex w-fit items-center">
            <div
              onClick={() => {
                setConfirmDelete(false);
              }}
              className="px-6 text-blue-400 cursor-pointer hover:underline"
            >
              Cancel
            </div>
            <div className="text-white bg-blue-400 hover:bg-blue-500 cursor-pointer focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
              SAVE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
