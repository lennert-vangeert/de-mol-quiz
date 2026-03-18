import mongoose from "mongoose";
import { Contestant } from "./Contestant.types";

const contestantSchema = new mongoose.Schema<Contestant>({
  name: { type: String, required: true },
});

export default mongoose.model<Contestant>("Contestant", contestantSchema);
