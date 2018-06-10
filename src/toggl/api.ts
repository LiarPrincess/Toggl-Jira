import { Moment, duration, utc } from "moment";
import { get } from "request-promise-native";
import { User } from "./../users";
import logger from "./../util/logger";
import TogglEntry from "./togglEntry";

type TogglEntries = ReadonlyArray<TogglEntry>;

export function getTimeEntries(user: User, startDate: Moment, endDate: Moment): Promise<TogglEntries> {
  const options = {
    url: `${process.env.TOGGL_BASE_URL}/time_entries`,
    qs: {
      start_date: startDate.toISOString(),
      end_date:   endDate.toISOString(),
    },
    auth: {
      user: user.togglToken,
      pass: "api_token",
    },
    json: true,
  };

  return get(options)
    .then((data) => data.map(parseEntry))
    .catch((err) => { throw new Error(`Unable to get Toggl time entries: ${err.message}.`); });
}

function parseEntry(entry: any): TogglEntry {
  const toSeconds = 1000;
  return {
    description: entry.description,
    date: utc(entry.at),
    duration: duration(entry.duration * toSeconds),
  };
}
