import { Type, type Static } from "@sinclair/typebox";

export const SendEmailBody = Type.Object({
  recipient: Type.String({ format: "email" }),
  templateId: Type.String(),
  variables: Type.Optional(Type.Record(Type.String(), Type.String())),
  adminId: Type.String(),
});

export type SendEmailBodyType = Static<typeof SendEmailBody>;

export const GetTemplatesQuery = Type.Object({
  category: Type.Optional(Type.String()),
  page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 10 })),
});

export type GetTemplatesQueryType = Static<typeof GetTemplatesQuery>;
