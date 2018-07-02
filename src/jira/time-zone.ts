import { Moment } from "moment-timezone";
import { User } from "src/users";

interface Entry {
  ticket: string;
  date:   Moment;
  [p: string]: any;
}

export function equalTicketAndDay(user: User, lhs: Entry, rhs: Entry): boolean {
  const ticket = rhs.ticket;
  const jiraDate = toUserTimeZone(user, rhs.date);
  const workDate = toUserTimeZone(user, lhs.date);

  const hasEqualTicket = lhs.ticket === ticket;
  const hasEqualDay = workDate.isSame(jiraDate, "day");
  return hasEqualTicket && hasEqualDay;
}

export function toUserTimeZone(user: User, date: Moment): Moment {
  return date.clone().tz(user.timezone);
}
