import type { FastifyRequest, FastifyReply} from "fastify";
import { ServiceError } from "../../../error/service-error.js";
import { getDeviceService } from "../service/get-devices.js";
import type { PaginationQuery } from "../../../shared/schema.js";

export async function getDevicesController(
    req: FastifyRequest<{ Querystring: PaginationQuery }>,
    reply: FastifyReply
){
    try{
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
        const result = await getDeviceService(req.server, page, limit);

        return reply.code(200).send({
            message: "Successfully fetched devices",
            data: result.devices,
            pagination: result.pagination,
        })

    }catch(err: unknown){
        if(err instanceof ServiceError){
            return reply.code(err.statusCode).send({
                message: err.message
            })
        }
        req.log.error(`Error occured in device controller, error: ${err}`)
        return reply.code(500).send({
            message: "Internal Server Error"
        })
    }
}