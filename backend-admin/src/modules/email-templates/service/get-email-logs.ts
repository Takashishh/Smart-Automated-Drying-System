import type { FastifyInstance } from "fastify";
import { ServiceError } from "../../../error/service-error.js";
import type { PaginationMetadata } from "../../../shared/schema.js";

export async function getEmailLogs(
  fastify: FastifyInstance,
  page: number = 1,
  limit: number = 10
) {
  try {
    const query = fastify.db
      .collection("email-logs")
      .orderBy("sentDate", "desc");

    // Get total count
    const countSnapshot = await query.count().get();
    const totalItems = countSnapshot.data().count;

    if (totalItems === 0) {
      return {
        logs: [],
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
    const snapshot = await query
      .offset(offset)
      .limit(limit)
      .get();

    const logs: any[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Fetch admin names for each log
    const logsWithAdminNames = await Promise.all(
      logs.map(async (log: any) => {
        try {
          const adminDoc = await fastify.db
            .collection("admins")
            .doc(log.sentBy)
            .get();
          
          if (adminDoc.exists) {
            const adminData = adminDoc.data() as any;
            const adminName = adminData?.firstName && adminData?.lastName
              ? `${adminData.firstName} ${adminData.lastName}`
              : adminData?.email || log.sentBy;
            
            return {
              ...log,
              sentByName: adminName
            };
          }
        } catch (err) {
          // If admin lookup fails, keep the original sentBy ID
        }
        return log;
      })
    );

    const totalPages = Math.ceil(totalItems / limit);

    const pagination: PaginationMetadata = {
      currentPage: page,
      pageSize: limit,
      totalItems,
      totalPages,
    };

    return { logs: logsWithAdminNames, pagination };
  } catch (err) {
    fastify.log.error(err);
    throw new ServiceError(500, "Failed to fetch email logs");
  }
}
