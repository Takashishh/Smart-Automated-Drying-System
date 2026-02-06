import type { FastifyRequest, FastifyReply } from "fastify";
import { activateUserAccount } from "../service/active-account.js";
import { ServiceError } from "../../../error/service-error.js";
import type { disableUserAccountReq } from "../schemas/disable-account-schema.js";

export async function activateAccountController(
    req: FastifyRequest<{Body: disableUserAccountReq}>,
    reply: FastifyReply
){
    const {
        reason,
        userId
    } = req.body;
    try{
          if (!req.user?.uid) {
              throw new ServiceError(401, "Unauthorized");
          }
          const adminId = req.user.uid
        req.log.info(`Received reason: ${reason}`)

        await activateUserAccount(req.server, {
            reason,
            userId,
            adminId
        })

        return reply.code(200).send({
            message: "Successfully activated user account"
        })
    }catch(err: unknown){
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