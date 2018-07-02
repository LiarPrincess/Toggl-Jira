import JiraEntry from "./jiraEntry";

export default interface FailedEntry extends JiraEntry {
  error: Error;
}
