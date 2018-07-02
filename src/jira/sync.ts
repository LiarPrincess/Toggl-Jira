import { Duration, duration } from "moment-timezone";
import { addWorkLog, getWorkLog } from "./api";
import { User } from "src/users";
import { TogglEntry } from "src/toggl";
import { default as map } from "./mapper";
import { JiraEntry, WorkEntry, SyncResult } from ".";
import { equalTicketAndDay, toUserTimeZone } from "./time-zone";

export async function sync(user: User, togglEntries: TogglEntry[]): Promise<SyncResult> {
  const { entries, unmappedEntries } = map(user, togglEntries);

  const result: SyncResult = {
    entries: [],
    unmappedEntries,
    duplicateEntries: [],
    failedEntries: []
  };

  const existingWorklogs = await getWorklogs(user, entries);
  for (const entry of entries) {
    const entryResult = await syncEntry(user, entry, existingWorklogs);
    if (entryResult == "Success") {
      result.entries.push(entry);
    }
    else if (entryResult == "Duplicate") {
      result.duplicateEntries.push(entry);
    }
    else {
      result.failedEntries.push( { ...entry, error: entryResult });
    }
  }
  return Promise.resolve(result);
}

type SyncEntryResult = "Success" | "Duplicate" | Error;

async function syncEntry(user: User, jiraEntry: JiraEntry, existingEntries: WorkEntry[]): Promise<SyncEntryResult> {
  const exitingEntry = existingEntries.find(w => equalTicketAndDay(user, w, jiraEntry));
  if (exitingEntry) {
    return Promise.resolve("Duplicate" as SyncEntryResult);
  }

  try {
    const ticket = jiraEntry.ticket;
    const date = toUserTimeZone(user, jiraEntry.date);
    const duration = sumDurations(jiraEntry.togglEntries);

    // addWorkLog(user, ticket, date, duration);
    return Promise.resolve("Success" as SyncEntryResult);
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

function sumDurations(entries: TogglEntry[]): Duration {
  return entries
        .map(e => e.duration)
        .reduce((acc, d) => acc.add(d), duration(0));
}
