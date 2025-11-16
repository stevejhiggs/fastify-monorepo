import fastifyMultipart from '@fastify/multipart';
import type { FastifyInstanceForRegistration } from '@repo/fastify-common-types';

export type { MultipartFile, MultipartValue } from '@fastify/multipart';
export type MultipartOptions = Omit<Parameters<typeof fastifyMultipart>[1], 'attachFieldsToBody'>;

// support multipart/form-data requests
export function registerMultipart(app: FastifyInstanceForRegistration, options?: MultipartOptions) {
  app.register(fastifyMultipart, { ...(options ?? {}), attachFieldsToBody: true });
}
