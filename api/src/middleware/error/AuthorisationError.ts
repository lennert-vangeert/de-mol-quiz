import AppError from "./ApplicationError";

export default class AuthError extends AppError {
  constructor() {
    super("Unauthorized", 401);
  }
}
