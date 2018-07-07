export interface TogglUser {
  readonly apiToken: string;
  readonly timezone: string;
}

export interface JiraUser {
  readonly username: string;
  readonly password: string;
  readonly timezone: string;
}

export default interface User {
  readonly togglToken: string;
  readonly jiraUsername: string;
  readonly jiraPassword: string;
  readonly timezone: string;
}
