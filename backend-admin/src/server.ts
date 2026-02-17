import Fastify from "fastify";      
import dotenv from 'dotenv'
import firebasePlug from "./plugin/firebase-plug.js";
import emailPlugin from './plugin/nodemailer-plug.js'
import cors from '@fastify/cors'
import { adminRoutes } from "./shared/router/index.js";
import { userModRoutes } from "./modules/user/router/index.js";
import { userAuthRoutes } from "./modules/user/router/auth-routes.js";
import { deviceModRouter } from "./modules/device/router/index.js";
import { auditModRouter } from "./modules/audit-logs/router/index.js";
import { dashboardModRoute } from "./shared/dashboard/router/index.js";
import { ticketsRouter } from "./modules/tickets/router/index.js";
import { emailTemplatesRouter } from "./modules/email-templates/router/index.js";
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';


dotenv.config();

const server = Fastify({ logger: true }).withTypeProvider<TypeBoxTypeProvider>();

if (!process.env.HTTP_PORT || !process.env.HOST) {
  server.log.error("Missing required environment variables");
  console.log(String(process.env.HTTP_PORT));
  console.log(String(process.env.HOST));
  process.exit(1);
}

server.register(firebasePlug);
await server.register(emailPlugin, {
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  user: "jefsohandsome1@gmail.com",      
  pass: "atdxricoakiwnbcw",              
});
server.register(ticketsRouter, {prefix:  "/tickets"})
server.register(userModRoutes, {prefix: "/users"});
server.register(userAuthRoutes, {prefix: "/api/auth"});
server.register(deviceModRouter, {prefix: "/devices"});
server.register(auditModRouter, {prefix: "/audit-logs"});
server.register(adminRoutes, {prefix: "/admin"});
server.register(dashboardModRoute, {prefix: "/dashboard"})
server.register(emailTemplatesRouter, {prefix: "/email-templates"})
const PORT = Number(process.env.HTTP_PORT);
const HOST = process.env.HOST as string;

await server.register(cors, {
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
})

try {
  await server.listen({
    port: PORT,
    host: HOST,
  });
  server.log.info(`Server running at http://${HOST}:${PORT}`);
} catch (err) {
  server.log.error(err);
  process.exit(1);
}