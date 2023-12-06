import { parse, differenceInSeconds, format } from "date-fns";

export default async function handler(req, res) {
  try {
    const { startTime, stopTime } = req.body;

    // Function to format time to "hh:mm:ss" format
    const formatTime = (time) => {
      const [hours, minutes] = time.split(":");
      return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:00`;
    };

    let adjustedStartTime, adjustedEndTime, duration;

    if (startTime && stopTime) {
      // Format the start and end times to "hh:mm:ss" format
      const formattedStartTime = formatTime(startTime);
      const formattedEndTime = formatTime(stopTime);

      // Parse the start and end times into Date objects
      adjustedStartTime = parse(formattedStartTime, "HH:mm:ss", new Date());
      adjustedEndTime = parse(formattedEndTime, "HH:mm:ss", new Date());

      // Calculate the duration in seconds
      duration = differenceInSeconds(adjustedEndTime, adjustedStartTime);

      // Ensure the duration is positive
      if (duration < 0) {
        duration += 24 * 3600; // Add 24 hours in seconds
      }

      // Calculate duration in hours, minutes, and seconds
      const hours = Math.floor(duration / 3600);
      const remainingSeconds = duration % 3600;
      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;

      // You can use hours, minutes, and seconds as needed
      // For example, you can return them in the response JSON
      res.json({
        adjustedStartTime: format(adjustedStartTime, "HH:mm"),
        adjustedEndTime: format(adjustedEndTime, "HH:mm"),
        duration: `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      });
    } else {
      res
        .status(400)
        .json({ error: "Both startTime and endTime are required." });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}