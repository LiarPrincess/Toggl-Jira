import { Moment, duration, utc as date, ISO_8601 } from "moment";
import { get, post, put } from "request-promise-native";
import { User } from "./../users";
import { TogglEntry } from ".";

type TogglEntries = ReadonlyArray<TogglEntry>;

export function startTimeEntry(user: User, description: string): Promise<TogglEntry> {
  const request = createRequest(user, "time_entries/start");
  request.body = {
    "time_entry": { "description": description, "created_with": "api" }
  };

  return post(request)
    .then((json) => parseEntry(json.data))
    .catch((err) => { throw new Error(`Unable to start new Toggl entry ${description}: ${err.message}.`); });
}

export function stopTimeEntry(user: User, entry: TogglEntry): Promise<TogglEntry> {
  const request = createRequest(user, `time_entries/${entry.id}/stop`);
  return put(request)
    .then((json) => parseEntry(json.data))
    .catch((err) => { throw new Error(`Unable to stop Toggl entry '${entry.description}': ${err.message}.`); });
}

export function getCurrentTimeEntry(user: User): Promise<TogglEntry | undefined> {
  const request = createRequest(user, "time_entries/current");
  return get(request)
    .then((json) => json.data ? parseEntry(json.data) : undefined)
    .catch((err) => { throw new Error(`Unable to get current Toggl entry: ${err.message}.`); });
}

export function getTimeEntries(user: User, startDate: Moment, endDate: Moment): Promise<TogglEntries> {
  const request = createRequest(user, "time_entries");
  request.qs = {
    start_date: startDate.toISOString(),
    end_date:   endDate.toISOString(),
  };

  return get(request)
    .then((json) => json.map(parseEntry))
    .catch((err) => { throw new Error(`Unable to get Toggl entries: ${err.message}.`); });
}

function createRequest(user: User, endpoint: string): any {
  return {
    url: endpoint,
    baseUrl: process.env.TOGGL_BASE_URL,
    auth: {
      user: user.togglToken,
      pass: "api_token",
    },
    json: true,
  };
}

function parseEntry(entry: any): TogglEntry {
  const toMilliseconds = 1000;
  return {
    id: entry.id,
    description: entry.description,
    date: date(entry.start, ISO_8601).utcOffset(2), // assuming DST
    duration: duration(entry.duration * toMilliseconds),
  };
}