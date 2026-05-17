import { Document } from "mongoose";

export type Config = Document & {
  week: number;
  season: number;
  showWinner: boolean;
};
