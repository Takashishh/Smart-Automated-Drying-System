import type { FastifyInstance } from "fastify";
import type { CreateAuditType } from "./schema/create-audit-fn.js";
import { ServiceError } from "../../error/service-error.js";

/**
 * Search for a user by ID and return their readable string
 */
export async function searchIfUser(fastify: FastifyInstance, targetId: string) {
  const userDoc = await fastify.db.collection("users").doc(targetId).get();
  if (!userDoc.exists) return null;

  const data = userDoc.data()!;
  return `${data.firstName} ${data.lastName} (${data.email})`;
}

/**
 * Search for an admin by ID and return their readable string
 */
export async function searchIfAdmin(fastify: FastifyInstance, targetId: string) {
  const adminDoc = await fastify.db.collection("admins").doc(targetId).get();
  if (!adminDoc.exists) return null;

  const data = adminDoc.data()!;
  return `${data.firstName} ${data.lastName} (${data.email})`;
}

/**
 * Creates an audit log entry
 */
export async function createAuditFunction(
  fastify: FastifyInstance,
  body: CreateAuditType
) {
  try {
    // 1️⃣ Validate performing admin
    const adminDoc = await fastify.db.collection("admins").doc(body.adminId).get();
    fastify.log.info(`Fetched admin id: ${body.adminId}`);
    if (!adminDoc.exists) {
      throw new ServiceError(400, "Admin not found");
    }
    const adminData = adminDoc.data()!;

    // 2️⃣ Normalize reason
    let normalizedReason = "";

    if(!body.reason){
      normalizedReason = "";
    }else{
      normalizedReason = body.reason;
    }

    fastify.log.info(`normalized reason value: ${normalizedReason}`)

    // 3️⃣ Replace targetId with readable name if possible
    let targetReadable: string = body.target;

    // Try user first
    const userReadable = await searchIfUser(fastify, body.target);
    if (userReadable) {
      targetReadable = userReadable;
    } else {
      // Then try admin
      const adminReadable = await searchIfAdmin(fastify, body.target);
      if (adminReadable) {
        targetReadable = adminReadable;
      }
    }

    const audit = await fastify.db.collection("audit_logs").add({
      performedBy: `${adminData.firstName} ${adminData.lastName} (${adminData.email})`,
      action: body.action,
      target: targetReadable,
      // use normalized reason to avoid writing `undefined` into Firestore
      reason: normalizedReason,
      timestamp: new Date().toISOString(),
    });

    fastify.log.info(`Successfully added an audit log`);
    return { auditId: audit.id };
  } catch (err: unknown) {
    fastify.log.error(err);
    throw new ServiceError(500, "Internal Server Error");
  }
}
