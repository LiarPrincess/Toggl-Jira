import { Moment, Duration } from "moment";

export default interface WorkEntry {
  readonly id: string;
  readonly date: Moment;
  readonly duration: Duration;
  readonly comment: string;
}
