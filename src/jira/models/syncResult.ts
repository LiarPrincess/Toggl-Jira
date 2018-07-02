import { TogglEntry } from "src/toggl";
import { JiraEntry, FailedEntry } from "src/jira";

export default interface SyncResult {
  entries: JiraEntry[];
  unmappedEntries: TogglEntry[];
  duplicateEntries: JiraEntry[];
  failedEntries: FailedEntry[];
}
