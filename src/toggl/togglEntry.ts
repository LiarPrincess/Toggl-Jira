import { Duration, Moment } from "moment";

export default interface TogglEntry {
  readonly id: number;
  readonly description: string;
  readonly date: Moment;
  readonly duration: Duration;
}
