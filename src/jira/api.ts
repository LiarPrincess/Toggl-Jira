import { Moment, Duration, utc as date, duration, ISO_8601 } from "moment";
import { default as JiraClient } from "jira-connector";
import { User } from "./../users";
import { default as WorkEntry } from "./models/workEntry";

import "moment-duration-format";

export function getWorkLog(user: User, ticket: string): Promise<WorkEntry[]> {
  const client = createClient(user);
  return client.issue.getWorkLogs({ issueKey: ticket })
    .then(json => json.worklogs)
    .then(entries => entries.map(parseWorkEntry))
    .catch((err) => { throw new Error(`Unable to get worklog for ${ticket}: ${parseErrorMessage(err)}.`); });
}

export function addWorkLog(user: User, ticket: string, date: Moment, duration: Duration): Promise<WorkEntry> {
  const client = createClient(user);
  return client.issue.addWorkLog({
    issueKey: ticket,
    adjustEstimate: "auto",
    worklog: {
      started: date.format("YYYY-MM-DD[T12:00:00.00-0000]"),
      timeSpent: duration.format("hh[h] mm[m]"),
    },
  })
  .then(parseWorkEntry)
  .catch((err) => { throw new Error(`Unable to add worklog to ${ticket}: ${parseErrorMessage(err)}.`); });
}

function createClient(user: User): JiraClient {
  return new JiraClient({
    host: process.env.JIRA_HOST as string,
    protocol: process.env.JIRA_PROTOCOL as string,
    apiVersion: 2,
    basic_auth: {
      username: user.jiraUsername,
      password: user.jiraPassword,
    },
  });
}

function parseWorkEntry(entry: any): any {
  return {
    id: entry["id"],
    date: date(entry["started"], ISO_8601),
    duration: duration(2, entry["timeSpentSeconds"]),
    comment: entry["comment"],
  };
}

function parseErrorMessage(error: any): string {
  const errorJson = JSON.parse(error);
  return errorJson.body.errorMessages.join("; ");
}
