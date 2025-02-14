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
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
    csrfToken: {
      name: 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === 'google') {
        try {
          // 1. Supabase Auth에서 이메일로 사용자 확인
          const { data: users, error: listError } = await supabaseAdmin.auth
            .admin
            .listUsers();

          if (listError) {
            console.error('Error checking existing user:', listError);
            return false;
          }

          let supabaseUser = users.users?.length > 0 ? users.users.filter(u => u.email == user.email)[0] : null;
          console.log('user: ', supabaseUser)

          // 1-1. 존재하지 않는 경우 새로운 사용자 생성
          if (!supabaseUser) {
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

            supabaseUser = newUser;
          }

          // 1-2. users 테이블에서 사용자 정보 확인
          const { data: existingUserData, error: checkError } = await supabaseAdmin
            .from('users')
            .select()
            .eq('email', user.email)
            .single();

          // 1-3 & 1-4. users 테이블에 정보 없으면 추가, 있으면 업데이트
          const { data: userData, error: userError } = await supabaseAdmin
            .from('users')
            .upsert({
              id: supabaseUser.id,
              email: user.email,
              name: user.name,
              avatar_url: user.image,
              google_id: user.id,
              updated_at: new Date().toISOString(),
              created_at: !existingUserData ? new Date().toISOString() : existingUserData.created_at,
              provider: 'google',
            }, {
              onConflict: 'email',
              returning: true,
            })
            .select()
            .single();

          if (userError) {
            console.error('Error upserting user data:', userError);
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