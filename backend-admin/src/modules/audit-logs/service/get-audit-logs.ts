import type { FastifyInstance } from "fastify";
import { ServiceError } from "../../../error/service-error.js";                         
import { Timestamp } from "firebase-admin/firestore";
import type { PaginationMetadata } from "../../../shared/schema.js";

export async function getAuditLogs(
    fastify: FastifyInstance,
    page: number = 1,
    limit: number = 10
){
    try{
        // Get total count
        const totalSnapshot = await fastify.db.collection('audit_logs').count().get();
        const totalItems = totalSnapshot.data().count;

        if (totalItems === 0) {
            return {
                audits: [],
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
        const auditsSnapshot = await fastify.db
            .collection('audit_logs')
            .offset(offset)
            .limit(limit)
            .get();

        const audits = auditsSnapshot.docs.map(doc => {
            const data = doc.data();

            return {
                id: doc.id,
                performedBy: data.performedBy,
                action: data.action,
                target: data.target,
                timestamp: data.timestamp
            }
        });

        const totalPages = Math.ceil(totalItems / limit);

        const pagination: PaginationMetadata = {
            currentPage: page,
            pageSize: limit,
            totalItems,
            totalPages,
        };

        return { audits, pagination };

    }catch(err: unknown){
        fastify.log.error(`error occured in get audit log, error: ${err}`);
        throw new ServiceError(500, "Internal Server Error");
    }
}