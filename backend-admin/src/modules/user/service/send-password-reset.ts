// send-password-reset.service.ts
import type { FastifyInstance } from "fastify";
import { ServiceError } from "../../../error/service-error.js";
import { createAuditFunction } from "../../audit-logs/create-audit-log.js";

export async function sendUserPasswordReset(
  fastify: FastifyInstance,
  body: { adminId: string; userId: string, reason: string }
) {
  try {
    fastify.log.info(`[PASSWORD_RESET] Starting password reset for userId: ${body.userId} by adminId: ${body.adminId}`);
    
    // Check if user exists in Firestore
    const userRef = await fastify.db.collection("users").doc(body.userId).get();
    if (!userRef.exists) {
      fastify.log.error(`[PASSWORD_RESET] User not found: ${body.userId}`);
      throw new ServiceError(404, "User not found");
    }
    fastify.log.info(`[PASSWORD_RESET] User found in Firestore`);

    const userData = userRef.data();
    if (!userData?.email) {
      fastify.log.error(`[PASSWORD_RESET] User has no email: ${body.userId}`);
      throw new ServiceError(400, "User has no email");
    }
    fastify.log.info(`[PASSWORD_RESET] User email found: ${userData.email}`);

    // Generate password reset link via Firebase Admin
    fastify.log.info(`[PASSWORD_RESET] Generating password reset link`);
    const link = await fastify.firebaseAuthSdk.generatePasswordResetLink(userData.email);
    fastify.log.info(`[PASSWORD_RESET] Password reset link generated successfully`);

    // Send password reset email
    fastify.log.info(`[PASSWORD_RESET] Sending password reset email`);
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #ffffff;
              padding: 30px;
              border: 1px solid #e0e0e0;
              border-top: none;
            }
            .footer {
              background: #f5f5f5;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background-color: #667eea;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Dear ${userData.firstName || 'User'},</p>
              <p>We received a request to reset your password for your Smart Automated Drying System account.</p>
              <p>Click the button below to reset your password:</p>
              <div style="text-align: center;">
                <a href="${link}" class="button">Reset Password</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${link}</p>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul style="margin: 5px 0;">
                  <li>This link will expire in 1 hour for security purposes</li>
                  <li>If you didn't request a password reset, please ignore this email</li>
                  <li>Contact support immediately if you suspect unauthorized access</li>
                </ul>
              </div>
              <p>If you have any questions or concerns, please contact our support team.</p>
              <p>Best regards,<br/>The Smart Drying Team</p>
            </div>
            <div class="footer">
              <p>This is an automated message from Smart Automated Drying System.</p>
              <p>Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const textContent = `Password Reset Request

Dear ${userData.firstName || 'User'},

We received a request to reset your password for your Smart Automated Drying System account.

Click the link below to reset your password:
${link}

⚠️ SECURITY NOTICE:
- This link will expire in 1 hour for security purposes
- If you didn't request a password reset, please ignore this email
- Contact support immediately if you suspect unauthorized access

If you have any questions or concerns, please contact our support team.

Best regards,
The Smart Drying Team

---
This is an automated message from Smart Automated Drying System.
Please do not reply to this email.`;

      await fastify.email.sendMail({
        from: process.env.SMTP_USER || "noreply@smartdrying.com",
        to: userData.email,
        subject: "Password Reset Request - Smart Drying System",
        text: textContent,
        html: htmlContent,
      });

      fastify.log.info(`[PASSWORD_RESET] Email sent successfully to ${userData.email}`);

      // Log the email in Firestore
      await fastify.db.collection("email-logs").add({
        sentBy: body.adminId,
        recipient: userData.email,
        templateName: "Password Reset",
        subject: "Password Reset Request - Smart Drying System",
        sentDate: new Date().toISOString(),
        status: 'sent',
        createdAt: new Date(),
      });

      fastify.log.info(`[PASSWORD_RESET] Email logged in Firestore`);
    } catch (emailError) {
      fastify.log.error({ err: emailError }, "[PASSWORD_RESET] Failed to send email");
      // Continue even if email fails - user can still use the link generated
    }

    fastify.log.info(`[PASSWORD_RESET] Creating audit log`);
    await createAuditFunction(fastify, {
        adminId: body.adminId,
        action: "User send password reset link",
        target: body.userId,
        reason: body.reason
    })
    fastify.log.info(`[PASSWORD_RESET] Audit log created successfully`);
    
    fastify.log.info(`[PASSWORD_RESET] Password reset completed successfully for user ${body.userId}`);

    return { message: "Password reset link generated successfully", link };
  } catch (err: unknown) {
    fastify.log.error(`[PASSWORD_RESET] Error sending password reset: ${err}`);
    if(err instanceof ServiceError){
      throw err;
    }
    throw new ServiceError(500, "Internal Server Error");
  }
}