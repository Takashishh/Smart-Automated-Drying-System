import type { FastifyInstance } from "fastify";
import { ServiceError } from "../../../error/service-error.js";
import type { PaginationMetadata } from "../../../shared/schema.js";

export async function getDeviceService(
    fastify: FastifyInstance,
    page: number = 1,
    limit: number = 10
){
    try{
        // Get total count
        const totalSnapshot = await fastify.db.collection('devices').count().get();
        const totalItems = totalSnapshot.data().count;

        if (totalItems === 0) {
            return {
                devices: [],
                pagination: {
                    currentPage: page,
                    pageSize: limit,
                    totalItems: 0,
                    totalPages: 0,
                },
            };
        }

        // Calculate offset
        const offset = (page - 1) * limit;

        // Fetch paginated data
        const devicesSnapshot = await fastify.db
            .collection('devices')
            .offset(offset)
            .limit(limit)
            .get();

        const devices = devicesSnapshot.docs.map(doc => {
            const data = doc.data() ?? {}
            return {
                uuid: doc.id,
                macId: data.macId,
                connectedUser: Array.isArray(data.connectedUsers) ? data.connectedUsers : [],
                createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
                updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? null
            }
        });

        const totalPages = Math.ceil(totalItems / limit);

        const pagination: PaginationMetadata = {
            currentPage: page,
            pageSize: limit,
            totalItems,
            totalPages,
        };

        return { devices, pagination };

    }catch(err: unknown){
        throw new ServiceError(500, "Internal server error");
    }
}