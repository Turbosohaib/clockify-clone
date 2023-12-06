import clientPromise from "../../util/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import { EJSON } from "bson";

export default async function handler(req, res) {
  const userSession = await getServerSession(req, res, authOptions);
  try {
    const client = await clientPromise;
    const db = client.db(process.env.PROJECTS_DB);
    const projectTag = req.body.projectTag;
    projectTag.userId = userSession.user.id;
    const Tag = await db.collection("projectTag").insertOne(projectTag);
    const Tags = await db
      .collection("projectTag")
      .find({ userId: userSession.user.id })
      .toArray();

    res.json({
      Tag,
      Tags,
    });
  } catch (e) {
    console.error(e);
  }
}
