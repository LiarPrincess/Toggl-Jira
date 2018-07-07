import * as moment from "moment-timezone";

import * as pretty from "./../pretty-print";
import { TogglEntry } from "toggl";
import { JiraEntry, WorkEntry } from "jira";

process.env.JIRA_PROTOCOL = "https";
process.env.JIRA_HOST = "jira.company.com";

describe("moment", () => {
  it("should format date", () => {
    const date = moment.utc("2018-06-01 23:59:59");
    expect(pretty.moment(date)).toBe("2018-06-01 23:59:59 +00:00");
  });

  it("should format date with time zone", () => {
    const date = moment.tz("2018-06-01 23:59:59", "Europe/Warsaw");
    expect(pretty.moment(date)).toBe("2018-06-01 23:59:59 +02:00");
  });
});

describe("momentDate", () => {
  it("should format date", () => {
    const date = moment.utc("2018-06-01 23:59:59");
    expect(pretty.momentDate(date)).toBe("2018-06-01");
  });

  it("should format date with time zone", () => {
    const date = moment.tz("2018-06-01 23:59:59", "Europe/Warsaw");
    expect(pretty.momentDate(date)).toBe("2018-06-01");
  });
});

describe("duration", () => {
  it("should format duration", () => {
    const duration = moment.duration("23:59:59");
    expect(pretty.duration(duration)).toBe("23h 59m 59s");
  });

  it("should format duration with padding", () => {
    const duration = moment.duration("1:5:9");
    expect(pretty.duration(duration)).toBe("01h 05m 09s");
  });
});

describe("togglEntry", () => {
  it("should format entry", () => {
    const entry: TogglEntry = {
      id: 5,
      description: "DESCRIPTION",
      date: moment.tz("2018-06-01 23:59:59", "Europe/Warsaw"),
      duration: moment.duration("23:59:59"),
    };

    expect(pretty.togglEntry(entry))
      .toBe("2018-06-01 23:59:59 +02:00 (23h 59m 59s) DESCRIPTION");
  });
});

describe("jiraEntry", () => {
  it("should format entry", () => {
    const date = moment.tz("2018-06-01 23:59:59", "Europe/Warsaw");
    const duration = moment.duration("23:59:59");

    const entry: JiraEntry = {
      ticket: "TICKET",
      date,
      duration,
      togglEntries: [
        { id: 5, description: "DESCRIPTION", date, duration }
      ],
    };

    expect(pretty.jiraEntry(entry))
      .toBe("2018-06-01 (23h 59m 59s) TICKET (https://jira.company.com/browse/TICKET)");
  });
});

describe("workEntry", () => {
  it("should format entry", () => {
    const entry: WorkEntry = {
      ticket: "TICKET",
      date: moment.tz("2018-06-01 23:59:59", "Europe/Warsaw"),
      duration: moment.duration("23:59:59"),
      comment: "COMMENT",
    };

    expect(pretty.workEntry(entry))
      .toBe("2018-06-01 (23h 59m 59s) TICKET https://jira.company.com/browse/TICKET");
  });
});
