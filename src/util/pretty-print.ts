import { JiraEntry, WorkEntry } from "src/jira";
import { TogglEntry } from "src/toggl";

export function prettyWorkEntry(entry: WorkEntry): string {
  const ticket = entry.ticket;
  const date = entry.date.format("YYYY-MM-DD HH:mm:ss Z");
  const duration = entry.duration.format("HH[h] mm[m] ss[s]");
  return `${date} ${ticket} ${duration}`;
}

export function prettyJiraEntry(entry: JiraEntry): string {
  const ticket = entry.ticket;
  const date = entry.date.format("YYYY-MM-DD");
  return `${date} ${ticket}`;
}

export function prettyTogglEntry(entry: TogglEntry): string {
  const id = entry.id;
  const date = entry.date.format("YYYY-MM-DD HH:mm:ss Z");
  const duration = entry.duration.format("HH[h] mm[m] ss[s]");

  const maxDescriptionLength = 60;
  const description = entry.description.length > maxDescriptionLength ?
    entry.description.substr(0, maxDescriptionLength - 3) + "..." :
    entry.description;

  return `${id} | ${date} | ${duration} | ${description}`;
}
