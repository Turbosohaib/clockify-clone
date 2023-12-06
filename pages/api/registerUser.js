import clientPromise from "../../util/mongodb";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.PROJECTS_DB);

    const { email, password, confirmPassword } = req.body.data;

    // Check if the password and confirm password match

    if (password !== confirmPassword) {
      res.status(400).json({
        error: "Password and confirm password do not match.",
      });
      return;
    }

    // Check if the user already exists in the database
    const existingUser = await db.collection("Users").findOne({ email });
    if (existingUser) {
      res.status(400).json({
        error: "You already have an account!",
      });
      return;
    }

    // Generate a salt and hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the user document with hashed password
    const newUser = {
      email,
      password: hashedPassword,
    };

    // Save the user document to the MongoDB collection
    const registerUser = await db.collection("Users").insertOne(newUser);
    if (registerUser) {
      res.status(200).json({
        message: "Registered Successfully!",
      });
      return;
    }

    const users = await db.collection("Users").find({}).toArray();

    res.json({
      user: newUser,
      users,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error: "An error occurred.",
    });
  }
}
