import clientPromise from "../../util/mongodb";
import { calculateTotalSeconds } from "../../util/commonFunctions";
import { EJSON, ObjectId } from "bson";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req, res) {
  const userSession = await getServerSession(req, res, authOptions);
  try {
    // console.log('session from server side: ', req.body.userId)
    const client = await clientPromise;
    const db = client.db(process.env.PROJECTS_DB);
    var record = req.body.data;
    console.log(record);
    record.userId = userSession.user.id;
    if (record._id) {
      const recordId = record._id.$oid;
      delete record._id;
      var task = await db.collection("tasks").updateOne(
        { _id: new ObjectId(recordId) },
        {
          $set: record,
        }
      );
    } else {
      var task = await db.collection("tasks").insertOne(record);
    }
    const tasks = EJSON.serialize(
      await db
        .collection("tasks")
        .find({ userId: userSession.user.id })
        .toArray()
    );

    res.json({
      task,
      tasks: calculateTotalSeconds(tasks),
    });
  } catch (e) {
    console.error(e);
  }
}
