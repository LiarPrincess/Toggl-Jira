import User from "user";
import { TogglEntry } from "toggl";
import { default as toJiraEntries } from "./mapper";
import { addWorkLog, getWorkLog } from "./api";
import { JiraEntry, WorkEntry, SyncResult } from ".";
import { equalTicketAndDay, inUserTimeZone } from "./time-zone";

export async function sync(user: User, togglEntries: TogglEntry[]): Promise<SyncResult> {
  const { entries: jiraEntries, unmappedEntries } = toJiraEntries(user, togglEntries);

  const result: SyncResult = {
    entries: [],
    unmappedEntries,
    duplicateEntries: [],
    failedEntries: []
  };

  const existingWorklogs = await getWorklogs(user, jiraEntries);
  for (const jiraEntry of jiraEntries) {
    const entryResult = await syncEntry(user, jiraEntry, existingWorklogs);
    if (entryResult == "Duplicate") {
      result.duplicateEntries.push(jiraEntry);
    }
    else if (entryResult instanceof Error) {
      result.failedEntries.push( { ...jiraEntry, error: entryResult });
    }
    else {
      result.entries.push(jiraEntry);
    }
  }
  return Promise.resolve(result);
}

type SyncEntryResult = WorkEntry | "Duplicate" | Error;

async function syncEntry(user: User, jiraEntry: JiraEntry, existingEntries: WorkEntry[]): Promise<SyncEntryResult> {
  const exitingEntry = existingEntries.find(w => equalTicketAndDay(user, w, jiraEntry));
  if (exitingEntry) {
    return Promise.resolve("Duplicate" as SyncEntryResult);
  }

  try {
    const ticket = jiraEntry.ticket;
    const date = inUserTimeZone(user, jiraEntry.date);
    const duration = jiraEntry.duration;

    const workLog = await addWorkLog(user, ticket, date, duration);
    return Promise.resolve(workLog);
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
