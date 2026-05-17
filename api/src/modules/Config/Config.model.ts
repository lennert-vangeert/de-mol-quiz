import mongoose from "mongoose";
import { Config } from "./Config.types";

const configSchema = new mongoose.Schema<Config>({
  week: { type: Number, required: true },
  season: { type: Number, required: true },
  showWinner: { type: Boolean, required: true, default: false },
});

export default mongoose.model<Config>("Config", configSchema);
