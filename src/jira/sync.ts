import { Moment, Duration, duration } from "moment-timezone";
import { addWorkLog, getWorkLog } from "./api";
import { User } from "src/users";
import { TogglEntry } from "src/toggl";
import { default as map } from "./mapper";
import { JiraEntry, WorkEntry, SyncResult } from ".";

export async function sync(user: User, togglEntries: TogglEntry[]): Promise<SyncResult> {
  const { entries, unmappedEntries } = map(togglEntries);

  const result: SyncResult = {
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

type Result = "SyncSuccessful" | "AlreadySynced" | Error;

async function syncEntry(user: User, jiraEntry: JiraEntry, existingEntries: WorkEntry[]): Promise<Result> {
  const exitingEntry = existingEntries.find(w => hasEqualTicketAndDay(user, w, jiraEntry));
  if (exitingEntry) {
    return Promise.resolve("AlreadySynced" as Result);
  }

  try {
    const ticket = jiraEntry.ticket;
    const date = localDate(user, jiraEntry.date);
    const duration = sumDurations(jiraEntry.togglEntries);

    // addWorkLog(user, ticket, date, duration);
    return Promise.resolve("SyncSuccessful" as Result);
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

function hasEqualTicketAndDay(user: User, workEntry: WorkEntry, jiraEntry: JiraEntry): boolean {
  const ticket = jiraEntry.ticket;
  const jiraDate = localDate(user, jiraEntry.date);
  const workDate = localDate(user, workEntry.date);

  const hasEqualTicket = workEntry.ticket === ticket;
  const hasEqualDay = workDate.isSame(jiraDate, "day");
  return hasEqualTicket && hasEqualDay;
}

function sumDurations(entries: TogglEntry[]): Duration {
  return entries
        .map(e => e.duration)
        .reduce((acc, d) => acc.add(d), duration(0));
}

function localDate(user: User, date: Moment): Moment {
  return date.clone().tz(user.timezone);
}

