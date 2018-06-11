import { createReadStream } from "fs";
import { default as parse } from "csv-parse";
import { duration, utc as date, ISO_8601 } from "moment";
import { TogglEntry } from ".";

type TogglEntries = ReadonlyArray<TogglEntry>;

export function parseExportFile(path: string): Promise<TogglEntries> {
  return new Promise((resolve, reject) => {
    const options = { columns: true, delimiter: "," };

    const rejectWithError = (err: Error) => {
      reject(new Error(`Unable to parse Toggl export '${path}': ${err.message}.`));
    };

    const stream = createReadStream(path);
    stream.on("error", rejectWithError);
    stream.pipe(parse(options, (err, data) => {
      if (err) rejectWithError(err);
      else resolve(data.map(parseEntry));
    }));
  });
}

function parseEntry(entry: any): TogglEntry {
  const startDateString = `${entry["Start date"]}T${entry["Start time"]}`;
  return {
    id: 0,
    description: entry["Description"],
    date: date(startDateString, ISO_8601).utcOffset(2).subtract(2, "hours"), // assuming DST
    duration: duration(entry["Duration"]),
  };
}
