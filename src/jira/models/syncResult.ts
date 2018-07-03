import { TogglEntry } from "toggl";
import { JiraEntry, FailedEntry } from "jira";

export default interface SyncResult {
  entries: JiraEntry[];
  unmappedEntries: TogglEntry[];
  duplicateEntries: JiraEntry[];
  failedEntries: FailedEntry[];
}
