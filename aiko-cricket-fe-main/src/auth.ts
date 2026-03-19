import NextAuth, { type DefaultSession } from "next-auth";
import Auth0 from "next-auth/providers/auth0";

declare module "next-auth" {
  interface Session {
    user: {
      /** The user's unique identifier. */
      id: string;
      sub: string;
      /** Auth0 profile properties */
      "http://localhost:3000/roles"?: string[];
      nickname?: string;
      name?: string;
      picture?: string;
      updated_at?: string;
      email?: string;
      email_verified?: boolean;
      iss?: string;
      aud?: string;
      iat?: number;
      exp?: number;
      sid?: string;
      /**
       * By default, TypeScript merges new interface properties and overwrites existing ones.
       * In this case, the default session user properties will be overwritten,
       * with the new ones defined above. To keep the default session user properties,
       * you need to add them back into the newly declared interface.
       */
    } & DefaultSession["user"];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Auth0({
      clientId: process.env.AUTH_AUTH0_ID!,
      clientSecret: process.env.AUTH_AUTH0_SECRET!,
      issuer: process.env.AUTH0_ISSUER!,
    }),
  ],
  trustHost: true,
  callbacks: {
    jwt({ token, profile }) {
      if (profile) {
        token.id = (profile.sub as string) ?? token.id;
        token.user = profile;
      }
      return token;
    },
    session({ session, token }) {
      if (token.user) {
        Object.assign(session.user, token.user);
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
