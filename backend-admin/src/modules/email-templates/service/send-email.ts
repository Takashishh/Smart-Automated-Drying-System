import type { FastifyInstance } from "fastify";
import { ServiceError } from "../../../error/service-error.js";
import { createAuditFunction } from "../../audit-logs/create-audit-log.js";

interface SendEmailParams {
  recipient: string;
  templateId: string;
  variables?: Record<string, string>;
  adminId: string;
}

export async function sendEmailService(
  fastify: FastifyInstance,
  params: SendEmailParams
) {
  try {
    // Fetch the template from Firestore
    const templateDoc = await fastify.db
      .collection("email-templates")
      .doc(params.templateId)
      .get();

    if (!templateDoc.exists) {
      throw new ServiceError(404, "Email template not found");
    }

    const template = templateDoc.data()!;

    // Replace variables in content and subject
    let content = template.content;
    let subject = template.subject;

    if (params.variables) {
      Object.keys(params.variables).forEach(key => {
        const value = params.variables![key];
        content = content.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
        subject = subject.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
      });
    }

    // Create HTML email with proper styling
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
          .content p {
            margin: 15px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Smart Automated Drying System</h1>
          </div>
          <div class="content">
            ${content.split('\n').map((line: string) => `<p>${line}</p>`).join('')}
          </div>
          <div class="footer">
            <p>This is an automated message from Smart Automated Drying System.</p>
            <p>Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send the email
    await fastify.email.sendMail({
      from: process.env.SMTP_USER || "noreply@smartdrying.com",
      to: params.recipient,
      subject: subject,
      text: content,
      html: htmlContent,
    });

    fastify.log.info(`Email sent to ${params.recipient} using template ${template.name}`);

    // Log the email in Firestore
    await fastify.db.collection("email-logs").add({
      sentBy: params.adminId,
      recipient: params.recipient,
      templateName: template.name,
      templateId: params.templateId,
      subject: subject,
      sentDate: new Date().toISOString(),
      status: 'sent',
      variables: params.variables || {},
      createdAt: new Date(),
    });

    // Create audit log
    await createAuditFunction(fastify, {
      adminId: params.adminId,
      action: "Send Email",
      target: params.recipient,
      reason: `Sent email using template: ${template.name}`,
    });

    return {
      message: "Email sent successfully",
      recipient: params.recipient,
      templateName: template.name,
    };
  } catch (err) {
    fastify.log.error({ err }, "Failed to send email");

    // Log failed email attempt
    try {
      await fastify.db.collection("email-logs").add({
        sentBy: params.adminId,
        recipient: params.recipient,
        templateId: params.templateId,
        sentDate: new Date().toISOString(),
        status: 'failed',
        error: err instanceof Error ? err.message : 'Unknown error',
        createdAt: new Date(),
      });
    } catch (logErr) {
      fastify.log.error({ err: logErr }, "Failed to log email error");
    }

    if (err instanceof ServiceError) {
      throw err;
    }

    throw new ServiceError(500, "Failed to send email");
  }
}
