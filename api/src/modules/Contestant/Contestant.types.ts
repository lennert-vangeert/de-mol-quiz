import { Document } from "mongoose";

type Contestant = Document & {
  _id?: string;
  name: string;
};

export { Contestant };
