import clientPromise from "../../util/mongodb";
import { EJSON } from "bson";
import Sidebar from "../../components/sidebar";
import { useState, useEffect } from "react";
import Head from "next/head";
import { formatSideTime } from "../../util/commonFunctions";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import ProjectTable from "../../components/projectsTable";
import io from "socket.io-client";

export async function getServerSideProps(ctx) {
  const crypto = require("crypto");
  const userSession = await getServerSession(ctx.req, ctx.res, authOptions);
  console.log("userSession: ", userSession);

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

  function hashString(inputString) {
    const hash = crypto.createHash("sha256"); // You can use other algorithms like 'sha512' as well
    hash.update(inputString);
    return hash.digest("hex"); // 'hex' encoding for hexadecimal output
  }

  return {
    props: {
      tasks: userTasks,
      projects: userProjects,
      userId: hashString(userSession.user.email),
    },
  };
}

export default function Timesheet({ tasks, projects, userId }) {
  const [counter, setCounter] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    const storeSidebarValue = localStorage.getItem("showSidebar");
    if (storeSidebarValue !== null) {
      setShowSidebar(storeSidebarValue === "true");
    } else {
      localStorage.setItem("showSidebar", "false");
    }
  }, []);

  // console.log("projects: ", projects)

  // const [projectName, setProjectName] = useState({ value: "" })
  // const projectSum = [];

  // function sumTimeForProject(project, tasks) {
  //     let projectTime = 0;
  //     tasks.forEach(task => {
  //         if (task.project === project) {
  //             projectTime += task.seconds;
  //             if (task.parentTaskId) {
  //                 projectTime += sumTimeForTask(task, tasks);
  //             }
  //         }
  //     });
  //     return projectTime;
  // }

  // function sumTimeForTask(task, tasks) {
  //     let taskTime = 0;
  //     tasks.forEach(subtask => {
  //         if (subtask.parentTaskId === task._id.$oid) {
  //             taskTime += subtask.seconds;
  //             taskTime += sumTimeForTask(subtask, tasks);
  //         }
  //     });
  //     return taskTime;
  // }

  // console.log(projects)

  // tasks.forEach(task => {
  //     var project = projects.filter((project) => task.project == project.project)[0];
  //     var checkProject = projectSum.filter((sumProject) => sumProject.id == task.project);
  //     if (!checkProject.length) {
  //         projectSum.push({
  //             id: project.project,
  //             name: project.project,
  //             sum: sumTimeForProject(task.project, tasks)
  //         });
  //     }
  // });

  // function handleChange(e) {
  //     const value = e.target.value;
  //     setProjectName((prevItem) => {
  //         return {
  //             ...prevItem,
  //             value: value,
  //         }
  //     })

  // }

  // async function handleSubmit(e) {
  //     e.preventDefault()
  //     const result = await axios.post('/api/addProject', { projectName })
  //     setProjectName({ value: '' });
  // }

  useEffect(() => {
    const socket = io("https://backend-timer-for-clockify-clone.onrender.com", {
      // const socket = io("http://localhost:8080", {
      transports: ["websocket"],
    });

    socket.on("counter-update", (counter) => {
      if (userId in counter) {
        const userCounter = counter[userId];
        document.getElementById("title1").innerText = `${formatSideTime(
          userCounter
        )} Projects`;
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  return (
    <>
      <Head>
        <link rel="icon" href="/icons8-clock-16.png" />
        <title id="title1">Task Manager</title>
      </Head>
      <div>
        <Sidebar
          counter={counter}
          setCounter={setCounter}
          userId={userId}
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
        />
        <main
          className={`sticky top-0 z-0 ease-in-out duration-300 ${
            showSidebar ? "md:ml-16" : "md:ml-52"
          }  pt-14 h-screen bg-gray-50 overflow-auto`}
        >
          <div className="px-6 py-8">
            <div className="mt-8 max-w-4x1 mx-auto">
              <ProjectTable projects={projects} />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
