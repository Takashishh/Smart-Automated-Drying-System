import type { FastifyInstance } from "fastify";
import { ServiceError } from "../../../error/service-error.js";
import { createAuditFunction } from "../../audit-logs/create-audit-log.js";

const ALLOWED_STATUS = ["Open", "In-Progress", "Resolved"] as const;

export async function updateTicketStatus(
  fastify: FastifyInstance,
  body: {
    adminId: string;
    ticketId: string;
    status: "Open" | "In-Progress" | "Resolved";
  }
) {
  try {
    const ticketRef = fastify.db.collection("tickets").doc(body.ticketId);
    const snapshot = await ticketRef.get();

    if (!snapshot.exists) {
      throw new ServiceError(404, "Ticket not found");
    }

    if (!ALLOWED_STATUS.includes(body.status)) {
      throw new ServiceError(400, "Invalid ticket status");
    }

    const data = snapshot.data()!;

    if (data.status === body.status) {
      throw new ServiceError(400, "Idempotent operation");
    }

    if (data.status === "Resolved") {
      throw new ServiceError(400, "Resolved tickets cannot be updated");
    }

    await ticketRef.update({
      status: body.status,
      updatedAt: new Date()
    });

    // Attempt to create an audit log but don't fail the whole operation if audit logging errors
    try {
      await createAuditFunction(fastify, {
        adminId: body.adminId,
        action: "Ticket Status Updated",
        target: body.ticketId
      });
    } catch (auditErr) {
      fastify.log.warn({ err: auditErr }, 'Failed to create audit log for ticket status update');
    }

    return {
      ticketId: body.ticketId,
      status: body.status
    };
  } catch (err) {
    if (err instanceof ServiceError) {
      throw err;
    }

    fastify.log.error(err);
    throw new ServiceError(500, "Internal Server Error");
  }
}
