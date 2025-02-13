import { supabase } from '@/lib/supabase/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. NextAuth 서버 세션 가져오기
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 2. Supabase 세션 설정
    const { data, error } = await supabase.auth.setSession({
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
    });

    if (error) {
      throw error;
    }

    return res.status(200).json({ session: data.session });
  } catch (error) {
    console.error('Error initializing session:', error);
    return res.status(500).json({ error: error.message });
  }
} 