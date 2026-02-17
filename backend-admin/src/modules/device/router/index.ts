import type { FastifyInstance } from "fastify";
import { firebaseAuthPreHandler } from "../../../plugin/firebase-plug.js";
import { assignDeviceController } from "../controller/assign-device-controller.js";
import { createDeviceController } from "../controller/create-device-controller.js";
import { deleteDeviceController } from "../controller/delete-device-controller.js";

import { deleteDevice } from "../schema/device-id.js";
import { deviceId } from "../schema/device-id.js";
import { macId } from "../schema/device-id.js";
import { assignDeviceReq } from "../schema/assign-device.js";
import { updateDeviceReq } from "../schema/update-device-req.js";
import { getDeviceInfoController } from "../controller/get-device-info-controller.js";
import { getDevicesController } from "../controller/get-devices-controller.js";
import { unassignDeviceController } from "../controller/unassign-device-controller.js";
import { updateDeviceMacId } from "../controller/update-device-id.js";
import { paginationQuerySchema } from "../../../shared/schema.js";


export function deviceModRouter(fastify: FastifyInstance){
    fastify.route({
        url: "/assign-device",
        method: 'POST',
        schema: {
            body: assignDeviceReq
        }, preHandler: firebaseAuthPreHandler,
        handler: assignDeviceController
    })

    fastify.route({
        url: '/create-device',
        method: 'POST',
        schema: {
            body: macId
        }, preHandler: firebaseAuthPreHandler,
        handler: createDeviceController
    })

    fastify.route({
        url: "/delete-device",
        method: "POST",
        schema: {
            body: deleteDevice
        }, preHandler: firebaseAuthPreHandler,
        handler: deleteDeviceController
    })

    fastify.route({
        url: "/get-device-info",
        method: 'POST',
        schema: {
            body: deviceId
        }, preHandler: firebaseAuthPreHandler,
        handler: getDeviceInfoController
    })

    fastify.route({
        url: "/get-devices",
        method: "GET",
        schema: {
            querystring: paginationQuerySchema,
        },
        handler: getDevicesController
    })

    fastify.route({
        url: "/unassign-device",
        method: 'POST',
        schema: {
            body: assignDeviceReq
        }, preHandler: firebaseAuthPreHandler,
        handler: unassignDeviceController
    })
    
    fastify.route({
        url: "/update-device",
        method: 'POST',
        schema: {
            body: updateDeviceReq
        }, preHandler: firebaseAuthPreHandler,
        handler: updateDeviceMacId
    })

}