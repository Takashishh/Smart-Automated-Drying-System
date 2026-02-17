import type { FastifyInstance } from 'fastify';
import { ServiceError } from '../../error/service-error.js';
import { createAuditFunction } from '../../modules/audit-logs/create-audit-log.js';

export async function updateAdminStatus(
  fastify: FastifyInstance,
  adminUid: string,
  newStatus: 'active' | 'disabled',
  performedBy: string,
  reason?: string
) {
  try {
    const adminRef = await fastify.db.collection('admins').doc(adminUid).get();
    if (!adminRef.exists) {
      throw new ServiceError(404, 'Admin not found');
    }

    const adminData = adminRef.data() || {};
    if (adminData.role === 'super-admin' && newStatus === 'disabled') {
      throw new ServiceError(403, 'Cannot disable super-admin accounts');
    }

    // Update Firebase Auth to disable/enable the user
    await fastify.firebaseAuthSdk.updateUser(adminUid, { disabled: newStatus === 'disabled' });

    // Update Firestore status field
    await fastify.db.collection('admins').doc(adminUid).update({
      status: newStatus,
      updatedAt: new Date().toISOString()
    });

    // Create audit log (non-fatal)
    try {
      await createAuditFunction(fastify, {
        adminId: performedBy,
        action: newStatus === 'disabled' ? 'Admin Disabled' : 'Admin Enabled',
        target: adminData.adminId ?? adminUid,
        reason: reason ?? ''
      });
    } catch (e) {
      fastify.log.warn({ err: e }, 'Failed to create audit log for admin status change');
    }

    const updatedRef = await fastify.db.collection('admins').doc(adminUid).get();
    return updatedRef.data();
  } catch (err: unknown) {
    if (err instanceof ServiceError) throw err;
    fastify.log.error(err);
    throw new ServiceError(500, 'Failed to update admin status');
  }
}
