import type { FastifyInstance } from "fastify";
import { ServiceError } from "../../../error/service-error.js";
import type { PaginationMetadata } from "../../../shared/schema.js";

export async function getTemplates(
  fastify: FastifyInstance,
  category?: string,
  page: number = 1,
  limit: number = 10
) {
  try {
    let query = fastify.db.collection("email-templates");
    
    if (category) {
      query = query.where("category", "==", category) as any;
    }

    // Get total count for the query
    const countSnapshot = await query.count().get();
    const totalItems = countSnapshot.data().count;

    if (totalItems === 0) {
      return {
        templates: [],
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
    
    const templates = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const totalPages = Math.ceil(totalItems / limit);

    const pagination: PaginationMetadata = {
      currentPage: page,
      pageSize: limit,
      totalItems,
      totalPages,
    };

    return { templates, pagination };
  } catch (err) {
    fastify.log.error(err);
    throw new ServiceError(500, "Failed to fetch email templates");
  }
}
