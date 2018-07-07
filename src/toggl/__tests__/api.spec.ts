import { default as nock } from "nock";
import * as moment from "moment-timezone";

import * as api from "./..";
import { TogglUser } from "user";
import TogglEntry from "../models/togglEntry";

const baseUrl = "https://www.toggl.com/api/v8";
process.env.TOGGL_BASE_URL = baseUrl;

const user: TogglUser = {
  apiToken: "API_TOKEN",
  timezone: "Europe/Warsaw",
};

beforeAll(() => {
  nock.disableNetConnect();
});

afterAll(() => {
  nock.enableNetConnect();
});

afterEach(() => {
  nock.cleanAll();
});

function fixture(name: string): string {
  return `${__dirname}/../../../fixtures/toggl/${name}`;
}

describe("stopEntry", () => {
  const entry: TogglEntry = {
    id: 436694100,
    description: "Meeting with possible clients",
    date: moment.utc("2013-03-05T07:58:58.000Z"),
    duration: moment.duration(5, "seconds"),
  };

  const endpoint = `/time_entries/${entry.id}/stop`;

  it("stops entry from toggl example", async () => {
    nock(baseUrl)
      .put(endpoint)
      .delayBody(500)
      .replyWithFile(200, fixture("stop.example.json"), { "Content-Type": "application/json" });

      const updatedEntry = await api.stopEntry(user, entry);
      expect(updatedEntry).toEqual({
        id: 436694100,
        description: "Meeting with possible clients",
        date: moment.utc("2013-03-05T07:58:58.000Z"),
        duration: moment.duration(60, "seconds"),
      });
  });

  it("handles errors", async () => {
    const message = "Something awful happened";
    nock(baseUrl)
      .put(endpoint)
      .delayBody(500)
      .replyWithError(message);

    try {
      await api.stopEntry(user, entry);
      expect(false).toBe(true);
    } catch (error) {
      expect(error.message.includes(message)).toBe(true);
    }
  });
});

describe("getCurrentEntry", () => {
  const endpoint = "/time_entries/current";

  it("parses response without entry", async () => {
    nock(baseUrl)
      .get(endpoint)
      .delayBody(500)
      .replyWithFile(200, fixture("current.empty.json"), { "Content-Type": "application/json" });

    const entry = await api.getCurrentEntry(user);
    expect(entry).toBeNull();
  });

  it("parses response from toggl example", async () => {
    nock(baseUrl)
      .get(endpoint)
      .delayBody(500)
      .replyWithFile(200, fixture("current.example.json"), { "Content-Type": "application/json" });

    const entry = await api.getCurrentEntry(user);
    expect(entry).toEqual({
      id: 436694100,
      description: "Running time entry",
      date: moment.utc("2014-01-30T09:08:04+00:00"),
      duration: moment.duration(-1391072884, "seconds"),
    });
  });

  it("handles errors", async () => {
    const message = "Something awful happened";
    nock(baseUrl)
    .get(endpoint)
      .delayBody(500)
      .replyWithError(message);

    try {
      await api.getCurrentEntry(user);
      expect(false).toBe(true);
    } catch (error) {
      expect(error.message.includes(message)).toBe(true);
    }
  });
});

describe("getEntries", () => {
  const endpoint = /time_entries\?start_date=.*&end_date=.*/;
  const startDate = moment.tz("2018-06-01", user.timezone);
  const endDate   = moment.tz("2018-06-20", user.timezone);

  it("parses response without entries", async () => {
    nock(baseUrl)
    .get(endpoint)
      .delayBody(500)
      .replyWithFile(200, fixture("time_entries.empty.json"), { "Content-Type": "application/json" });

    const entries = await api.getEntries(user, startDate, endDate);
    expect(entries).toEqual([]);
  });

  it("parses response from toggl example", async () => {
    nock(baseUrl)
    .get(endpoint)
      .delayBody(500)
      .replyWithFile(200, fixture("time_entries.example.json"), { "Content-Type": "application/json" });

    const entries = await api.getEntries(user, startDate, endDate);
    expect(entries).toEqual([
      {
        id: 436691234,
        description: "Meeting with the client",
        date: moment.utc("2013-03-11T11:36:00+00:00"),
        duration: moment.duration(14400, "seconds"),
      },
      {
        id: 436776436,
        description: "important work",
        date: moment.utc("2013-03-12T10:32:43+00:00"),
        duration: moment.duration(18400, "seconds"),
      },
    ]);
  });

  it("handles errors", async () => {
    const message = "Something awful happened";
    nock(baseUrl)
    .get(endpoint)
      .delayBody(500)
      .replyWithError(message);

    try {
      await api.getEntries(user, startDate, endDate);
      expect(false).toBe(true);
    } catch (error) {
      expect(error.message.includes(message)).toBe(true);
    }
  });
});
