import { Moment } from "moment";
import { JiraEntry } from ".";
import { TogglEntry } from "../toggl";

interface MappingResult {
  readonly entries: JiraEntry[];
  readonly unmappedEntries: TogglEntry[];
}

export default function map(togglEntries: ReadonlyArray<TogglEntry>): MappingResult {
  const ticketRegex = new RegExp(`(${process.env.JIRA_TICKET_REGEX})`);

  const result: MappingResult = { entries: [], unmappedEntries: [] };
  for (const togglEntry of togglEntries) {
    const ticketMatches = togglEntry.description.match(ticketRegex);

    if (ticketMatches) {
      const ticket = ticketMatches[0];
      const jiraEntry = result.entries.find(e => hasEqualTicketAndDay(e, ticket, togglEntry.date));

      if (jiraEntry) {
        jiraEntry.togglEntries.push(togglEntry);
      }
      else {
        result.entries.push({
          ticket,
          date: togglEntry.date.startOf("day").add(12, "hours"),
          togglEntries: [togglEntry],
        });
      }
    }
    else result.unmappedEntries.push(togglEntry);
  }

  return result;
}

function hasEqualTicketAndDay(entry: JiraEntry, ticket: string, date: Moment): boolean {
  const hasEqualTicket = entry.ticket === ticket;
  const hasEqualDay = entry.date.isSame(date, "day");
  return hasEqualTicket && hasEqualDay;
}
