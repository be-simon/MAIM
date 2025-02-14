import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '@/lib/supabase/admin';

// UUID 네임스페이스 생성 (고정된 값 사용)
const UUID_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === 'google') {
        try {
          // 1. Supabase Auth에 직접 사용자 생성
          const { data: { user: supabaseUser }, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
            email: user.email,
            email_verified: true,
            user_metadata: {
              name: user.name,
              avatar_url: user.image,
              provider: 'google',
            },
          });

          if (signUpError) {
            // 이미 존재하는 사용자인 경우 무시
            if (signUpError.message !== 'User already registered') {
              console.error('Supabase signup error:', signUpError);
              return false;
            }
          }

          // 2. users 테이블에 데이터 저장
          const { data: userData, error: userError } = await supabaseAdmin
            .from('users')
            .upsert({
              id: supabaseUser?.id || user.id, // 새로 생성된 ID 또는 기존 ID 사용
              email: user.email,
              name: user.name,
              avatar_url: user.image,
              google_id: user.id,
              updated_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              provider: 'google',
            }, {
              onConflict: 'email',  // email로 충돌 처리
              returning: true,
            })
            .select()
            .single();

          if (userError) {
            console.error('User data error:', userError);
            return false;
          }

          // NextAuth 사용자 ID 설정
          user.id = userData.id;
          return true;

        } catch (error) {
          console.error('Auth error:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        const signingSecret = process.env.SUPABASE_JWT_SECRET;
        
        if (signingSecret) {
          const payload = {
            aud: "authenticated",
            exp: Math.floor(new Date(session.expires).getTime() / 1000),
            sub: token.sub,
            email: token.email,
            role: "authenticated",
          };
          session.supabaseAccessToken = jwt.sign(payload, signingSecret);
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