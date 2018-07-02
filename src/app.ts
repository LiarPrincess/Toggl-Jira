import { join } from "path";
import logger from "./util/logger";
import { User } from "./users";
import { prettyTogglEntry, prettyJiraEntry, prettyWorkEntry } from "./util/pretty-print";
import * as toggl from "./toggl";
import * as jira from "./jira";

import "moment-duration-format";
import "./util/configuration";

const user = require("./../user.json") as User;

(async () => {
  try {
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
