import type { FastifyRequest, FastifyReply } from "fastify";
import { ServiceError } from "../../../error/service-error.js";
import { getEmailLogs } from "../service/get-email-logs.js";
import type { PaginationQuery } from "../../../shared/schema.js";

export async function getEmailLogsController(
  req: FastifyRequest<{ Querystring: PaginationQuery }>,
  reply: FastifyReply
) {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const result = await getEmailLogs(req.server, page, limit);

    return reply.code(200).send({
      message: "Email logs fetched successfully",
      data: result.logs,
      pagination: result.pagination,
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
