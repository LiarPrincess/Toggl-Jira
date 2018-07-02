import { Moment } from "moment-timezone";
import User from "src/user";

interface Entry {
  ticket: string;
  date: Moment;
  [p: string]: any;
}

export function equalTicketAndDay(user: User, lhs: Entry, rhs: Entry): boolean {
  const ticket = rhs.ticket;
  const jiraDate = inUserTimeZone(user, rhs.date);
  const workDate = inUserTimeZone(user, lhs.date);

  const hasEqualTicket = lhs.ticket === ticket;
  const hasEqualDay = workDate.isSame(jiraDate, "day");
  return hasEqualTicket && hasEqualDay;
}

export function inUserTimeZone(user: User, date: Moment): Moment {
  return date.clone().tz(user.timezone);
}
