import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;


export async function refreshToken() {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  try {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      session: data.session,
      user: data.user
    };
  } catch (error) {
    console.error('Token refresh error:', error);
    throw new Error(error.message || 'Token refresh failed');
  }
}


export function isTokenExpired(session) {
  if (!session?.expires_at) return true;
  
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = session.expires_at;
  
  
  return (expiresAt - now) < 300;
}


export async function withTokenRefresh(requestFunction) {
  try {
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      throw new Error('Failed to get session');
    }

    
    if (session && isTokenExpired(session)) {
      console.log('Token expired, refreshing...');
      await refreshToken();
    }

    
    return await requestFunction();
  } catch (error) {
    
    if (error.message.includes('JWT') || error.message.includes('token')) {
      console.log('Request failed, attempting token refresh...');
      try {
        await refreshToken();
        return await requestFunction();
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        throw new Error('Authentication failed. Please sign in again.');
      }
    }
    throw error;
  }
}
