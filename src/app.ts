import { join } from "path";
import * as toggl from "./toggl";
import * as jira from "./jira";
import logger from "./util/logger";
import { User } from "./users";
import { prettyTogglEntry, prettyJiraEntry, prettyWorkEntry } from "./util/pretty-print";

import "moment-duration-format";
import "./util/configuration";

(async () => {
  try {
    const user: User = {
      togglToken:   process.env.TOGGL_TOKEN as string,
      jiraUsername: process.env.JIRA_USERNAME as string,
      jiraPassword: process.env.JIRA_PASSWORD as string,
      timezone:     process.env.TIMEZONE as string,
    };

    const exportPath = join(process.cwd(), "private", "input.csv");
    const exportEntries = await toggl.parseExport(user, exportPath);

    for (const entry of exportEntries) {
      logger.info("Toggl entry: ", prettyTogglEntry(entry));
    }

    // const syncResult = await jira.sync(user, exportEntries);

    logger.info("Finished.");
  }
  catch (e) {
    logger.error(e.stack);
    process.exitCode = 1;
  }
})();
