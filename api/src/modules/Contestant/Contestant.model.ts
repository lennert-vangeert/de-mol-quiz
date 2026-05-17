import mongoose from "mongoose";
import { Contestant } from "./Contestant.types";

const contestantSchema = new mongoose.Schema<Contestant>({
  name: { type: String, required: true },
  season: { type: Number, required: true },
});

export default mongoose.model<Contestant>("Contestant", contestantSchema);
