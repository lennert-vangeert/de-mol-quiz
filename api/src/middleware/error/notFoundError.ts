import AppError from "./ApplicationError";

export default class notFoundError extends AppError {
  constructor(error?: string) {
    super(error ?? "resource not found", 404);
  }
}
