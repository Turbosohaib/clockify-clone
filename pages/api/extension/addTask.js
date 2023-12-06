import clientPromise from '../../../util/mongodb';
import { calculateTotalSeconds } from '../../../util/commonFunctions';
import { EJSON, ObjectId } from "bson";
import { getServerSession } from "next-auth";
import { authOptions } from '../auth/[...nextauth]';
import NextCors from 'nextjs-cors';

export default async function handler(req, res) {
    await NextCors(req, res, {
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        origin: '*',
        optionsSuccessStatus: 200,
    });
    console.log('req.body.data', req.body.data)
    console.log('req.body.userId', req.body.userId)


    try {
        const client = await clientPromise;
        const db = client.db("time-tracker");
        var record = req.body.data;
        if (record._id) {
            const recordId = record._id.$oid;
            delete record._id;
            var task = await db.collection("tasktimemanager").updateOne(
                { _id: new ObjectId(recordId) },
                {
                    $set: record
                }
            );
            console.log("Task exist")

        } else {
            var task = await db.collection("tasktimemanager").insertOne(record);
            console.log("Task inserted")
        }
        const tasks = EJSON.serialize(await db
            .collection("tasktimemanager")
            .find({ userId: req.body.userId })
            .toArray());

        res.json({
            task,
            tasks: calculateTotalSeconds(tasks)
        });
    } catch (e) {
        console.error(e);
    }
};