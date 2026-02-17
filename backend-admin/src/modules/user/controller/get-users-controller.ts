import type { FastifyRequest, FastifyReply } from "fastify";
import { getUsersService } from "../service/get-users.js";
import { ServiceError } from "../../../error/service-error.js";
import type { PaginationQuery } from "../../../shared/schema.js";

export async function getUserController(
  req: FastifyRequest<{ Querystring: PaginationQuery }>,
  reply: FastifyReply
) {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const result = await getUsersService(req.server, page, limit);

    return reply.code(200).send({
      message: "Successfully fetched users",
      data: result.users,
      pagination: result.pagination,
    });

  } catch (err) {
    if (err instanceof ServiceError) {
      return reply.code(err.statusCode).send({
        message: err.message,
      });
    }

    req.log.error(err);
    return reply.code(500).send({
      message: "Internal Server Error",
    });
  }
}
