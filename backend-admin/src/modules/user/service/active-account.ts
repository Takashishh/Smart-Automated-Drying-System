
// activate-account.service.ts
import type { FastifyInstance } from "fastify";
import { ServiceError } from "../../../error/service-error.js";
import type { disableUserAccountService } from "../schemas/disable-account-schema.js";
import { createAuditFunction } from "../../audit-logs/create-audit-log.js";

export async function activateUserAccount(
    fastify: FastifyInstance,
    body: disableUserAccountService
){
    try{

        fastify.log.info(`Received reason in the service: ${body.reason}`)

        fastify.log.info(`[ACTIVATE] Starting activation for userId: ${body.userId} by adminId: ${body.adminId}`);
        
        const userRef = await fastify.db.collection('users').doc(body.userId).get();
        if(!userRef.exists){
            fastify.log.error(`[ACTIVATE] User not found: ${body.userId}`);
            throw new ServiceError(404, "User not found")
        }
        fastify.log.info(`[ACTIVATE] User found in Firestore`);

        const adminRef = await fastify.db.collection('admins').doc(body.adminId).get();
        if(!adminRef.exists){
            fastify.log.error(`[ACTIVATE] Admin not found: ${body.adminId}`);
            throw new ServiceError(404, "Admin not found")
        }
        fastify.log.info(`[ACTIVATE] Admin verified`);

        // Update Firebase Auth
        fastify.log.info(`[ACTIVATE] Updating Firebase Auth to enable user`);
        await fastify.firebaseAuthSdk.updateUser(body.userId, {disabled: false})
        fastify.log.info(`[ACTIVATE] User enabled in Firebase Auth`);
        
        // Update Firestore status field
        fastify.log.info(`[ACTIVATE] Updating Firestore status field to 'activated'`);
        await fastify.db.collection('users').doc(body.userId).update({
            status: 'activated',
            updatedAt: new Date().toISOString()
        });
        fastify.log.info(`[ACTIVATE] Firestore status updated successfully`);
        
        fastify.log.info(`[ACTIVATE] Creating audit log`);
        await createAuditFunction(fastify, {
            adminId: body.adminId,
            action: "User Activated",
            target: body.userId,
            reason: body.reason ?? ""
        })
        fastify.log.info(`[ACTIVATE] Audit log created successfully`);
        
        fastify.log.info(`[ACTIVATE] User activation completed successfully`);
        return;
    }catch(err: unknown){
        fastify.log.error(`[ACTIVATE] Error during activation: ${err}`);
        if(err instanceof ServiceError){
            throw err;
        }
        throw new ServiceError(500, "Internal Server Error")
    }
}