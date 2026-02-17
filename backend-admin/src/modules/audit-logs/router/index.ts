import type { FastifyInstance } from "fastify";
import { getAuditLogsController } from "../controller/get-audit-logs-controller.js";
import { getAuditInfoController } from "../controller/get-audit-info-controller.js";
import { firebaseAuthPreHandler } from "../../../plugin/firebase-plug.js";
import { paginationQuerySchema } from "../../../shared/schema.js";

export function auditModRouter(
    fastify: FastifyInstance
){
    fastify.route({
        url: "/get-audit-logs",
        method: "GET",
        schema: {
            querystring: paginationQuerySchema,
        },
        preHandler: firebaseAuthPreHandler,
        handler: getAuditLogsController
    })

    fastify.route({
        url: "/get-audit-info/:id",
        method: "GET",
        preHandler: firebaseAuthPreHandler,
        handler: getAuditInfoController
    })
}