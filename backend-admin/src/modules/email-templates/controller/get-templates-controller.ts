import type { FastifyRequest, FastifyReply } from "fastify";
import { ServiceError } from "../../../error/service-error.js";
import type { GetTemplatesQueryType } from "../schema/email-schemas.js";
import { getTemplates } from "../service/get-templates.js";

export async function getTemplatesController(
  req: FastifyRequest<{ Querystring: GetTemplatesQueryType }>,
  reply: FastifyReply
) {
  try {
    const templates = await getTemplates(req.server, req.query.category);

    return reply.code(200).send({
      message: "Templates fetched successfully",
      data: templates,
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
