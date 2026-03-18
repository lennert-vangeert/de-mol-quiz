export type UserMethods = {
  comparePassword: (password: string) => Promise<boolean>;
  generateToken: () => string;
};

export type User = Document &
  UserMethods & {
    _id?: string;
    email: string;
    password: string;
    role: "ADMIN" | "REGULAR";
    type: "private" | "corporate";
    score: number;
    name: string;
    receiveEmails: boolean;
    resetPasswordCode: string | null;
    resetPasswordExpires: Date | null;
  };
