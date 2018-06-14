import { Moment } from "moment";
import { TogglEntry } from "./../../toggl";

export default interface JiraEntry {
  readonly ticket: string;
  readonly date: Moment;
  readonly togglEntries: TogglEntry[];
}
