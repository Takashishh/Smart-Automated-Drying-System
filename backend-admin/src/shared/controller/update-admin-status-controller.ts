import type { FastifyRequest, FastifyReply } from 'fastify';
import { updateAdminStatus } from '../service/update-admin-status.js';
import { ServiceError } from '../../error/service-error.js';

export async function updateAdminStatusController(
  req: FastifyRequest,
  reply: FastifyReply
) {
  try {
    if (!req.user?.uid) {
      throw new ServiceError(401, 'Unauthorized');
    }

    const { adminUid, status, reason } = req.body as { adminUid?: string; status?: string; reason?: string };
    if (!adminUid || !status) {
      throw new ServiceError(400, 'adminUid and status are required');
    }

    const updated = await updateAdminStatus(req.server, adminUid, status as 'active' | 'disabled', req.user.uid, reason);

    return reply.code(200).send({ message: 'Admin status updated', data: updated });
  } catch (err: unknown) {
    if (err instanceof ServiceError) {
      return reply.code(err.statusCode).send({ message: err.message });
    }
    req.log.error(err);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
}
