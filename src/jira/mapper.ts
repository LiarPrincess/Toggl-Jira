import User from "src/user";
import { JiraEntry } from ".";
import { TogglEntry } from "src/toggl";
import { equalTicketAndDay } from "./time-zone";

interface MappingResult {
  readonly entries: JiraEntry[];
  readonly unmappedEntries: TogglEntry[];
}

export default function map(user: User, togglEntries: TogglEntry[]): MappingResult {
  const ticketRegex = new RegExp(`(${process.env.JIRA_TICKET_REGEX})`);

  const result: MappingResult = { entries: [], unmappedEntries: [] };
  for (const togglEntry of togglEntries) {
    const ticketMatches = togglEntry.description.match(ticketRegex);

    if (ticketMatches) {
      const ticket = ticketMatches[0];
      const jiraEntry = result.entries.find(e => equalTicketAndDay(user, e, { ticket, ...togglEntry }));

      if (jiraEntry) {
        jiraEntry.duration.add(togglEntry.duration);
        jiraEntry.togglEntries.push(togglEntry);
      }
      else {
        result.entries.push({
          ticket,
          date: togglEntry.date.clone().startOf("day").add(12, "hours"),
          duration: togglEntry.duration.clone(),
          togglEntries: [togglEntry],
        });
      }
    }
    else result.unmappedEntries.push(togglEntry);
  }

  return result;
}
