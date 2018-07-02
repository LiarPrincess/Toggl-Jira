import { tz as date } from "moment-timezone";

import logger from "./util/logger";
import User from "./user";
import * as pretty from "./util/pretty-print";
import * as toggl from "./toggl";
import * as jira from "./jira";

import "moment-duration-format";
import "./util/configuration";

const user = require("./../user.json") as User;

(async () => {
  try {
    logger.info("Start");

    const currentEntry = await toggl.getCurrentEntry(user);
    if (currentEntry) {
      logger.info(`Stopping Toggl entry: '${currentEntry.description}'`);
      await toggl.stopEntry(user, currentEntry);
    }

    // const startDate = date("2018-06-01", user.timezone);
    // const endDate   = date("2018-06-20", user.timezone);
    const endDate = date(user.timezone).endOf("day");
    const startDate = endDate.clone().subtract(2, "day").startOf("day");
    logger.info(`Syncing entries from '${pretty.momentAsDate(startDate)}' to '${pretty.momentAsDate(endDate)}'`);

    const entries = await toggl.getEntries(user, startDate, endDate);
    logger.info(`Found ${entries.length} entries to sync`);

    const result = await jira.sync(user, entries);
    printSynchronizedEntries(result);
    printFailedEntries(result);
    printUnmappedEntries(result);
    printDuplicateEntries(result);

    logger.info("Finished");
  }
  catch (e) {
    logger.error(e.stack);
    process.exitCode = 1;
  }
})();

const indent = " ";

function printSynchronizedEntries(result: jira.SyncResult): void {
  if (result.entries.length == 0)
    return;

  logger.info("Successfully synchronized:");
  for (const jiraEntry of result.entries) {
    logger.info(`${indent}${pretty.jiraEntry(jiraEntry)}`);
    for (const togglEntry of jiraEntry.togglEntries) {
      logger.info(`${indent}${indent}${pretty.togglEntry(togglEntry)}`);
    }
  }
}

function printFailedEntries(result: jira.SyncResult): void {
  if (result.failedEntries.length == 0)
    return;

  logger.info("Failed:");
  for (const failedEntry of result.failedEntries) {
    logger.info(`${indent}${pretty.jiraEntry(failedEntry)}`);
    logger.info(`${indent}${failedEntry.error.name}`);
    logger.info(`${indent}${failedEntry.error.message}`);
    for (const togglEntry of failedEntry.togglEntries) {
      logger.info(`${indent}${indent}${pretty.togglEntry(togglEntry)}`);
    }
  }
}

function printUnmappedEntries(result: jira.SyncResult): void {
  if (result.unmappedEntries.length == 0)
    return;

  logger.info("No mapping:");
  for (const entry of result.unmappedEntries) {
    logger.info(`${indent}${pretty.togglEntry(entry)}`);
  }
}

function printDuplicateEntries(result: jira.SyncResult): void {
  if (result.duplicateEntries.length == 0)
    return;

  logger.info("Duplicates:");
  for (const jiraEntry of result.duplicateEntries) {
    logger.info(`${indent}${pretty.jiraEntry(jiraEntry)}`);
    for (const togglEntry of jiraEntry.togglEntries) {
      logger.info(`${indent}${indent}${pretty.togglEntry(togglEntry)}`);
    }
  }
}
