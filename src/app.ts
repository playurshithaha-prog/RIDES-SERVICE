import Fastify from 'fastify';

export function buildApp(logger = false) {
  const app = Fastify({
    logger,
    ajv: { customOptions: { removeAdditional: false } },
  });

  app.setErrorHandler((error, request, reply) => {
    if (typeof error === 'object' && error !== null && 'validation' in error) {
      return reply.code(400).send({
        error: { code: 'VALIDATION_ERROR', message: 'Invalid request.' },
      });
    }

    const status = typeof error === 'object' && error !== null && 'statusCode' in error
      ? error.statusCode
      : undefined;
    if (typeof status === 'number' && status >= 400 && status < 500) {
      return reply.code(status).send({
        error: { code: 'REQUEST_ERROR', message: 'The request could not be processed.' },
      });
    }

    request.log.error({ err: error }, 'Unhandled request error');
    return reply.code(500).send({
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' },
    });
  });

  app.setNotFoundHandler((_request, reply) => reply.code(404).send({
    error: { code: 'NOT_FOUND', message: 'Route not found.' },
  }));

  app.get('/health', {
    schema: { querystring: { type: 'object', additionalProperties: false } },
  }, async () => ({ status: 'ok' }));

  return app;
}
