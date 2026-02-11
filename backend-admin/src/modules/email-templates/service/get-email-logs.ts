import type { FastifyInstance } from "fastify";
import { ServiceError } from "../../../error/service-error.js";

export async function getEmailLogs(
  fastify: FastifyInstance,
  limit: number = 50
) {
  try {
    const snapshot = await fastify.db
      .collection("email-logs")
      .orderBy("sentDate", "desc")
      .limit(limit)
      .get();

    if (snapshot.empty) {
      return [];
    }

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

    return logsWithAdminNames;
  } catch (err) {
    fastify.log.error(err);
    throw new ServiceError(500, "Failed to fetch email logs");
  }
}
