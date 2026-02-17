import type { FastifyInstance } from "fastify";
import { ServiceError } from "../../../error/service-error.js";
import type { PaginationMetadata } from "../../../shared/schema.js";

export async function getUsersService(
  fastify: FastifyInstance,
  page: number = 1,
  limit: number = 10
) {
  try {
    // Get total count
    const totalSnapshot = await fastify.db.collection("users").count().get();
    const totalItems = totalSnapshot.data().count;

    if (totalItems === 0) {
      return {
        users: [],
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
    const snapshot = await fastify.db
      .collection("users")
      .offset(offset)
      .limit(limit)
      .get();
    
    const users = snapshot.docs.map(doc => {
      const data = doc.data() ?? {};
      delete data.password; 

      return {
        uuid: doc.id,
        firstName: data.firstName ?? null,
        lastName: data.lastName ?? null,
        displayName: data.displayName ?? null,
        email: data.email ?? null,
        emailVerified: data.emailVerified ?? false,
        contactNumber: data.contactNumber ?? null,
        photoUrl: data.photoUrl ?? null,
        address: data.address ?? null,
        status: data.status,
        devices: Array.isArray(data.devices) ? data.devices : [],
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? null
      };
    });

    const totalPages = Math.ceil(totalItems / limit);

    const pagination: PaginationMetadata = {
      currentPage: page,
      pageSize: limit,
      totalItems,
      totalPages,
    };

    return { users, pagination };


  } catch (err) {
    fastify.log.error(err);

    throw new ServiceError(
      500,
      "Unable to retrieve users from database"
    );
  }
}
