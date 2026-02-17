import { Type, type Static } from "@sinclair/typebox";
export const signinReq = Type.Object({
    idToken: Type.String()
});
export type SigninReq = Static<typeof signinReq>;
// export const signinReq = Type.Object({
//   email: Type.String({
//     pattern: "^[A-Za-z0-9._%+-]+@gmail\\.com$"
//   }),
//   password: Type.String({
//     minLength: 8,
//     maxLength: 50,
//     pattern: "^(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-={}\\[\\]|:;\"'<>,.?/]).+$"
//   })
// });

// export type SigninReq = Static<typeof signinReq>;

export const createAdminAccountSchema = Type.Object({
  firstName: Type.Optional(
    Type.String({
      minLength: 2,
      maxLength: 64,
      pattern: "^[A-Za-z]+$"
    })
  ),
  lastName: Type.Optional(
    Type.String({
      minLength: 2,
      maxLength: 64,
      pattern: "^[A-Za-z]+$" 
    })
  ),
  middleName: Type.Optional(
    Type.String()
  ),
  email: Type.String({
    format: "email"
  }),
  password: Type.String({
    minLength: 8,
    maxLength: 50,
    pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\-={}\\[\\]|:;\"'<>,.?/]).+$"
  }),
  confirmPassword: Type.String({
    minLength: 8,
    maxLength: 50
  })
});

export type createAdminAccountType = Static<typeof createAdminAccountSchema>;

// Pagination query schema
export const paginationQuerySchema = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 10 }))
});

export type PaginationQuery = Static<typeof paginationQuerySchema>;

// Pagination response metadata
export interface PaginationMetadata {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}