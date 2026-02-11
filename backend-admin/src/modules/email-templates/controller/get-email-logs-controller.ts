import type { FastifyRequest, FastifyReply } from "fastify";
import { ServiceError } from "../../../error/service-error.js";
import { getEmailLogs } from "../service/get-email-logs.js";

export async function getEmailLogsController(
  req: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const logs = await getEmailLogs(req.server);

    return reply.code(200).send({
      message: "Email logs fetched successfully",
      data: logs,
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
