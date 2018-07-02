import { Moment, Duration } from "moment";

import { JiraEntry, WorkEntry } from "src/jira";
import { TogglEntry } from "src/toggl";

export function moment(date: Moment): string {
  return date.format("YYYY-MM-DD HH:mm:ss Z");
}

export function momentAsDate(date: Moment) {
  return date.format("YYYY-MM-DD");
}

export function duration(duration: Duration) {
  return duration.format({
    template: "HH[h] mm[m] ss[s]",
    trim: false,
  });
}

export function workEntry(entry: WorkEntry): string {
  return `${moment(entry.date)} ${entry.ticket} ${duration(entry.duration)}`;
}

export function jiraEntry(entry: JiraEntry): string {
  const url = `${process.env.JIRA_PROTOCOL}://${process.env.JIRA_HOST}/browse/${entry.ticket}`;
  return `${momentAsDate(entry.date)} ${duration(entry.duration)} ${entry.ticket} (${url})`;
}

export function togglEntry(entry: TogglEntry): string {
  return `${moment(entry.date)} | ${duration(entry.duration)} | ${entry.description}`;
}
