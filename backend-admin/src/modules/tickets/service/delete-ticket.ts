import type { FastifyInstance } from "fastify";
import { ServiceError } from "../../../error/service-error.js";
import { createAuditFunction } from "../../audit-logs/create-audit-log.js";

export async function deleteTickets(
  fastify: FastifyInstance,
  body: {
    adminId: string;
    ticketId: string;
  }
) {
  try {
    const ticketRef = fastify.db.collection("tickets").doc(body.ticketId);
    const snapshot = await ticketRef.get();

    if (!snapshot.exists) {
      throw new ServiceError(404, "Ticket not found");
    }

    const data = snapshot.data()!;

    await ticketRef.delete();

    // Attempt to create an audit log but don't fail the whole operation if audit logging errors
    try {
      const ticketTarget = `Ticket #${body.ticketId.slice(0, 8)} - ${data.userName || 'Unknown'} (${data.email || 'N/A'})`;
      await createAuditFunction(fastify, {
        adminId: body.adminId,
        action: "Ticket Deleted",
        target: ticketTarget
      });
    } catch (auditErr) {
      fastify.log.warn({ err: auditErr }, 'Failed to create audit log for ticket delete');
    }

    return {
      ticketId: body.ticketId,
      deleted: true
    };
  } catch (err) {
    if (err instanceof ServiceError) {
      throw err;
    }

    fastify.log.error(err);
    throw new ServiceError(500, "Internal Server Error");
  }
}
