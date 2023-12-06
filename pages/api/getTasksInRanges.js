import clientPromise from "../../util/mongodb";
import { calculateTotalSeconds } from "../../util/commonFunctions";
import { EJSON } from "bson";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req, res) {
  const userSession = await getServerSession(req, res, authOptions);
  try {
    const client = await clientPromise;
    const db = client.db(process.env.PROJECTS_DB);

    // Get startDate and endDate from req.body.data and set the time to midnight
    const startDate = new Date(req.body.startDate);
    startDate.setHours(0, 0, 0, 0);
    const startTimeStamp = startDate.getTime(); // Convert to timestamp in milliseconds

    const endDate = new Date(req.body.endDate);
    endDate.setHours(23, 59, 59, 999); // Set the end time to the last millisecond of the day
    const endTimeStamp = endDate.getTime(); // Convert to timestamp in milliseconds

    console.log("Start Date: " + startTimeStamp);
    console.log("End Date: " + endTimeStamp);

    // Fetch tasks within the date range based on createdOn field
    const tasks = await db
      .collection("tasks")
      .find({
        userId: userSession.user.id,
        createdOn: {
          $gte: startTimeStamp,
          $lte: endTimeStamp,
        },
      })
      .toArray();

    // Serialize tasks to JSON (if needed)
    const serializedTasks = EJSON.serialize(tasks);

    res.json({
      tasks: calculateTotalSeconds(serializedTasks), // Calculate total seconds on the serialized tasks
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "An error occurred while fetching tasks." });
  }
}
