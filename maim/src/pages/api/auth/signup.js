import { supabase } from '@/lib/supabase/client';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password, name } = req.body;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) throw error;

    return res.status(200).json({ message: '회원가입이 완료되었습니다' });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(400).json({ 
      message: error.message || '회원가입에 실패했습니다' 
    });
  }
} 