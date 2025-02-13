import { createClient } from '@supabase/supabase-js';

const getSupabaseClient = (accessToken) => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: accessToken ? {
          Authorization: `Bearer ${accessToken}`,
        } : {},
      },
    }
  );
};

// 기본 클라이언트 (인증 필요 없는 작업용)
export const supabase = getSupabaseClient();

// 인증된 클라이언트 생성 함수
export const getAuthenticatedClient = (session) => {
  if (!session?.supabaseAccessToken) {
    throw new Error('No authentication token available');
  }
  return getSupabaseClient(session.supabaseAccessToken);
}; 