import clientPromise from "../../util/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import { EJSON } from "bson";
import { ObjectId } from "bson";
import { parse, differenceInSeconds, format } from "date-fns";
import { convertInputToHHMMSS } from "../../util/commonFunctions";

export default async function handler(req, res) {
  const userSession = await getServerSession(req, res, authOptions);

  try {
    const client = await clientPromise;
    const db = client.db(process.env.PROJECTS_DB);

    // Extract the necessary information from the request body
    const { id, fieldToUpdate, updateValue, startTime, stopTime, seconds } =
      req.body;
    // Convert the _id string to an ObjectId
    const objectId = new ObjectId(id);

    // Define the query to find the task to update based on the _id and user ID
    const query = {
      _id: objectId, // Use the converted ObjectId to match the _id field
      userId: userSession.user.id,
      // Add any other criteria to uniquely identify the task
    };

    // Function to format time to "hh:mm:ss" format
    const formatTime = (time) => {
      const [hours, minutes] = time.split(":");
      return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:00`;
    };

    let adjustedStartTime, adjustedEndTime, duration;
    if (seconds) {
      const formattedSeconds = convertInputToHHMMSS(seconds);

      if (formattedSeconds !== "Invalid Input") {
        const [hours, minutes, sec] = formattedSeconds.split(":").map(Number);

        const totalSeconds = hours * 3600 + minutes * 60 + sec;

        const totalMilliseconds = totalSeconds * 1000;

        const formattedStartTime = formatTime(startTime);
        const formattedEndTime = formatTime(stopTime);

        // Parse the start and end times into Date objects
        adjustedStartTime = parse(formattedStartTime, "HH:mm:ss", new Date());
        adjustedEndTime = parse(formattedEndTime, "HH:mm:ss", new Date());

        const start_Time = format(adjustedStartTime, "HH:mm");
        const end_Time = format(adjustedEndTime, "HH:mm");

        const [startHours, startMinutes] = start_Time.split(":").map(Number);
        const [stopHours, stopMinutes] = end_Time.split(":").map(Number);
        // Create Date objects for the current date with custom times
        const startDate = new Date();
        startDate.setHours(startHours);
        startDate.setMinutes(startMinutes);
        const stopDate = new Date();
        stopDate.setHours(stopHours);
        stopDate.setMinutes(stopMinutes);
        // Get timestamps for start_time and stop_time
        const startTimestamp = startDate.getTime() - totalMilliseconds;
        const stopTimestamp = startDate.getTime() + totalMilliseconds;

        const updateOperation = {
          $set: {
            stopTime: stopTimestamp,
            seconds: totalSeconds,
          },
        };

        // Update the task that matches the query
        const updatedTask = EJSON.serialize(
          await db.collection("tasks").updateOne(query, updateOperation)
        );

        // Fetch the updated tasks after the update
        const updatedTasks = EJSON.serialize(
          await db
            .collection("tasks")
            .find({ userId: userSession.user.id })
            .toArray()
        );

        res.json({
          updatedTask,
          updatedTasks,
        });
      }
    } else if (startTime && stopTime) {
      // Format the start and end times to "hh:mm:ss" format
      const formattedStartTime = formatTime(startTime);
      const formattedEndTime = formatTime(stopTime);

      // Parse the start and end times into Date objects
      adjustedStartTime = parse(formattedStartTime, "HH:mm:ss", new Date());
      adjustedEndTime = parse(formattedEndTime, "HH:mm:ss", new Date());

      // Calculate the duration in seconds
      duration = differenceInSeconds(adjustedEndTime, adjustedStartTime);

      console.log("duration: ", duration);

      // Ensure the duration is positive
      if (duration < 0) {
        duration += 24 * 3600; // Add 24 hours in seconds
      }

      const start_Time = format(adjustedStartTime, "HH:mm");
      const end_Time = format(adjustedEndTime, "HH:mm");

      const [startHours, startMinutes] = start_Time.split(":").map(Number);
      const [stopHours, stopMinutes] = end_Time.split(":").map(Number);
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

      const updateOperation = {
        $set: {
          startTime: startTimestamp,
          stopTime: stopTimestamp,
          seconds: duration,
        },
      };

      // Update the task that matches the query
      const updatedTask = EJSON.serialize(
        await db.collection("tasks").updateOne(query, updateOperation)
      );

      // Fetch the updated tasks after the update
      const updatedTasks = EJSON.serialize(
        await db
          .collection("tasks")
          .find({ userId: userSession.user.id })
          .toArray()
      );

      res.json({
        updatedTask,
        updatedTasks,
      });
    } else {
      // Create an update operation to set the specified field with the provided value
      const updateOperation = {
        $set: {
          [fieldToUpdate]: updateValue, // Use computed property names to set the field dynamically
        },
      };

      // Update the task that matches the query
      const updatedTask = EJSON.serialize(
        await db.collection("tasks").updateOne(query, updateOperation)
      );

      // Fetch the updated tasks after the update
      const updatedTasks = EJSON.serialize(
        await db
          .collection("tasks")
          .find({ userId: userSession.user.id })
          .toArray()
      );

      res.json({
        updatedTask,
        updatedTasks,
      });
    }
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ error: "An error occurred while updating the task." });
  }
}
