import clientPromise from "../../../util/mongodb";
import NextCors from 'nextjs-cors'
import { EJSON } from "bson";

export default async function handler(req, res) {
    await NextCors(req, res, {
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        origin: '*',
        optionsSuccessStatus: 200,
    });

    try {
        const client = await clientPromise;
        const db = client.db("time-tracker");
        const userTasks = EJSON.serialize(await db
            .collection("tasktimemanager")
            .find({ userId: req.body.userId })
            .toArray());
        res.json({
            userTasks
        });

    } catch (err) {
        res.status(400).send(err);
    }
};