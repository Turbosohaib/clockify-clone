import { ObjectId, EJSON } from "bson";
import { calculateTotalSeconds } from "../../../util/commonFunctions";
import clientPromise from "../../../util/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import NextCors from 'nextjs-cors'

export default async function handler(req, res) {

    await NextCors(req, res, {
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        origin: '*',
        optionsSuccessStatus: 200,
    });
    const { userId, taskId } = req.body

    try {
        const client = await clientPromise;
        const db = await client.db("time-tracker");
        const parentTaskId = new ObjectId(taskId);

        const result = await db.collection("tasktimemanager").deleteMany({
            $or: [
                { _id: parentTaskId },     // Match the parent task's _id
                { parentTaskId: parentTaskId }  // Match child tasks with the specified parentTaskId
            ]
        });

        if (result.deletedCount === 0) {
            // Handle the case where no tasks were deleted
            res.status(404).json({ message: 'No tasks found for deletion' });
        } else {
            // Tasks were deleted, you can provide a success response or fetch updated data as needed
            const tasks = EJSON.serialize(await db
                .collection("tasktimemanager")
                .find({ userId: req.body.userId })
                .toArray());

            res.json({
                deletedTasks: result,
                tasks: tasks
            });
        }
    } catch (e) {
        console.error(e)
    }
}