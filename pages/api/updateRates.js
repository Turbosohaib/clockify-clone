import clientPromise from "../../util/mongodb";
import { EJSON } from "bson";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req, res) {
  const userSession = await getServerSession(req, res, authOptions);

  try {
    const client = await clientPromise;
    const db = client.db(process.env.PROJECTS_DB);

    const filter = { projectid: req.body.projectid };
    const project = await db.collection("project").findOne(filter);

    if (project) {
      const newRate = {
        newHourlyRate: req.body.newRate,
        date_from: new Date(req.body.date_from),
        date_to: null,
        currency: req.body.currency,
      };

      project.newRates.sort(
        (a, b) => new Date(a.date_from) - new Date(b.date_from)
      );

      for (const rate of project.newRates) {
        if (rate.date_from > newRate.date_from) {
          var d = new Date(rate.date_from);
          d.setDate(d.getDate() - 1);
          newRate.date_to = d;
          break;
        }
      }

      project.newRates.reverse();

      for (const rate of project.newRates) {
        if (rate.date_from < newRate.date_from) {
          var d = new Date(newRate.date_from);
          d.setDate(d.getDate() - 1);
          rate.date_to = d;
          break;
        }
      }

      project.newRates.push(newRate);
      project.newRates.sort(
        (a, b) => new Date(a.date_from) - new Date(b.date_from)
      );

      const updateNewRate = {
        $set: { newRates: project.newRates },
      };
      await db.collection("project").updateOne(filter, updateNewRate);

      const updatedProject = EJSON.serialize(
        await db.collection("project").findOne(filter)
      );
      const projects = EJSON.serialize(
        await db
          .collection("project")
          .find({ userId: userSession.user.id })
          .toArray()
      );

      res.json({
        updatedProject,
        projects,
      });
    } else {
      res.status(404).json({ message: "Project not found" });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal server error" });
  }
}
