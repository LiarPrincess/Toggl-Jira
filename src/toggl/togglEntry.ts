import { Duration, Moment } from "moment";

export default interface TogglEntry {
  readonly description: string;
  readonly date: Moment;
  readonly duration: Duration;
}
