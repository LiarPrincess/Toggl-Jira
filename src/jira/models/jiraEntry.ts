import { Moment, Duration } from "moment";
import { TogglEntry } from "./../../toggl";

export default interface JiraEntry {
  readonly ticket: string;
  readonly date: Moment;
  readonly duration: Duration;
  readonly togglEntries: TogglEntry[];
}
