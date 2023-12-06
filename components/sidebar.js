import { formatTime } from "../util/commonFunctions";
import Link from "next/link";
import { useState, useEffect } from "react";
import io from "socket.io-client";
import SidePointer from "./sidebarPointer";

function Sidebar({
  startTimer,
  trackTime,
  counter,
  setCounter,
  userId,
  showSidebar,
  setShowSidebar,
  confirmDelete,
}) {
  const [activeLink, setActiveLink] = useState(""); // State to track the active link
  const [openSideBar, setOpenSideBar] = useState(false);

  useEffect(() => {
    // Get the current pathname from the URL
    const currentPath = window.location.pathname;
    setActiveLink(currentPath);
  }, [activeLink]);

  useEffect(() => {
    const socket = io("https://backend-timer-for-clockify-clone.onrender.com", {
      // const socket = io("http://localhost:8080", {
      // uncomment this if testing on local
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

  return (
    <div className="relative bg-gray-50 overflow-hidden w-full">
      <div
        className={`fixed flex justify-between items-center ${
          confirmDelete ? "" : "z-10"
        }  w-full rounded-t bg-white px-2 py-2 border-l-4 border-b border-gray-300`}
      >
        <div className="flex">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            onClick={() => {
              const newShowSidebar = !showSidebar;
              setShowSidebar(newShowSidebar);
              localStorage.setItem("showSidebar", newShowSidebar.toString());
            }}
            className="px-3 mt-[4px] cursor-pointer md:block hidden"
            height="20px"
            viewBox="0 0 448 512"
            opacity="0.5"
          >
            <path d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z" />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            onClick={() => {
              setOpenSideBar(!openSideBar);
              console.log(openSideBar);
            }}
            className="px-3 mt-[4px] cursor-pointer md:hidden block"
            height="20px"
            viewBox="0 0 448 512"
            opacity="0.5"
          >
            <path d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z" />
          </svg>
          <div className="text-xl font-semibold text-blue-600/75 cursor-pointer">
            Task Manager
          </div>
        </div>
        <div className="flex">
          <div className="border-x border-dashed py-2 top-0 right-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="22px"
              className="px-4 cursor-pointer"
              viewBox="0 0 448 512"
            >
              <path d="M224 0c-17.7 0-32 14.3-32 32V49.9C119.5 61.4 64 124.2 64 200v33.4c0 45.4-15.5 89.5-43.8 124.9L5.3 377c-5.8 7.2-6.9 17.1-2.9 25.4S14.8 416 24 416H424c9.2 0 17.6-5.3 21.6-13.6s2.9-18.2-2.9-25.4l-14.9-18.6C399.5 322.9 384 278.8 384 233.4V200c0-75.8-55.5-138.6-128-150.1V32c0-17.7-14.3-32-32-32zm0 96h8c57.4 0 104 46.6 104 104v33.4c0 47.9 13.9 94.6 39.7 134.6H72.3C98.1 328 112 281.3 112 233.4V200c0-57.4 46.6-104 104-104h8zm64 352H224 160c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7s18.7-28.3 18.7-45.3z" />
            </svg>
          </div>
          <div className="px-4">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="cursor-pointer"
            >
              <path
                d="M19.0745 20.4061C18.9178 20.2645 18.7451 20.1416 18.56 20.04L15.27 18.25C14.9008 18.0204 14.5925 17.705 14.3714 17.3307C14.1503 16.9564 14.0229 16.5342 14 16.1V15.73C14.0279 15.7041 14.058 15.6806 14.09 15.66C14.6894 15.1894 15.1731 14.5879 15.5042 13.9015C15.8352 13.2151 16.0048 12.462 16 11.7V8.63C15.9948 8.12288 15.8849 7.6223 15.6771 7.15966C15.4694 6.69701 15.1683 6.28228 14.7927 5.94146C14.4172 5.60065 13.9752 5.3411 13.4947 5.17909C13.0141 5.01708 12.5052 4.95611 12 5C11.4947 4.95611 10.9859 5.01708 10.5053 5.17909C10.0247 5.3411 9.58282 5.60065 9.20726 5.94146C8.8317 6.28228 8.53061 6.69701 8.32287 7.15966C8.11512 7.6223 8.0052 8.12288 7.99999 8.63V11.7C7.99514 12.462 8.16473 13.2151 8.49579 13.9015C8.82686 14.5879 9.3106 15.1894 9.90999 15.66C9.942 15.6806 9.97211 15.7041 9.99999 15.73V16.1C9.9771 16.5342 9.84968 16.9564 9.62856 17.3307C9.40745 17.705 9.09918 18.0204 8.72999 18.25L5.43999 20.04C5.25483 20.1416 5.08216 20.2645 4.92547 20.4061C3.19718 18.9545 1.95722 17.0065 1.37382 14.8262C0.790408 12.6459 0.89179 10.3389 1.66421 8.21824C2.43663 6.09754 3.84269 4.26577 5.69166 2.97143C7.54062 1.67708 9.74298 0.982819 12 0.982819C14.257 0.982819 16.4593 1.67708 18.3083 2.97143C20.1572 4.26577 21.5633 6.09754 22.3357 8.21824C23.1081 10.3389 23.2095 12.6459 22.6261 14.8262C22.0427 17.0065 20.8028 18.9545 19.0745 20.4061L19.0745 20.4061Z"
                fill="#CCF0EC"
              />
              <path
                d="M19.08 20.41C18.85 20.6 18.61 20.79 18.37 20.97C18.3 21.02 18.23 21.07 18.15 21.12C17.95 21.25 17.75 21.38 17.55 21.5C17.2786 21.6624 16.9981 21.8093 16.71 21.94C16.4471 22.0695 16.1766 22.1831 15.9 22.28C15.5253 22.4287 15.1411 22.5523 14.75 22.65C14.61 22.69 14.47 22.7199 14.33 22.75C14.1 22.8 13.88 22.84 13.65 22.87C13.478 22.9025 13.3045 22.9258 13.13 22.94C12.99 22.96 12.85 22.97 12.71 22.98C12.47 22.99 12.24 23 12 23C11.76 23 11.53 22.99 11.29 22.98C11.15 22.97 11.01 22.96 10.87 22.94C10.6956 22.9258 10.522 22.9025 10.35 22.87C10.12 22.84 9.90001 22.8 9.67001 22.75C9.53001 22.72 9.39001 22.69 9.25001 22.65C8.85889 22.5523 8.4747 22.4287 8.10001 22.28C7.82342 22.1831 7.55292 22.0695 7.29001 21.94C7.00192 21.8093 6.72147 21.6624 6.45001 21.5C6.25001 21.38 6.05001 21.25 5.85001 21.12C5.77001 21.07 5.70001 21.02 5.63001 20.97C5.39001 20.79 5.15001 20.6 4.92001 20.41C5.07829 20.2668 5.25281 20.1426 5.44001 20.04L8.73001 18.25C9.0992 18.0204 9.40747 17.705 9.62859 17.3307C9.8497 16.9563 9.97713 16.5341 10 16.1V15.73C9.97214 15.704 9.94202 15.6806 9.91001 15.66C9.31062 15.1894 8.82688 14.5879 8.49582 13.9015C8.16475 13.2151 7.99516 12.462 8.00001 11.7V8.62999C8.00522 8.12287 8.11514 7.62229 8.32289 7.15965C8.53064 6.697 8.83173 6.28227 9.20728 5.94145C9.58284 5.60064 10.0248 5.34109 10.5053 5.17908C10.9859 5.01707 11.4948 4.9561 12 4.99999C12.5053 4.9561 13.0141 5.01707 13.4947 5.17908C13.9753 5.34109 14.4172 5.60064 14.7927 5.94145C15.1683 6.28227 15.4694 6.697 15.6771 7.15965C15.8849 7.62229 15.9948 8.12287 16 8.62999V11.7C16.0049 12.462 15.8353 13.2151 15.5042 13.9015C15.1731 14.5879 14.6894 15.1894 14.09 15.66C14.058 15.6806 14.0279 15.704 14 15.73V16.1C14.0229 16.5341 14.1503 16.9563 14.3714 17.3307C14.5926 17.705 14.9008 18.0204 15.27 18.25L18.56 20.04C18.7472 20.1426 18.9217 20.2668 19.08 20.41V20.41Z"
                fill="#00C8AF"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="md:hidden block">
        <div
          className={`${
            openSideBar
              ? "fixed inset-0 bg-black bg-opacity-75 transition-opacity z-20 "
              : ""
          } `}
        >
          <div
            className={`fixed inset-y-0 left-0 bg-white shadow-md max-h-screen  ease-in-out duration-300 ${
              openSideBar ? "w-[190px]" : "w-0"
            }  `}
          >
            <div
              className={`flex flex-col  justify-between h-full border-l-4 border-blue-400 rounded-l ${
                openSideBar ? "" : "hidden"
              }`}
            >
              <div className="flex-grow">
                <div className="flex items-center px-4 py-6 text-center border-b">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    onClick={() => setOpenSideBar(!openSideBar)}
                    className="px-3 mt-[4px] cursor-pointer"
                    height="20px"
                    viewBox="0 0 448 512"
                    opacity="0.5"
                  >
                    <path d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z" />
                  </svg>
                  <h1 className="text-md font-semibold leading-none">
                    <span className="text-blue-600/75">Task Manager</span>
                  </h1>
                </div>
                <div className="p-4">
                  <ul className="space-y-1">
                    <li>
                      <Link
                        href="/"
                        id="sideBarTracker"
                        className="flex bg-gray-100 items-center hover:bg-yellow-50 rounded-xl uppercase  text-md text-slate-600 py-3 px-4"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-6 h-6 mr-2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p>Time Tracker</p>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/dashboard/timesheet"
                        className="flex bg-gray-100 hover:bg-yellow-50 rounded-xl uppercase  text-md text-slate-600 py-3 px-4"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="1em"
                          height="1em"
                          fill="currentColor"
                          className="text-lg mr-4"
                          viewBox="0 0 16 16"
                        >
                          <path d="M12 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zM5 4h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1zm-.5 2.5A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zM5 8h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1zm0 2h3a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1z" />
                        </svg>
                        timesheet
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/dashboard/projects"
                        className="flex bg-gray-100 hover:bg-yellow-50 rounded-xl uppercase  text-md text-slate-600 py-3 px-4"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="1em"
                          height="1em"
                          fill="currentColor"
                          className="text-lg mr-4"
                          viewBox="0 0 16 16"
                        >
                          <path d="M9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.825a2 2 0 0 1-1.991-1.819l-.637-7a1.99 1.99 0 0 1 .342-1.31L.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3zm-8.322.12C1.72 3.042 1.95 3 2.19 3h5.396l-.707-.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139z" />
                        </svg>
                        Projects
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="flex bg-gray-100 hover:bg-yellow-50 rounded-xl uppercase  text-md text-slate-600 py-3 px-4"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="text-lg mr-4"
                          viewBox="0 0 16 16"
                        >
                          <path d="M2 1a1 1 0 0 0-1 1v4.586a1 1 0 0 0 .293.707l7 7a1 1 0 0 0 1.414 0l4.586-4.586a1 1 0 0 0 0-1.414l-7-7A1 1 0 0 0 6.586 1H2zm4 3.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                        </svg>
                        Tags
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="p-4">
                <Link
                  href="/api/auth/signout"
                  className="inline-flex items-center justify-center h-9 px-4 rounded-xl bg-gray-900 text-gray-300 hover:text-white text-sm font-semibold transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    fill="currentColor"
                    className=""
                    viewBox="0 0 16 16"
                  >
                    <path d="M12 1a1 1 0 0 1 1 1v13h1.5a.5.5 0 0 1 0 1h-13a.5.5 0 0 1 0-1H3V2a1 1 0 0 1 1-1h8zm-2 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
                  </svg>
                </Link>{" "}
                <span className="font-bold text-sm ml-2">Logout</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="md:block hidden w-full">
        <div
          className={`fixed inset-y-0 left-0 bg-white max-h-screen border-l-4 border-r border-gray-300 ease-in-out duration-300 ${
            showSidebar ? "w-16" : "w-52"
          }`}
        >
          <div className="flex flex-col justify-between">
            <div className="relative flex-grow">
              <div className="mt-2  px-4 py-4">
                <p
                  className={`leading-none text-sm text-gray-500 uppercase px-4 ease-in-out duration-300 ${
                    showSidebar ? "" : "pt-14"
                  } `}
                >
                  Analyze
                </p>
              </div>
              <div className={`${showSidebar ? "p-2" : ""}`}>
                <ul>
                  <li>
                    <Link
                      href="#"
                      className={`${
                        activeLink === "#" ? "bg-gray-200" : ""
                      } py-4  flex relative uppercase  text-md text-slate-600 py-3 ${
                        showSidebar ? "pl-2.5" : "pl-4"
                      } group overflow-hidden`}
                    >
                      <span className="flex justify-between w-full items-center relative z-10">
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            id="dashboard"
                            width="30"
                            height="30"
                          >
                            <rect
                              width="151"
                              height="151"
                              x="73"
                              y="73"
                              fill="none"
                              stroke="#000"
                              strokeLinecap="round"
                              stroke-linejoin="round"
                              stroke-width="16"
                              rx="33.03"
                              ry="33.03"
                            ></rect>
                            <rect
                              width="151"
                              height="151"
                              x="288"
                              y="73"
                              fill="none"
                              stroke="#000"
                              strokeLinecap="round"
                              stroke-linejoin="round"
                              stroke-width="16"
                              rx="33.03"
                              ry="33.03"
                            ></rect>
                            <rect
                              width="151"
                              height="151"
                              x="73"
                              y="288"
                              fill="none"
                              stroke="#000"
                              strokeLinecap="round"
                              stroke-linejoin="round"
                              stroke-width="16"
                              rx="33.03"
                              ry="33.03"
                            ></rect>
                            <rect
                              width="151"
                              height="151"
                              x="288"
                              y="288"
                              fill="none"
                              stroke="#000"
                              strokeLinecap="round"
                              stroke-linejoin="round"
                              stroke-width="16"
                              rx="33.03"
                              ry="33.03"
                            ></rect>
                          </svg>
                          <p
                            className={`px-2 relative z-10 ${
                              showSidebar
                                ? "transition-transform duration-400 translate-x-8"
                                : "transition-transform duration-400"
                            }`}
                          >
                            dashboard
                          </p>
                        </div>
                        <div className="hidden group-hover:block">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 256 256"
                          >
                            <rect width="256" height="256" fill="none" />
                            <circle cx="92" cy="60" r="16" />
                            <circle cx="164" cy="60" r="16" />
                            <circle cx="92" cy="128" r="16" />
                            <circle cx="164" cy="128" r="16" />
                            <circle cx="92" cy="196" r="16" />
                            <circle cx="164" cy="196" r="16" />
                          </svg>
                        </div>
                      </span>
                      <span className="absolute inset-0 bg-gray-200 transition-transform duration-200 transform -translate-x-full group-hover:translate-x-0"></span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      id="sideBarTracker"
                      href="/"
                      className={`${
                        activeLink === "/dashboard" ? "bg-gray-200" : ""
                      } py-4 flex relative uppercase  text-md text-slate-600 py-3 ${
                        showSidebar ? "pl-2.5" : "pl-4"
                      } group overflow-hidden`}
                    >
                      <span className="flex justify-between items-center w-full relative z-10">
                        <div className="flex">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-7 h-7"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <div
                            className={`px-2 w-fit relative z-10 ${
                              showSidebar
                                ? "transition-transform duration-400 translate-x-4"
                                : "transition-transform duration-400"
                            }`}
                          >
                            {counter ? (
                              formatTime(counter)
                            ) : (
                              <div className="flex">
                                <div>Time</div> <div>Tracker</div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="hidden group-hover:block">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 256 256"
                          >
                            <rect width="256" height="256" fill="none" />
                            <circle cx="92" cy="60" r="16" />
                            <circle cx="164" cy="60" r="16" />
                            <circle cx="92" cy="128" r="16" />
                            <circle cx="164" cy="128" r="16" />
                            <circle cx="92" cy="196" r="16" />
                            <circle cx="164" cy="196" r="16" />
                          </svg>
                        </div>
                      </span>
                      <span className="absolute inset-0 bg-gray-200 transition-transform duration-200 transform -translate-x-full group-hover:translate-x-0"></span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard/timesheet"
                      className={`${
                        activeLink === "/dashboard/timesheet"
                          ? "bg-gray-200"
                          : ""
                      } py-4  flex relative uppercase  text-md text-slate-600 py-3 ${
                        showSidebar ? "pl-2.5" : "pl-4"
                      } group overflow-hidden`}
                    >
                      <span className="flex justify-between w-full items-center relative z-10">
                        <div className="flex">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="1em"
                            height="1em"
                            fill="currentColor"
                            className="w-6 h-6"
                            viewBox="0 0 16 16"
                          >
                            <path d="M12 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zM5 4h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1zm-.5 2.5A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zM5 8h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1zm0 2h3a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1z" />
                          </svg>{" "}
                          <p
                            className={`px-2 relative z-10 ${
                              showSidebar
                                ? "transition-transform duration-400 translate-x-4"
                                : "transition-transform duration-400"
                            }`}
                          >
                            timesheet
                          </p>
                        </div>
                        <div className="hidden group-hover:block">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 256 256"
                          >
                            <rect width="256" height="256" fill="none" />
                            <circle cx="92" cy="60" r="16" />
                            <circle cx="164" cy="60" r="16" />
                            <circle cx="92" cy="128" r="16" />
                            <circle cx="164" cy="128" r="16" />
                            <circle cx="92" cy="196" r="16" />
                            <circle cx="164" cy="196" r="16" />
                          </svg>
                        </div>
                      </span>
                      <span className="absolute inset-0 bg-gray-200 transition-transform duration-200 transform -translate-x-full group-hover:translate-x-0"></span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard/projects"
                      className={`${
                        activeLink === "/dashboard/projects"
                          ? "bg-gray-200"
                          : ""
                      } py-4 flex relative uppercase  text-md text-slate-600 py-3 ${
                        showSidebar ? "pl-2.5" : "pl-4"
                      } group overflow-hidden`}
                    >
                      <span className="flex justify-between w-full items-center relative z-10">
                        <div className="flex">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="1em"
                            height="1em"
                            fill="currentColor"
                            className="w-6 h-6"
                            viewBox="0 0 16 16"
                          >
                            <path d="M9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.825a2 2 0 0 1-1.991-1.819l-.637-7a1.99 1.99 0 0 1 .342-1.31L.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3zm-8.322.12C1.72 3.042 1.95 3 2.19 3h5.396l-.707-.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139z" />
                          </svg>
                          <span
                            className={`px-2 relative z-10 ${
                              showSidebar
                                ? "transition-transform duration-400 translate-x-4"
                                : "transition-transform duration-400"
                            }`}
                          >
                            Projects
                          </span>
                        </div>
                        <div className="hidden group-hover:block">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 256 256"
                          >
                            <rect width="256" height="256" fill="none" />
                            <circle cx="92" cy="60" r="16" />
                            <circle cx="164" cy="60" r="16" />
                            <circle cx="92" cy="128" r="16" />
                            <circle cx="164" cy="128" r="16" />
                            <circle cx="92" cy="196" r="16" />
                            <circle cx="164" cy="196" r="16" />
                          </svg>
                        </div>
                      </span>
                      <span className="absolute inset-0 bg-gray-200 transition-transform duration-200 transform -translate-x-full group-hover:translate-x-0"></span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="p-4 absolute bottom-0">
              <Link
                href="/api/auth/signout"
                className={`inline-flex items-center justify-center h-9 ${
                  showSidebar ? "px-2.5" : "px-4"
                } rounded-xl bg-gray-900 text-gray-300 hover:text-white uppercase  text-md font-semibold transition`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1em"
                  height="1em"
                  fill="currentColor"
                  className=""
                  viewBox="0 0 16 16"
                >
                  <path d="M12 1a1 1 0 0 1 1 1v13h1.5a.5.5 0 0 1 0 1h-13a.5.5 0 0 1 0-1H3V2a1 1 0 0 1 1-1h8zm-2 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
                </svg>
              </Link>{" "}
              <span
                className={`font-bold text-sm ml-2 ${
                  showSidebar ? "hidden" : ""
                }`}
              >
                Logout
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
