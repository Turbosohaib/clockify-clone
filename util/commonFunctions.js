export function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const hoursStr = hours.toString().padStart(2, "0");
  const minutesStr = minutes.toString().padStart(2, "0");
  const secondsStr = remainingSeconds.toString().padStart(2, "0");

  return `${hoursStr}:${minutesStr}:${secondsStr}`;
}

export function formatRecordTime(t) {
  const dateObj = new Date(t);

  const hours = dateObj.getHours().toString().padStart(2, "0");
  const minutes = dateObj.getMinutes().toString().padStart(2, "0");

  return `${hours}:${minutes}`;
}

export function calculateTotalSeconds(tasks) {
  const parentTasks = tasks.filter((task) => !task.parentTaskId);
  const updatedTasks = [];

  for (const parentTask of parentTasks) {
    const children = tasks.filter(
      (task) => task.parentTaskId === parentTask._id.$oid
    );
    let totalSeconds = parentTask.seconds || 0;

    for (const child of children) {
      totalSeconds += child.seconds || 0;
    }

    parentTask.totalSeconds = totalSeconds;
    parentTask.totalCount = 1 + children.length;

    // Create a new array that contains the parent task and its children
    const taskGroup = [parentTask, ...children];
    updatedTasks.push(...taskGroup);
  }

  return updatedTasks;
}

export function unhideCurrentActiveParentChilds() {
  var parent = document.querySelectorAll(".visible");
  for (var i = 0; i < parent.length; i++) {
    var children = parent[i].querySelectorAll(".child");
    for (var j = 0; j < children.length; j++) {
      console.log(children[j].className);
      if (children[j].className.includes("hidden")) {
        children[j].classList.remove("hidden");
      }
    }
  }
}

export function renderDate(timestamp = null) {
  if (timestamp) {
    return new Date(timestamp).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } else {
    return new Date().toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
}

export function formatTimestamp(timestamp) {
  var months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  var date = new Date(timestamp);

  var day = date.getDate();
  var month = months[date.getMonth()]; // Get month name
  var year = date.getFullYear();

  // Pad day with leading zero if needed
  day = day < 10 ? "0" + day : day;

  return day + "/" + month + "/" + year;
}

export function extractDateInSeconds(timestamp) {
  const dateObject = new Date(timestamp);
  const timestampInSeconds = Math.floor(dateObject.getTime() / 1000);

  return timestampInSeconds;
}

export function getHourlyRateStatus(hourlyRate) {
  if (
    hourlyRate.date_from <= currentDate &&
    (!hourlyRate.date_to || hourlyRate.date_to >= currentDate)
  ) {
    return "activeRate";
  } else if (hourlyRate.date_from < currentDate) {
    return "pastRate";
  } else {
    return "futureRate";
  }
}

export function convertTimeStringToSeconds(timeString) {
  const timeParts = timeString.split(":");

  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);
  const seconds = parseInt(timeParts[2], 10);

  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  return totalSeconds;
}

export function formatSideTime(timeInSeconds) {
  if (timeInSeconds < 60) {
    return `${timeInSeconds} sec`;
  } else if (timeInSeconds < 3600) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")} min `;
  } else {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
}

export function getWeeklyTasks(tasks) {
  // Get the current date
  const currentDate = new Date();

  // Calculate the start of the current week (assuming Sunday is the start of the week)
  const startOfCurrentWeek = new Date(currentDate);
  startOfCurrentWeek.setDate(currentDate.getDate() - currentDate.getDay());

  // Calculate the end of the current week (assuming Saturday is the end of the week)
  const endOfCurrentWeek = new Date(currentDate);
  endOfCurrentWeek.setDate(currentDate.getDate() + (6 - currentDate.getDay()));

  // Filter the objects based on their dates
  const objectsInCurrentWeek = tasks.filter((task) => {
    const objectDate = new Date(task.createdOn);
    return objectDate >= startOfCurrentWeek && objectDate <= endOfCurrentWeek;
  });

  return objectsInCurrentWeek;
}

// Function to group tasks by weeks and calculate week totals
export function groupTasksByWeeksAndCalculateTotals(tasksData) {
  const groupedTasks = {};
  for (const task of tasksData) {
    const taskDate = new Date(task.createdOn);
    // Calculate the start of the week (Sunday) for the task
    const weekStartDate = new Date(taskDate);
    // console.log("first weekStartDate: ", weekStartDate)
    weekStartDate.setDate(taskDate.getDate() - taskDate.getDay());
    // console.log("Task getDay: ", taskDate.getDay())
    // console.log("weekStartDate: ", weekStartDate)
    // Convert the week start date to a string for the key
    const weekKey = weekStartDate.toDateString();
    if (!groupedTasks[weekKey]) {
      groupedTasks[weekKey] = {
        tasks: [],
        weekTotal: 0,
      };
    }
    groupedTasks[weekKey].tasks.push(task);
    groupedTasks[weekKey].weekTotal += task.seconds;
  }
  return groupedTasks;
}

export function removeObjectsFromArraySlowly(arr, delay) {
  return new Promise((resolve) => {
    let index = 0;

    function removeNextObject() {
      if (index < arr.length) {
        setTimeout(() => {
          arr.splice(index, 1); // Remove the object at the current index
          console.log(`Removed object at index ${index}:`, arr);
          index++;
          removeNextObject(); // Continue with the next object
        }, delay);
      } else {
        resolve(arr); // Resolve the promise when all objects are removed
      }
    }

    removeNextObject();
  });
}

export function formatDateToCustomFormat(dateString) {
  const dateObject = new Date(dateString);
  const options = {
    weekday: "short",
    month: "short",
    day: "numeric",
  };
  const formattedDate = dateObject.toLocaleDateString("en-US", options);
  return formattedDate;
}

export function convertInputToHHMMSS(input) {
  const decimalHoursMatch = /^(\d+(\.\d+)?)$/;
  const hoursMinutesSecondsMatch = /^(\d+h)? ?(\d+m)? ?(\d+s)?$/;
  const timeDigitsMatch = /^(\d{1,2})(\d{2})(\d{2})?$/;
  const timeColonMatch = /^(\d{2}):(\d{2})(?::(\d{2}))?$/;
  const minutesMatch = /^(\d+)$/;

  if (timeDigitsMatch.test(input)) {
    // Format 3: "0330" or "033030"
    const [, hours, minutes, seconds] = input.match(/(\d{1,2})(\d{2})(\d{2})?/);
    return `${(hours || "00").toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${(seconds || "00").toString().padStart(2, "0")}`;
  } else if (minutesMatch.test(input)) {
    const minutes = parseInt(input);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${remainingMinutes
      .toString()
      .padStart(2, "0")}:00`;
  } else if (decimalHoursMatch.test(input)) {
    // Format 1: "3.5" or "3"
    const decimalHours = parseFloat(input);
    const hours = Math.floor(decimalHours);
    const remainingMinutes = (decimalHours - hours) * 60;
    const minutes = Math.floor(remainingMinutes);
    const seconds = Math.floor((remainingMinutes - minutes) * 60);
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  } else if (hoursMinutesSecondsMatch.test(input)) {
    // Format 2: "3h", "3h 30m", "3h30m", "3h 30m 10s", "3h30m10s"
    const parts = input.match(/(\d+h)? ?(\d+m)? ?(\d+s)?/);
    const hours = parseInt(parts[1]) || 0;
    const minutes = parseInt(parts[2]) || 0;
    const seconds = parseInt(parts[3]) || 0;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  } else if (timeColonMatch.test(input)) {
    // Format 4: "03:30" or "03:30:05"
    const [, hours, minutes, seconds] = input.match(
      /(\d{2}):(\d{2})(?::(\d{2}))?/
    );
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${(seconds || "00").toString().padStart(2, "0")}`;
  }
  return "Invalid Input";
}

export function generateWeekArray(date) {
  const { startDate, endDate } = date;
  const weekArray = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    weekArray.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return weekArray;
}

export function organizeTasks(tasks, weekArray) {
  const organizedData = {
    projects: [],
    WeekTotalSeconds: 0,
    WeekDaysTotalSeconds: {},
  };

  const projectMap = new Map();

  // Generate a unique ID for each project
  let projectIdCounter = 1;

  for (const task of tasks) {
    const projectName = task.project;

    if (!projectMap.has(projectName)) {
      const projectId = `project_${projectIdCounter++}`;
      projectMap.set(projectName, {
        project: projectName,
        projectId, // Add a unique ID to the project
        tasks: {
          day1: {
            totalSeconds: 0,
            tasksData: [],
            uniqueId: `day1_${projectId}`, // Add a unique ID for day1 tasks
            date: weekArray[0],
          },
          day2: {
            totalSeconds: 0,
            tasksData: [],
            uniqueId: `day2_${projectId}`, // Add a unique ID for day2 tasks
            date: weekArray[1],
          },
          day3: {
            totalSeconds: 0,
            tasksData: [],
            uniqueId: `day3_${projectId}`, // Add a unique ID for day3 tasks
            date: weekArray[2],
          },
          day4: {
            totalSeconds: 0,
            tasksData: [],
            uniqueId: `day4_${projectId}`, // Add a unique ID for day4 tasks
            date: weekArray[3],
          },
          day5: {
            totalSeconds: 0,
            tasksData: [],
            uniqueId: `day5_${projectId}`, // Add a unique ID for day5 tasks
            date: weekArray[4],
          },
          day6: {
            totalSeconds: 0,
            tasksData: [],
            uniqueId: `day6_${projectId}`, // Add a unique ID for day6 tasks
            date: weekArray[5],
          },
          day7: {
            totalSeconds: 0,
            tasksData: [],
            uniqueId: `day7_${projectId}`, // Add a unique ID for day7 tasks
            date: weekArray[6],
          },
        },
        totalWeekSeconds: 0,
      });
    }

    const dayOfWeek = new Date(task.createdOn).getDay(); // 0 for Sunday, 1 for Monday, etc.
    const dayKey = `day${dayOfWeek + 1}`;

    // Update the totalSeconds for the specific day within the project
    projectMap.get(projectName).tasks[dayKey].totalSeconds += task.seconds;

    // Add task data to the specific day's tasksData
    projectMap.get(projectName).tasks[dayKey].tasksData.push(task);

    // Update the project's total week seconds
    projectMap.get(projectName).totalWeekSeconds += task.seconds;

    // Update the main object's WeekDaysTotalSeconds
    if (!organizedData.WeekDaysTotalSeconds[dayKey]) {
      organizedData.WeekDaysTotalSeconds[dayKey] = 0;
    }
    organizedData.WeekDaysTotalSeconds[dayKey] += task.seconds;

    organizedData.WeekTotalSeconds += task.seconds;
  }

  organizedData.projects = [...projectMap.values()];

  return organizedData;
}

const myModule = {
  organizeTasks,
  generateWeekArray,
  convertInputToHHMMSS,
  formatDateToCustomFormat,
  removeObjectsFromArraySlowly,
  groupTasksByWeeksAndCalculateTotals,
  getWeeklyTasks,
  convertTimeStringToSeconds,
  getHourlyRateStatus,
  extractDateInSeconds,
  formatTimestamp,
  renderDate,
  formatTime,
  formatSideTime,
  formatRecordTime,
  calculateTotalSeconds,
  unhideCurrentActiveParentChilds,
};

export default myModule;
