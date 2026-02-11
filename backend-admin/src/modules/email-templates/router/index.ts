import type { FastifyInstance } from "fastify";
import { firebaseAuthPreHandler } from "../../../plugin/firebase-plug.js";
import { SendEmailBody, GetTemplatesQuery } from "../schema/email-schemas.js";
import { sendEmailController } from "../controller/send-email-controller.js";
import { getTemplatesController } from "../controller/get-templates-controller.js";
import { getEmailLogsController } from "../controller/get-email-logs-controller.js";

export function emailTemplatesRouter(fastify: FastifyInstance) {
  fastify.route({
    url: "/get-templates",
    method: "GET",
    schema: {
      querystring: GetTemplatesQuery,
    },
    preHandler: firebaseAuthPreHandler,
    handler: getTemplatesController,
  });

  fastify.route({
    url: "/send-email",
    method: "POST",
    schema: {
      body: SendEmailBody,
    },
    preHandler: firebaseAuthPreHandler,
    handler: sendEmailController,
  });

  fastify.route({
    url: "/get-email-logs",
    method: "GET",
    preHandler: firebaseAuthPreHandler,
    handler: getEmailLogsController,
  });
}
