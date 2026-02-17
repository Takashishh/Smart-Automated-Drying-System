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
 * Search for a ticket by ID and return its readable string
 */
export async function searchIfTicket(fastify: FastifyInstance, targetId: string) {
  const ticketDoc = await fastify.db.collection("tickets").doc(targetId).get();
  if (!ticketDoc.exists) return null;

  const data = ticketDoc.data()!;
  return `Ticket #${targetId.slice(0, 8)} - ${data.userName || data.email || 'Unknown'} (${data.issueType || 'General'})`;
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
    // If target is already pre-formatted (starts with "Ticket #"), keep it as is
    let targetReadable: string = body.target;

    if (!targetReadable.startsWith("Ticket #")) {
      // Try ticket first (for ticket-related actions)
      const ticketReadable = await searchIfTicket(fastify, body.target);
      if (ticketReadable) {
        targetReadable = ticketReadable;
      } else {
        // Try user next
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
      }
    }

    // Build the audit object, only including reason if it has a value
    const auditData: Record<string, any> = {
      performedBy: `${adminData.firstName} ${adminData.lastName} (${adminData.email})`,
      action: body.action,
      target: targetReadable,
      timestamp: new Date().toISOString(),
    };
    
    // Only include reason field if it has a value
    if (normalizedReason) {
      auditData.reason = normalizedReason;
    }

    const audit = await fastify.db.collection("audit_logs").add(auditData);

    fastify.log.info(`Successfully added an audit log`);
    return { auditId: audit.id };
  } catch (err: unknown) {
    fastify.log.error(err);
    throw new ServiceError(500, "Internal Server Error");
  }
}
