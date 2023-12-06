import clientPromise from "../../util/mongodb";

export default async function handler(req, res) {
  const projectid = req.body; // Extract projectid from query parameters
  console.log(projectid);
  try {
    const client = await clientPromise;
    const db = client.db(process.env.PROJECTS_DB);
    const project = await db
      .collection("project")
      .findOne({ projectid: req.body.projectid });

    const projects = await db.collection("project").find({}).toArray();

    res.json({
      project,
      projects,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "An error occurred" });
  }
}
