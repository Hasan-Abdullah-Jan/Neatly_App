/** Core data model. Everything is stored locally (see src/store). */

/** A calendar date in the user's local time zone, formatted YYYY-MM-DD. */
export type ISODate = string;

export type Unit = 'day' | 'week' | 'month';

export interface Frequency {
  every: number;
  unit: Unit;
}

export interface Space {
  id: string;
  name: string;
  emoji: string;
  createdAt: string;
}

export interface Member {
  id: string;
  name: string;
  color: string;
}

export interface Chore {
  id: string;
  title: string;
  spaceId: string;
  frequency: Frequency;
  /** Estimated effort in minutes. */
  minutes: number;
  assigneeId: string | null;
  notes: string;
  dueDate: ISODate;
  lastDone: ISODate | null;
  paused: boolean;
  createdAt: string;
}

export interface Completion {
  id: string;
  choreId: string;
  /** Snapshot so history survives renames/deletes. */
  title: string;
  spaceId: string;
  date: ISODate;
  at: string;
  minutes: number;
  memberId: string | null;
  /** State before completion, used for undo. */
  prev: { dueDate: ISODate; lastDone: ISODate | null };
}
