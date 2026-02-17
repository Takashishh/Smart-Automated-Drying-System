import type { FastifyInstance } from "fastify";
import { ServiceError } from "../../../error/service-error.js";
import type { disableUserAccountService } from "../schemas/disable-account-schema.js";
import { createAuditFunction } from "../../audit-logs/create-audit-log.js";

export async function disableUserAccount(
    fastify: FastifyInstance,
    body: disableUserAccountService
){
    try{
        fastify.log.info(`[DISABLE] Starting disable for userId: ${body.userId} by adminId: ${body.adminId}`);
        
        const userRef = await fastify.db.collection('users').doc(body.userId).get();
        if(!userRef.exists){
            fastify.log.error(`[DISABLE] User not found: ${body.userId}`);
            throw new ServiceError(404, "User not found")
        }
        fastify.log.info(`[DISABLE] User found in Firestore`);

        const adminRef = await fastify.db.collection('admins').doc(body.adminId).get();
        if(!adminRef.exists){
            fastify.log.error(`[DISABLE] Admin not found: ${body.adminId}`);
            throw new ServiceError(404, "Admin not found")
        }
        fastify.log.info(`[DISABLE] Admin verified`);

        // Update Firebase Auth
        fastify.log.info(`[DISABLE] Updating Firebase Auth to disable user`);
        await fastify.firebaseAuthSdk.updateUser(body.userId, {disabled: true})
        fastify.log.info(`[DISABLE] User disabled in Firebase Auth`);
        
        // Update Firestore status field
        fastify.log.info(`[DISABLE] Updating Firestore status field to 'disabled'`);
        await fastify.db.collection('users').doc(body.userId).update({
            status: 'disabled',
            updatedAt: new Date().toISOString()
        });
        fastify.log.info(`[DISABLE] Firestore status updated successfully`);
        
        fastify.log.info(`[DISABLE] Creating audit log`);
        await createAuditFunction(fastify, {
            adminId: body.adminId,
            action: "User Disabled",
            target: body.userId,
            reason: body.reason ?? ""
        })
        fastify.log.info(`[DISABLE] Audit log created successfully`);
        
        fastify.log.info(`[DISABLE] User disable completed successfully`);
        return;
    }catch(err: unknown){
        fastify.log.error(`[DISABLE] Error during disable: ${err}`);
        if(err instanceof ServiceError){
            throw err;
        }
        throw new ServiceError(500, "Internal Server Error")
    }
}