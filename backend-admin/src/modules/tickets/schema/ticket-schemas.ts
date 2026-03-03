import { Type, type Static } from "@sinclair/typebox";

export const CreateTicketBody = Type.Object({
  userId: Type.String(),
  description: Type.String({ minLength: 1 }),
  issueType: Type.String({ minLength: 1 }),
});

export type CreateTicketBodyType = Static<typeof CreateTicketBody>;

export const UpdateTicketStatusBody = Type.Object({
  ticketId: Type.String(),
  status: Type.Union([
    Type.Literal("Open"),
    Type.Literal("In-Progress"),
    Type.Literal("Resolved")
  ])
});

export type UpdateTicketStatusBodyType = Static<typeof UpdateTicketStatusBody>;

export const DeleteTicketBody = Type.Object({
  ticketId: Type.String()
});

export type DeleteTicketBodyType = Static<typeof DeleteTicketBody>;

export const GetTicketsQuery = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 10 })),
  userId: Type.Optional(Type.String({ minLength: 1 })),
});

export type GetTicketsQueryType = Static<typeof GetTicketsQuery>;

