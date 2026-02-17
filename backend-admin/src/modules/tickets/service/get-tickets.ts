import type {FastifyInstance} from 'fastify'
import { ServiceError } from '../../../error/service-error.js'
import type { PaginationMetadata } from '../../../shared/schema.js'

// backend service
export async function getTickets(
    fastify: FastifyInstance,
    page: number = 1,
    limit: number = 10
) {
    try {
        // Get total count
        const totalSnapshot = await fastify.db.collection('tickets').count().get();
        const totalItems = totalSnapshot.data().count;

        if (totalItems === 0) {
            return {
                tickets: [],
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
        const ticketsSnapshot = await fastify.db
            .collection('tickets')
            .offset(offset)
            .limit(limit)
            .get();

        const tickets = ticketsSnapshot.docs.map(doc => {
            const data = doc.data() ?? {};

            return {
                ticketId: doc.id,
                userId: data.userId,
                userName: data.userName ?? data.reportedBy?.name ?? data.reportedBy ?? "Unknown User",
                userEmail: data.email ?? data.reportedBy?.email ?? "",
                description: data.description ?? data.notes ?? "",
                issueType: data.issueType ?? data.type ?? "general",
                status: data.status,
                createdDate: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
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

        return { tickets, pagination };
    } catch(err: unknown) {
        throw new ServiceError(500, "Internal Server Error")
    }
}