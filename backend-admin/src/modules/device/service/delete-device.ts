import type { FastifyInstance } from "fastify";
import { ServiceError } from "../../../error/service-error.js";
import { createAuditFunction } from "../../audit-logs/create-audit-log.js";

export async function deleteDeviceService(
  fastify: FastifyInstance,
  body: {
    id: string,
    adminId: string,
    reason: string
  }
) {
  try {
    const docRef = fastify.db.collection("devices").doc(body.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new ServiceError(404, "Device not found");
    }

    const deviceData = doc.data();

    await createAuditFunction(fastify, {
        adminId: body.adminId,
        action: "device deleted",
        target: deviceData!.macId,
        reason: body.reason
    })

    await docRef.delete();

    return { deletedDeviceId: body.id };
  } catch (err: unknown) {
    fastify.log.error(err);
    throw new ServiceError(500, "Internal Server Error");
  }
}
