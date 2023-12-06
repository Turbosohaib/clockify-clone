import clientPromise from "../../util/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import { EJSON } from "bson";

export default async function handler(req, res) {
  const userSession = await getServerSession(req, res, authOptions);
  try {
    const client = await clientPromise;
    const db = client.db(process.env.PROJECTS_DB);
    var projectName = req.body.projectName;
    projectName.newRates[0].date_from = new Date(
      projectName.newRates[0].date_from
    );
    projectName.userId = userSession.user.id;
    const project = await db.collection("project").insertOne(projectName);
    const projects = EJSON.serialize(
      await db
        .collection("project")
        .find({ userId: userSession.user.id })
        .toArray()
    );

    res.json({
      project,
      projects,
    });
  } catch (e) {
    console.error(e);
  }
}
