import { Moment, Duration } from "moment";

import { TogglEntry } from "toggl";
import { JiraEntry, WorkEntry } from "jira";

import "moment-duration-format";

export function moment(date: Moment): string {
  return date.format("YYYY-MM-DD HH:mm:ss Z");
}

export function momentDate(date: Moment) {
  return date.format("YYYY-MM-DD");
}

export function duration(duration: Duration) {
  return duration.format({
    template: "HH[h] mm[m] ss[s]",
    trim: false,
  });
}

export function togglEntry(entry: TogglEntry): string {
  return `${moment(entry.date)} (${duration(entry.duration)}) ${entry.description}`;
}

export function jiraEntry(entry: JiraEntry): string {
  const url = createJiraUrl(entry.ticket);
  return `${momentDate(entry.date)} (${duration(entry.duration)}) ${entry.ticket} (${url})`;
}

export function workEntry(entry: WorkEntry): string {
  const url = createJiraUrl(entry.ticket);
  return `${momentDate(entry.date)} (${duration(entry.duration)}) ${entry.ticket} ${url}`;
}

function createJiraUrl(ticket: string): string {
  return `${process.env.JIRA_PROTOCOL}://${process.env.JIRA_HOST}/browse/${ticket}`;
}
