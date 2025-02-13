import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import jwt from 'jsonwebtoken';
import { supabase } from '@/lib/supabase/client';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" }
      },
      async authorize(credentials) {
        try {
          const { data: { user }, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (error) throw error;
          
          return {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || user.email.split('@')[0],
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        const signingSecret = process.env.SUPABASE_JWT_SECRET;
        console.log('Signing secret available:', !!signingSecret);
        
        if (signingSecret) {
          const payload = {
            aud: "authenticated",
            exp: Math.floor(new Date(session.expires).getTime() / 1000),
            sub: token.sub,
            email: token.email,
            role: "authenticated",
          };
          session.supabaseAccessToken = jwt.sign(payload, signingSecret);
          console.log('Generated token:', !!session.supabaseAccessToken);
        }
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: "jwt",
  },
};

export default NextAuth(authOptions); 