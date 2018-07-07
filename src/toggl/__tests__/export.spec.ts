import * as moment from "moment-timezone";

import * as toggl from "./..";
import { TogglUser } from "user";
import { TogglEntry } from "./..";

const user: TogglUser = {
  apiToken: "API_TOKEN",
  timezone: "Europe/Warsaw",
};

function fixture(name: string): string {
  return `${__dirname}/../../../fixtures/toggl/${name}`;
}

describe("stopEntry", () => {
  it("stops entry from toggl example", async () => {
    const entries = await toggl.parseExport(user, fixture("export.csv"));

    expect(entries.length).toBe(3);
    expectEquals(entries[0], {
        id: 0,
        description: "TICKET-42 No idea but probably something important",
        date: moment.utc("2018-06-01T07:01:59.000Z"),
        duration: moment.duration(45 * 60 + 59, "seconds"),
    });
    expectEquals(entries[1], {
      id: 0,
      description: "TICKET-39 Sleeping",
      date: moment.utc("2018-06-01T07:45:00.000Z"),
      duration: moment.duration(14 * 60 + 59, "seconds"),
    });
    expectEquals(entries[2], {
        id: 0,
        description: "TICKET-39 Sleeping",
        date: moment.utc("2018-06-01T08:00:00.000Z"),
        duration: moment.duration(13 * 3600 + 59 * 60 + 59, "seconds"),
    });
  });
});

function expectEquals(lhs: TogglEntry, rhs: TogglEntry) {
  expect(lhs.id).toBe(rhs.id);
  expect(lhs.description).toBe(rhs.description);
  expect(lhs.date.unix()).toBe(rhs.date.unix());
  expect(lhs.duration.asSeconds()).toEqual(rhs.duration.asSeconds());
}
