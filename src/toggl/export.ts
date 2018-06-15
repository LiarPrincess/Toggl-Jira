import { duration, default as moment, ISO_8601 } from "moment-timezone";
import { default as csv } from "csv-parse";
import { createReadStream } from "fs";
import { TogglEntry } from ".";
import { User } from "../users";

export function parseExport(user: User, path: string): Promise<TogglEntry[]> {
  return new Promise((resolve, reject) => {
    const options = { columns: true, delimiter: "," };

    const rejectWithError = (err: Error) => {
      reject(new Error(`Unable to parse Toggl export '${path}': ${err.message}.`));
    };

    const stream = createReadStream(path);
    stream.on("error", rejectWithError);
    stream.pipe(csv(options, (err, data) => {
      if (err) rejectWithError(err);
      else resolve(data.map((e: any) => parseEntry(user, e)));
    }));
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