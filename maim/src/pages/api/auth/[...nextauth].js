import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          email: profile.email,
          name: profile.name,
          image: profile.picture,
        }
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === 'google') {
        try {
          // 1. users 테이블에서 이메일로 사용자 확인
          const { data: existingUser, error: checkError } = await supabaseAdmin
            .from('users')
            .select()
            .eq('email', user.email)
            .single();

          if (checkError && checkError.code !== 'PGRST116') {
            console.error('Error checking existing user:', checkError);
            return false;
          }

          // 새 사용자인 경우
          if (!existingUser) {
            // Supabase Auth에 사용자 생성
            const { data: { user: newUser }, error: createError } = await supabaseAdmin.auth.admin.createUser({
              email: user.email,
              email_verified: true,
              user_metadata: {
                name: user.name,
                avatar_url: user.image,
                provider: 'google',
              },
            });

            if (createError) {
              console.error('Error creating user:', createError);
              return false;
            }

            // users 테이블에 사용자 정보 저장
            const { data: userData, error: userError } = await supabaseAdmin
              .from('users')
              .insert({
                id: newUser.id,
                email: user.email,
                name: user.name,
                avatar_url: user.image,
                google_id: user.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                provider: 'google',
              })
              .select()
              .single();

            if (userError) {
              console.error('Error inserting user data:', userError);
              return false;
            }

            user.id = userData.id;
          } else {
            // 기존 사용자 정보 업데이트
            const { data: userData, error: userError } = await supabaseAdmin
              .from('users')
              .update({
                name: user.name,
                avatar_url: user.image,
                google_id: user.id,
                updated_at: new Date().toISOString(),
              })
              .eq('email', user.email)
              .select()
              .single();

            if (userError) {
              console.error('Error updating user data:', userError);
              return false;
            }

            user.id = userData.id;
          }

          return true;
        } catch (error) {
          console.error('Auth error:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // 최초 로그인 시에만 user와 account가 제공됨
      if (account && user) {
        return {
          ...token,
          userId: user.id,
          provider: account.provider,
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        // JWT 토큰에서 Supabase 액세스 토큰 생성
        const signingSecret = process.env.SUPABASE_JWT_SECRET;
        if (signingSecret) {
          const payload = {
            aud: "authenticated",
            exp: Math.floor(new Date(session.expires).getTime() / 1000),
            sub: token.userId,
            email: token.email,
            role: "authenticated",
          };
          session.supabaseAccessToken = jwt.sign(payload, signingSecret);
        }
        
        // 세션에 사용자 ID 추가
        session.user.id = token.userId;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      try {
        // 상대 경로인 경우 baseUrl과 결합
        const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
        const urlObj = new URL(fullUrl);
        
        // auth 경로인지 체크
        if (urlObj.pathname.startsWith('/auth')) {
          return baseUrl;
        }
        
        // callbackUrl 파라미터가 auth를 포함하는지 체크
        const callbackUrl = urlObj.searchParams.get('callbackUrl');
        if (callbackUrl) {
          const callbackUrlObj = new URL(callbackUrl);
          if (callbackUrlObj.pathname.startsWith('/auth')) {
            return baseUrl;
          }
        }
        
        return url.startsWith(baseUrl) ? url : baseUrl;
      } catch (error) {
        console.error('Redirect error:', error);
        return baseUrl;
      }
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions); 