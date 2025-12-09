
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;


const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;




const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  
  
  let deviceType = 'desktop';
  if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    deviceType = 'mobile';
  } else if (/iPad|Tablet/i.test(userAgent)) {
    deviceType = 'tablet';
  }
  
  
  let browser = 'unknown';
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';
  else if (userAgent.includes('Opera')) browser = 'Opera';
  
  
  let os = 'unknown';
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac OS')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';
  
  
  const screenResolution = `${window.screen.width}x${window.screen.height}`;
  
  
  const language = navigator.language || navigator.userLanguage;
  
  return {
    device_type: deviceType,
    browser: browser,
    os: os,
    platform: platform,
    screen_resolution: screenResolution,
    language: language,
    user_agent: userAgent
  };
};

export async function signup(payload) {
  if (!supabase) {
    throw new Error('Supabase not configured. Please check your environment variables.');
  }

  try {
    const { email, password, first_name, last_name, signup_source } = payload;
    
    
    const deviceInfo = getDeviceInfo();
    const enhancedSignupSource = `${signup_source || 'web'}_${deviceInfo.device_type}_${deviceInfo.browser}_${deviceInfo.os}`;
    
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name,
          last_name,
          signup_source: enhancedSignupSource,
          device_info: deviceInfo
        }
      }
    });

    if (error) {
      console.error('Supabase auth error:', error);
      throw new Error(error.message);
    }

    
    if (data.user) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([
          {
            id: data.user.id,
            email: data.user.email,
            first_name,
            last_name,
            signup_source: enhancedSignupSource,
            device_info: deviceInfo,
          }
        ]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        
      }
    }

    return { ok: true, user: data.user };
  } catch (error) {
    console.error('Signup error:', error);
    throw new Error(error.message || 'signup failed');
  }
}
  
export async function signin(email, password) {
  if (!supabase) {
    throw new Error('Supabase not configured. Please check your environment variables.');
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { ok: true, user: data.user };
  } catch (error) {
    throw new Error(error.message || 'signin failed');
  }
}
  
export async function signout() {
  if (!supabase) {
    throw new Error('Supabase not configured. Please check your environment variables.');
  }

  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    throw new Error(error.message || 'signout failed');
  }
}
  
export async function me() {
  if (!supabase) {
    return null;
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      return null;
    }
    return user;
  } catch (error) {
    return null;
  }
}
  