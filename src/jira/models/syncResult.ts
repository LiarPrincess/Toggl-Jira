import { JiraEntry } from "src/jira";
import { TogglEntry } from "src/toggl";

export default interface SyncResult {
  entries: JiraEntry[];
  unmappedEntries: TogglEntry[];
  alreadySyncedEntries: JiraEntry[];
  failedEntries: { entry: JiraEntry; error: Error; }[];
}
