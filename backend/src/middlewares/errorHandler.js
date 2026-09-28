import { HttpError } from '../utils/httpError.js';

export const notFound = (req, res) => {
  res.status(404).json({ message: 'Not Found' });
};

// Express recognises error handlers by their four arguments.
// eslint-disable-next-line no-unused-vars
export function errorHandler(error, req, res, next) {
  if (error instanceof HttpError) {
    return res.status(error.status).json({ message: error.message, ...(error.errors && { errors: error.errors }) });
  }
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON body.' });
  }
  console.error(error);
  res.status(500).json({ message: 'Server Error' });
}
