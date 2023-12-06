import clientPromise from '../../../util/mongodb';
import NextCors from 'nextjs-cors'
import { EJSON } from "bson";

export default async function handler(req, res) {
    await NextCors(req, res, {
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        origin: '*',
        optionsSuccessStatus: 200,
    });

    // console.log("getTask req.body", req.body)

    try {
        const client = await clientPromise;
        const db = client.db("Projects_timesheet");
        const userProjects = EJSON.serialize(await db
            .collection("project")
            .find()
            .toArray());

        res.json({
            userProjects
        });

    } catch (err) {
        res.status(400).send(err);
    }
};