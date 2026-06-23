import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getDb } from "./mongo";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  pages: { signIn: "/staff/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (creds) => {
        const email = String(creds?.email ?? "").trim().toLowerCase();
        const password = String(creds?.password ?? "");
        if (!email || !password) return null;
        const db = await getDb();
        const user = await db.collection("users").findOne({ email });
        if (!user) return null;
        const ok = await bcrypt.compare(password, user.passwordHash as string);
        if (!ok) return null;
        return { id: String(user._id), email: user.email as string };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.email = user.email;
      return token;
    },
    async session({ session, token }) {
      if (token?.email) session.user = { ...(session.user ?? {}), email: token.email as string };
      return session;
    },
  },
});

export async function requireStaff() {
  const session = await auth();
  if (!session?.user?.email) return null;
  return session;
}
