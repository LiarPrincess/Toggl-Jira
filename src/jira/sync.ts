import { Moment, Duration, duration } from "moment";
import { addWorkLog, getWorkLog } from "./api";
import { User } from "src/users";
import { TogglEntry } from "src/toggl";
import { default as map } from "./mapper";
import JiraEntry from "./models/jiraEntry";
import WorkEntry from "./models/workEntry";

interface Result {
  entries: JiraEntry[];
  unmappedEntries: TogglEntry[];
  alreadySyncedEntries: JiraEntry[];
  failedEntries: { entry: JiraEntry; error: Error; }[];
}

export async function sync(user: User, togglEntries: ReadonlyArray<TogglEntry>): Promise<Result> {
  const { entries, unmappedEntries } = map(togglEntries);

  const result: Result = {
    entries: [],
    unmappedEntries,
    alreadySyncedEntries: [],
    failedEntries: []
  };

  const existingWorklogs = await getWorklogs(user, entries);
  for (const entry of entries) {
    const syncResult = await syncEntry(user, entry, existingWorklogs);
    if (syncResult == "SyncSuccessful") {
      result.entries.push(entry);
    }
    else if (syncResult == "AlreadySynced") {
      result.alreadySyncedEntries.push(entry);
    }
    else {
      result.failedEntries.push( { entry, error: syncResult });
    }
  }
  return Promise.resolve(result);
}

type SyncResult = "SyncSuccessful" | "AlreadySynced" | Error;

async function syncEntry(user: User, jiraEntry: JiraEntry, existingEntries: WorkEntry[]): Promise<SyncResult> {
  const ticket = jiraEntry.ticket;
  const date = jiraEntry.date;
  const duration = sumDurations(jiraEntry.togglEntries);

  const exitingEntry = existingEntries.find(w => hasEqualTicketAndDay(w, ticket, date));
  if (exitingEntry) {
    return Promise.resolve("AlreadySynced" as SyncResult);
  }

  try {
    // addWorkLog(user, ticket, date, duration);
    return Promise.resolve("SyncSuccessful" as SyncResult);
  }
  catch (e) {
    return Promise.resolve(e as Error);
  }
}

function getWorklogs(user: User, entries: JiraEntry[]): Promise<WorkEntry[]> {
  const workEntries = entries
    .map(e => e.ticket)
    .filter(isUnique)
    .map(ticket => getWorkLog(user, ticket));

  return Promise.all(workEntries)
    .then(entries => entries.reduce(append, []));
}

function isUnique(s: string, index: number, arr: string[]): boolean {
  return arr.indexOf(s) === index;
}

function append(lhs: WorkEntry[], rhs: WorkEntry[]): WorkEntry[] {
  return lhs.concat(rhs);
}

function hasEqualTicketAndDay(entry: WorkEntry, ticket: string, date: Moment): boolean {
  const hasEqualTicket = entry.ticket === ticket;
  const hasEqualDay = entry.date.isSame(date, "day");
  return hasEqualTicket && hasEqualDay;
}

function sumDurations(entries: TogglEntry[]): Duration {
  return entries
        .map(e => e.duration)
        .reduce((acc, d) => acc.add(d), duration(0));
}
