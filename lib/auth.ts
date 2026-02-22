import { type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import StravaProvider from "next-auth/providers/strava";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./db";
import { verifyMessage } from "viem";

export const authOptions: NextAuthOptions = {
  adapter: {
    ...PrismaAdapter(prisma),
    linkAccount: async (account: any) => {
      // Remove athlete field from Strava OAuth response before saving
      const { athlete, ...accountData } = account;
      return prisma.account.create({ data: accountData });
    },
  } as any,
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "BNB Chain",
      credentials: {
        address: { label: "Address", type: "text" },
        message: { label: "Message", type: "text" },
        signature: { label: "Signature", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.address || !credentials.message || !credentials.signature) {
          return null;
        }
        try {
          const isValid = await verifyMessage({
            address: credentials.address as `0x${string}`,
            message: credentials.message,
            signature: credentials.signature as `0x${string}`,
          });
          if (!isValid) return null;
        } catch {
          return null;
        }

        const user = await prisma.user.upsert({
          where: { walletAddress: credentials.address },
          update: {},
          create: {
            walletAddress: credentials.address,
            name: `${credentials.address.slice(0, 6)}...${credentials.address.slice(-4)}`,
          },
        });
        return { id: user.id, name: user.name, walletAddress: user.walletAddress };
      },
    }),
    StravaProvider({
      clientId: process.env.STRAVA_CLIENT_ID ?? "",
      clientSecret: process.env.STRAVA_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          scope: "read,activity:read_all",
          approval_prompt: "auto",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.userId = user.id;
        token.walletAddress = (user as any).walletAddress;
      }
      if (account?.provider === "strava") {
        token.stravaAccessToken = account.access_token;
        token.stravaRefreshToken = account.refresh_token;
        token.stravaTokenExpiry = account.expires_at;
        // Link Strava to existing user session
        if (token.userId) {
          await prisma.user.update({
            where: { id: token.userId as string },
            data: {
              stravaAccessToken: account.access_token,
              stravaRefreshToken: account.refresh_token as string,
              stravaTokenExpiry: account.expires_at
                ? new Date((account.expires_at as number) * 1000)
                : null,
              stravaConnected: true,
            },
          });
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        (session.user as any).walletAddress = token.walletAddress;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      walletAddress?: string | null;
    };
  }
}
