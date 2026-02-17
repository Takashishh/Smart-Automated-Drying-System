import type { FastifyInstance } from "fastify";
import { ServiceError } from "../../error/service-error.js";
import type { PaginationMetadata } from "../schema.js";

export async function getAdmins(fastify: FastifyInstance, page: number = 1, limit: number = 10) {
  try {
    // Get total count
    const totalSnapshot = await fastify.db.collection("admins").count().get();
    const totalItems = totalSnapshot.data().count;

    if (totalItems === 0) {
      return {
        admins: [],
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
    const adminsSnapshot = await fastify.db
      .collection("admins")
      .offset(offset)
      .limit(limit)
      .get();

    const admins = adminsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        uid: doc.id, // Firebase UID
        adminId: data.adminId,
        email: data.email,
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        middleName: data.middleName || null,
        role: data.role,
        status: data.status,
        emailVerified: data.emailVerified || false,
        createdDate: data.createdDate || new Date().toISOString(),
        lastLogin: data.lastLogin || new Date().toISOString(),
      };
    });

    const totalPages = Math.ceil(totalItems / limit);

    const pagination: PaginationMetadata = {
      currentPage: page,
      pageSize: limit,
      totalItems,
      totalPages,
    };

    return { admins, pagination };
  } catch (err: unknown) {
    fastify.log.error(err);
    const message = (err as { message?: string })?.message;
    throw new ServiceError(500, message || "Failed to fetch admins");
  }
}
