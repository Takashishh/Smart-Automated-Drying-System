import type { FastifyRequest, FastifyReply } from "fastify";
import { ServiceError } from "../../../error/service-error.js";
import { getTickets } from "../service/get-tickets.js";
import type { GetTicketsQueryType } from "../schema/ticket-schemas.js";

export async function getTicketsController(
    req: FastifyRequest<{ Querystring: GetTicketsQueryType }>,
    reply: FastifyReply
){
    try{
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
        const userId = req.query.userId;
        const result = await getTickets(req.server, page, limit, userId);

        return reply.code(200).send({
            message: "Successfully fetched tickets",
            data: result.tickets,
            pagination: result.pagination,
        })

    }catch(err: unknown){
        if(err instanceof ServiceError){
            return reply.code(err.statusCode).send({
                message: err.message
            })
        }
    }
}