import type { FastifyInstance } from "fastify";
import { getTicketsController } from "../controller/get-tickets-controller.js";
import { deleteDevice } from "../../device/schema/device-id.js";
import { firebaseAuthPreHandler } from "../../../plugin/firebase-plug.js";
import { deleteDeviceController } from "../../device/controller/delete-device-controller.js";
import { CreateTicketBody, DeleteTicketBody, UpdateTicketStatusBody } from "../schema/ticket-schemas.js";
import { createTicketController } from "../controller/create-ticket-controller.js";
import { updateTicketController } from "../controller/update-ticket-controller.js";
import { deleteTicketController } from "../controller/delete-ticket-controller.js";
import { paginationQuerySchema } from "../../../shared/schema.js";

export function ticketsRouter(fastify: FastifyInstance){
    fastify.route({
        url: '/get-tickets',
        method: 'GET',
        schema: {
            querystring: paginationQuerySchema,
        },
        handler: getTicketsController
    })
    fastify.route({
        url: '/delete-ticket',
        method: 'POST',
        schema: {
            body: DeleteTicketBody
        }, preHandler: firebaseAuthPreHandler,
        handler: deleteTicketController
    })

    fastify.route({
        url: '/create-ticket',
        method: 'POST',
        schema: {
            body: CreateTicketBody
        }, handler: createTicketController
    })

    fastify.route({
        url: '/update-ticket',
        method: 'POST',
        schema: {
            body: UpdateTicketStatusBody
        }, preHandler: firebaseAuthPreHandler,
        handler: updateTicketController
    })
}