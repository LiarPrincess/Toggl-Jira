import { utc as date, duration } from "moment";
import { join } from "path";
import logger from "./util/logger";
import * as toggl from "./toggl";
import * as jira from "./jira";

import "moment-duration-format";
import "./util/configuration";

(async () => {
  try {
    const user = {
      togglToken: process.env.TOGGL_TOKEN as string,
      jiraUsername: "",
      jiraPassword: "string",
    };

    const startDate = date("01-05-2018 01:00", "DD-MM-YYYY HH:mm");
    const endDate   = date("30-05-2018 23:59", "DD-MM-YYYY HH:mm");

    const exportPath = join(process.cwd(), "private", "input.csv");
    const exportEntries = await toggl.parseExportFile(exportPath);

    // for (const entry of exportEntries) {
    //   logger.info(pretty(entry));
    // }

    const mappingResult = jira.map(exportEntries);

    for (const jiraEntry of mappingResult.entries) {
      logger.info(`${prettyJiraEntry(jiraEntry)}`);
      for (const togglEntry of jiraEntry.entries) {
        logger.info(`  ${prettyTogglEntry(togglEntry)}`);
      }
    }

    // const newEntry = await toggl.startTimeEntry(user, "Test task");
    // logger.info(`${newEntry}`);

    // const currentEntry = await toggl.getCurrentTimeEntry(user);
    // if (currentEntry) {
    //   logger.info(`Current entry: ${prettyTogglEntry(currentEntry)}`);
    // }
    // else logger.info("No current entry.");

    // if (currentEntry) {
    //   const stoppedEntry = await toggl.stopTimeEntry(user, currentEntry);
    //   if (stoppedEntry) {
    //     logger.info(`Current entry: ${prettyTogglEntry(stoppedEntry)}`);
    //   }
    // }
    // else logger.info("No entry to stop.");

    // const entries = await toggl.getTimeEntries(user, startDate, endDate);
    // for (const entry of entries) {
    //   logger.info(prettyTogglEntry(entry));
    // }

    logger.info("Finished.");
  }
  catch (e) {
    logger.error(e.stack);
    process.exitCode = 1;
  }
})();

function prettyJiraEntry(entry: jira.JiraEntry): string {
  const ticket = entry.ticket;
  const date = entry.date.format("YYYY-MM-DD");
  return `${date} ${ticket}`;
}

function prettyTogglEntry(entry: toggl.TogglEntry): string {
  const id = entry.id;
  const date = entry.date.format("YYYY-MM-DD hh:mm:ss Z");
  const duration = entry.duration.format("hh:mm:ss");

  const maxDescriptionLength = 60;
  const description = entry.description.length > maxDescriptionLength ?
    entry.description.substr(0, maxDescriptionLength - 3) + "..." :
    entry.description;

  return `${id} | ${date} | ${duration} | ${description}`;
}
