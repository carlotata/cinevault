export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export class ValidationError extends HttpError {
  constructor(errors) {
    super(422, 'The given data was invalid.');
    this.errors = errors;
  }
}
