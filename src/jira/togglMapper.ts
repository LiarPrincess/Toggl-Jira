import { TogglEntry } from "../toggl";
import { JiraEntry } from ".";
import { Moment } from "moment";

interface MappingResult {
  readonly entries: JiraEntry[];
  readonly invalidEntries: TogglEntry[];
}

export function map(togglEntries: ReadonlyArray<TogglEntry>): MappingResult {
  const ticketRegex = new RegExp(`(${process.env.JIRA_TICKET_REGEX})`);

  const result: MappingResult = { entries: [], invalidEntries: [] };
  for (const togglEntry of togglEntries) {
    const ticketMatches = togglEntry.description.match(ticketRegex);

    if (ticketMatches) {
      const ticket = ticketMatches[0];
      const jiraEntry = result.entries.find(e => hasEqualTicketAndDay(e, ticket, togglEntry.date));

      if (jiraEntry) {
        jiraEntry.entries.push(togglEntry);
      }
      else {
        result.entries.push({
          ticket,
          date: togglEntry.date.startOf("day"),
          entries: [togglEntry],
        });
      }
    }
    else result.invalidEntries.push(togglEntry);
  }

  return result;
}

const comparer = new Intl.Collator("en", {
  usage: "search",
  sensitivity: "base",
});

function hasEqualTicketAndDay(entry: JiraEntry, ticket: string, date: Moment): boolean {
  const hasEqualTicket = comparer.compare(entry.ticket, ticket) === 0;
  const hasEqualDay = entry.date.isSame(date, "day");
  return hasEqualTicket && hasEqualDay;
}
