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

    const entries = await toggl.getTimeEntries(user, startDate, endDate);

    for (const entry of entries) {
      logger.info(`${entry.date} | ${entry.duration} | ${entry.description}`);
    }
  }
  catch (e) {
    logger.error(e.stack);
    process.exitCode = 1;
  }
})();
