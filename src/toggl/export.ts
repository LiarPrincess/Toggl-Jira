import { duration, default as moment, ISO_8601 } from "moment-timezone";
import { default as csv } from "csv-parse";
import { createReadStream } from "fs";

import User from "user";
import { TogglEntry } from ".";

export function parseExport(user: User, path: string): Promise<TogglEntry[]> {
  return new Promise((resolve, reject) => {
    const options = { columns: true, delimiter: "," };

    const rejectWithError = (err: Error) => {
      reject(new Error(`Unable to parse Toggl export '${path}': ${err.message}.`));
    };

    createReadStream(path)
    .pipe(csv(options, (err, data) => {
      if (err) rejectWithError(err);
      else resolve(data.map((e: any) => parseEntry(user, e)));
    }))
    .on("error", rejectWithError);
  });
}

function parseEntry(user: User, entry: any): TogglEntry {
  const timezone = user.timezone;
  const dateString = `${entry["Start date"]}T${entry["Start time"]}`;

  return {
    id: 0,
    description: entry["Description"],
    date: moment.tz(dateString, ISO_8601, timezone),
    duration: duration(entry["Duration"]),
  };
}
