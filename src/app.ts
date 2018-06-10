import moment from "moment";
import logger from "./util/logger";
import * as toggl from "./toggl";
import "./util/configuration";

(async () => {
  try {
    const user = {
      togglToken: process.env.TOGGL_TOKEN as string,
      jiraUsername: "",
      jiraPassword: "string",
    };

    const startDate = moment("01-05-2018 01:00", "DD-MM-YYYY HH:mm");
    const endDate   = moment("30-05-2018 23:59", "DD-MM-YYYY HH:mm");

    // const newEntry = await toggl.startTimeEntry(user, "Test task");
    // logger.info(`${newEntry}`);

    const currentEntry = await toggl.getCurrentTimeEntry(user);
    if (currentEntry) {
      const duration = currentEntry.duration;
      const hours = duration.hours();
      const min = duration.minutes();
      const sec = duration.seconds();
      logger.info(`${hours}:${min}:${sec}`);
      logger.info(`Current entry: ${currentEntry.date} | ${currentEntry.duration} | ${currentEntry.description}`);
    }
    else logger.info("No current entry.");

    if (currentEntry) {
      const stoppedCurrentEntry = await toggl.stopTimeEntry(user, currentEntry);

      if (stoppedCurrentEntry) {
        const duration = stoppedCurrentEntry.duration;
        const hours = duration.hours();
        const min = duration.minutes();
        const sec = duration.seconds();
        logger.info(`${hours}:${min}:${sec}`);
        logger.info(`Current entry: ${stoppedCurrentEntry.date} | ${stoppedCurrentEntry.duration} | ${stoppedCurrentEntry.description}`);
      }
    }
    else {
      logger.info("No entry to stop.");
    }

    // const entries = await toggl.getTimeEntries(user, startDate, endDate);
    // for (const entry of entries) {
    //   const description = entry.description.length > 57 ? `${entry.description.substring(0, 57)}...` : entry.description;
    //   logger.info(`${entry.id} | ${entry.date} | ${entry.duration} | ${description}`);
    // }
  }
  catch (e) {
    logger.error(e.stack);
    process.exitCode = 1;
  }
})();
