import type { FastifyRequest, FastifyReply } from "fastify";
import { ServiceError } from "../../../error/service-error.js";
import type { SendEmailBodyType } from "../schema/email-schemas.js";
import { sendEmailService } from "../service/send-email.js";

export async function sendEmailController(
  req: FastifyRequest<{ Body: SendEmailBodyType }>,
  reply: FastifyReply
) {
  try {
    const result = await sendEmailService(req.server, req.body);

    return reply.code(200).send({
      message: result.message,
      data: result,
    });
  } catch (err: unknown) {
    if (err instanceof ServiceError) {
      return reply.code(err.statusCode).send({
        message: err.message,
      });
    }
    return reply.code(500).send({
      message: "Internal Server Error",
    });
  }
}
