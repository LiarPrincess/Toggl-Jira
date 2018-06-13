declare module 'jira-connector' {
  export default class JiraClient {
    constructor(config: Config);

    issue: IssueClient;
  }

  export interface Config {
    host:	        string;
    protocol?:    string;
    port?:        number;
    apiVersion?:  number;

    basic_auth?: {
      base64?:   string;
      username?: string;
      password?: string;
    }

    oauth?: {
      consumer_key?: string;
      private_key?:  string;
      token?:        string;
      token_secret?: string;
    }
  }

  export interface Worklog {
    id:      string;
    issueId: string;
    self:    string;
    comment: string;

    author: {
      self:        string;
      name:        string;
      displayName: string;
      active:      boolean;
    }

    started:          string;
    updated:          string;
    timeSpent:        string;
    timeSpentSeconds: number;
  }

  export interface AddWorkLogOptions {
    issueId?:  string;
    issueKey?: string;

    worklog: {
      started:   string;
      timeSpent: string;
    }

    adjustEstimate?: "new" | "leave" | "manual" | "auto";
  }

  export type GetWorkLogsOptions = { issueId?: string, issueKey?: string }
  export type GetWorkLogsResult  = { total:    number, worklogs:  Worklog[] }

  export interface IssueClient {
    addWorkLog(options: AddWorkLogOptions): Promise<Worklog>;
    getWorkLogs(options: GetWorkLogsOptions): Promise<GetWorkLogsResult>;
  }
}
