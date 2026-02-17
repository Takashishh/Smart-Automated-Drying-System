import type { FastifyInstance } from "fastify";
import { createAdminAccountSchema, signinReq } from "../schema.js";
import { SignInController } from "../controller/signin-controller.js";
import { firebaseAuthPreHandler } from "../../plugin/firebase-plug.js";
import { createAdminAccountController } from "../controller/create-admin-controller.js";
import { verifyEmailAdminController } from "../controller/verifyAdminController.js";
import { getAdminsController } from "../controller/get-admins-controller.js";
import { updateAdminProfileController } from "../controller/update-admin-profile-controller.js";
import { updateAdminStatusController } from "../controller/update-admin-status-controller.js";
import { changePasswordController } from "../controller/change-password-controller.js";

export function adminRoutes(fastify: FastifyInstance) {
  // Signin route
  fastify.route({
    url: "/signin",
    method: "POST",
    schema: {
      body: signinReq,
    },
    handler: SignInController,
  });

  // Create admin route
  fastify.route({
    url: "/create-admin",
    method: "POST",
    schema: {
      body: createAdminAccountSchema,
    },
    preHandler: firebaseAuthPreHandler,
    handler: createAdminAccountController,
  });

  // Get admins route
  fastify.route({
    url: "/get-admins",
    method: "GET",
    preHandler: firebaseAuthPreHandler,
    handler: getAdminsController,
  });

  // Verify email route
  fastify.route({
    url: "/verify-email",
    method: "POST",
    schema: {
      body: {
        type: "object",
        required: ["email"],
        properties: {
          email: { type: "string", format: "email" },
        },
      },
    },
    handler: verifyEmailAdminController,
  });

  // Update profile route
  fastify.route({
    url: "/update-profile",
    method: "PUT",
    schema: {
      body: {
        type: "object",
        properties: {
          firstName: { type: "string" },
          lastName: { type: "string" },
          middleName: { type: "string" },
          phoneNumber: { type: "string" },
          address: { type: "string" },
        },
      },
    },
    preHandler: firebaseAuthPreHandler,
    handler: updateAdminProfileController,
  });

  // Toggle admin status (enable/disable)
  fastify.route({
    url: "/toggle-status",
    method: "POST",
    preHandler: firebaseAuthPreHandler,
    handler: updateAdminStatusController,
  });

  // Change password route
  fastify.route({
    url: "/change-password",
    method: "POST",
    schema: {
      body: {
        type: "object",
        required: ["currentPassword", "newPassword"],
        properties: {
          currentPassword: { type: "string" },
          newPassword: { type: "string" },
        },
      },
    },
    preHandler: firebaseAuthPreHandler,
    handler: changePasswordController,
  });
}
