import type { FastifyInstance } from "fastify";
import { ServiceError } from "../../../error/service-error.js";

export async function getTemplates(
  fastify: FastifyInstance,
  category?: string
) {
  try {
    let query = fastify.db.collection("email-templates");
    
    if (category) {
      query = query.where("category", "==", category) as any;
    }

    const snapshot = await query.get();
    
    if (snapshot.empty) {
      return [];
    }

    const templates = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return templates;
  } catch (err) {
    fastify.log.error(err);
    throw new ServiceError(500, "Failed to fetch email templates");
  }
}
