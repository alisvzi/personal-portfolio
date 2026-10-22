/**
 * Errors that are safe to surface to API callers.
 *
 * Only the base class is kept: the previous module carried a large unused
 * hierarchy of error types, retry helpers and logging utilities that nothing
 * imported. Route handlers map `AppError` to its status code and log anything
 * else without exposing internals.
 */
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;

    Object.setPrototypeOf(this, AppError.prototype);
  }
}
