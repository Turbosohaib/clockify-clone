import clientPromise from "../../util/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req, res) {
  const userSession = await getServerSession(req, res, authOptions);

  try {
    const client = await clientPromise;
    const db = client.db(process.env.PROJECTS_DB);
    const project = await db.collection("project").deleteOne(req.body.id);

    const projects = await db.collection("project").find({}).toArray();

    res.json({
      project,
      projects,
    });
  } catch (e) {
    console.error(e);
  }
}
