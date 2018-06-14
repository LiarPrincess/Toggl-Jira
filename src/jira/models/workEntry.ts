import { Moment, Duration } from "moment";

export default interface WorkEntry {
  readonly ticket: string;
  readonly date: Moment;
  readonly duration: Duration;
  readonly comment: string;
}
