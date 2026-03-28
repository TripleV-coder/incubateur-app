import { UserRole, Tier } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: UserRole;
    tier?: Tier;
    isActive?: boolean;
  }

  interface Session {
    user: {
      id: string;
      role?: UserRole;
      tier?: Tier;
      isActive?: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    tier?: Tier;
    isActive?: boolean;
  }
}
