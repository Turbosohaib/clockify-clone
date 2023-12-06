import axios from "axios";

export default async function handler(req, res) {
  try {
    const counter = req.query.counter;

    const requestData = {
      user: req.body.user,
    };

    const secretKey = process.env.SECRET_KEY;

    const headers = {
      sharedkey: secretKey, // Replace with your shared key
    };

    if (counter === "start") {
      await axios
        .post(
          `${process.env.SOCKET_SERVER_ENDPOINT}/start-counter`,
          requestData,
          { headers }
        )
        // await axios
        //   .post("http://localhost:8080/start-counter", requestData, { headers })
        .then((response) => {
          if (response.status === 200) {
            console.log("Counter started");
            res.json({
              message: "Counter started!",
            });
          }
        })
        .catch((error) => {
          console.error("Error starting counter:", error);
          res.json({
            error: "Error starting counter!",
          });
        });
    } else if (counter === "stop") {
      await axios
        .post(
          `${process.env.SOCKET_SERVER_ENDPOINT}/stop-counter`,
          requestData,
          { headers }
        )
        // await axios
        //   .post("http://localhost:8080/stop-counter", requestData, { headers })
        .then((response) => {
          if (response.status === 200) {
            console.log("Counter stopped");
            res.json({
              message: "Counter stopped!",
            });
          }
        })
        .catch((error) => {
          console.error("Error stopping counter:", error);
          res.json({
            error: "Error stopping counter!",
          });
        });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
}
