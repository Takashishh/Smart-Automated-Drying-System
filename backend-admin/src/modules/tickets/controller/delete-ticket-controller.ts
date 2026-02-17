import type { FastifyRequest, FastifyReply } from "fastify";
import { ServiceError } from "../../../error/service-error.js";
import type { DeleteTicketBodyType } from "../schema/ticket-schemas.js";
import { deleteTickets } from "../service/delete-ticket.js";
export async function deleteTicketController(
    req: FastifyRequest<{Body: DeleteTicketBodyType}>, 
    reply: FastifyReply
){
    const {
        ticketId
    } = req.body
    try{
        req.server.log.info({ ticketId, user: req.user?.uid }, 'deleteTicketController: incoming request');
        if(!req.user?.uid){
            return reply.code(401).send({
                message: "Unauthorized"
            })
        }
        const adminId = req.user.uid;
        const res = await deleteTickets(req.server, {
            adminId,
            ticketId
        })
        req.server.log.info({ res, ticketId, adminId }, 'deleteTicketController: deleteTickets succeeded');
        return reply.code(200).send({
            message: "Successfully deleted ticket",
            data: res
        })
    }catch(err: unknown){
        req.server.log.error({ err, body: req.body, user: req.user?.uid }, 'deleteTicketController: error');
        if(err instanceof ServiceError){
            return reply.code(err.statusCode).send({
                message: err.message
            })
        }
        return reply.code(500).send({
            message: "Internal Server Error"
        })
    }
}