import type { FastifyInstance } from "fastify";
import { getUserController } from "../controller/get-users-controller.js";
import { getUserInfoController } from "../controller/get-user-info-controller.js";
import { disableUserAccountReq } from "../schemas/disable-account-schema.js";
import { sendUserPasswordResetController } from "../controller/send-password-controller.js";
import { firebaseAuthPreHandler } from "../../../plugin/firebase-plug.js";
import { activateAccountController } from "../controller/activate-account-controller.js";
import { updateUserSchema } from "../schemas/update-user-schema.js";
import { updateUserController } from "../controller/update-user-controller.js";
import { disableAccountController } from "../controller/disable-account-controller.js";
import { paginationQuerySchema } from "../../../shared/schema.js";

export function userModRoutes(fastify: FastifyInstance){
    fastify.route({
        url: '/get-users',
        method: 'GET',
        schema: {
            querystring: paginationQuerySchema,
        },
        handler: getUserController
    })

    fastify.route({
        url: '/get-user-info/:userId',
        method: 'GET',
        handler: getUserInfoController
    })

    fastify.route({
        url: '/update-user/:userId',
        method: 'PATCH',
        preHandler: firebaseAuthPreHandler,
        schema: {
            body: updateUserSchema
        },
        handler: updateUserController
    })

    fastify.route({
        url: '/disable-account',
        method: 'POST',
        schema: {
            body: disableUserAccountReq 
        }, preHandler: firebaseAuthPreHandler,
        handler: disableAccountController
    })

    fastify.route({
        url: '/activate-account',
        method: 'POST',
        schema: {
            body: disableUserAccountReq 
        }, preHandler: firebaseAuthPreHandler,
        handler: activateAccountController
    })

    fastify.route({
        url: '/send-password-reset',
        method: 'POST',
        schema: {
            body: disableUserAccountReq 
        }, preHandler: firebaseAuthPreHandler,
        handler: sendUserPasswordResetController
    })

}