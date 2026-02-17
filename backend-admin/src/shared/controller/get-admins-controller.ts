import type { FastifyRequest, FastifyReply } from "fastify";
import { ServiceError } from "../../error/service-error.js";
import { getAdmins } from "../service/get-admins.js";
import type { PaginationQuery } from "../schema.js";

export async function getAdminsController(
  req: FastifyRequest<{ Querystring: PaginationQuery }>,
  reply: FastifyReply
) {
  try {
    if (!req.user?.uid) {
      return reply.code(401).send({
        message: "Unauthorized",
      });
    }

    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const result = await getAdmins(req.server, page, limit);

    return reply.code(200).send({
      message: "Admins fetched successfully",
      data: result.admins,
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
