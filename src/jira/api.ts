import { default as JiraClient, Worklog } from "jira-connector";
import { User } from "../users";
import { Moment, Duration } from "moment";

import "moment-duration-format";

export function getWorkLog(user: User, ticket: string): Promise<Worklog[]> {
  const client = createClient(user);
  return client.issue.getWorkLogs({ issueKey: ticket })
    .then(json => json.worklogs)
    .catch((err) => { throw new Error(`Unable to get worklog for ${ticket}: ${parseErrorMessage(err)}.`); });
}

export function addWorkLog(user: User, ticket: string, date: Moment, duration: Duration): Promise<Worklog> {
  const client = createClient(user);
  return client.issue.addWorkLog({
    issueKey: ticket,
    adjustEstimate: "auto",
    worklog: {
      started: date.format("YYYY-MM-DD[T12:00:00.00-0000]"),
      timeSpent: duration.format("hh[h] mm[m]"),
    },
  })
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

function parseErrorMessage(error: any): string {
  const errorJson = JSON.parse(error);
  return errorJson.body.errorMessages.join("; ");
}
