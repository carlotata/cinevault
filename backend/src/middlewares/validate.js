import { ValidationError } from '../utils/httpError.js';

// validate({ body: schema, query: schema }) -> parsed data is available as req.validated.body / .query
export const validate = (schemas) => (req, res, next) => {
  const validated = {};
  const errors = {};

  for (const [source, schema] of Object.entries(schemas)) {
    const result = schema.safeParse(req[source] ?? {});
    if (result.success) {
      validated[source] = result.data;
      continue;
    }
    for (const issue of result.error.issues) {
      (errors[issue.path.join('.') || 'form'] ??= []).push(issue.message);
    }
  }

  if (Object.keys(errors).length > 0) throw new ValidationError(errors);

  req.validated = validated;
  next();
};
