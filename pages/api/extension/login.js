import clientPromise from "../../../util/mongodb";
import bcrypt from "bcrypt";
import NextCors from 'nextjs-cors';
const jwt = require("jsonwebtoken");
const jwtDecode = require('jwt-decode');

export default async function handler(req, res) {
    await NextCors(req, res, {
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        origin: '*',
        optionsSuccessStatus: 200,
    });

    try {
        const client = await clientPromise;
        // connect db using clientPromise, used by Sohaib
        const db = client.db("Projects_timesheet");
        const { email, password } = req.body;
        //get user from db
        const user = await db.collection("Users").findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {

            const token = jwt.sign(
                { user_id: user._id, email },
                process.env.TOKEN_KEY,
                {
                    expiresIn: "6h",
                }
            );
            // save user token
            user.token = token;
            delete user.password;
            // Replace with your actual JWT token
            const decodedToken = jwtDecode(user.token);

            //add the tokenexpiry as a field to user obj
            user.expiryTime = decodedToken.exp
            // send user as a response
            res.status(200).json(user);
        }
    } catch (err) {
        res.status(400).send(err);
    }
    //if email or pass is wrong send invalid credential as res
    res.status(400).send('Invalid credential');

}