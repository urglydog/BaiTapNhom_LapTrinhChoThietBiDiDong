import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

// Complete the auth session
WebBrowser.maybeCompleteAuthSession();

// Web Client ID from Google Cloud Console
// This should be the OAuth 2.0 Client ID (Web application type) from Google Cloud Console
// Format: xxxxxx-xxxxx.apps.googleusercontent.com
const WEB_CLIENT_ID = '20028934029-jdc4pr5q7e92f0jhij7mjrflughq8j5v.apps.googleusercontent.com';

// Google OAuth endpoints
const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

export const configureGoogleSignIn = async () => {
  // No configuration needed for expo-auth-session
  return;
};

export const signInWithGoogle = async () => {
  try {
    // Create redirect URI
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'movieappfrontend',
      path: 'auth',
    });

    // Create auth request with PKCE enabled (required by Google OAuth 2.0 policy)
    const request = new AuthSession.AuthRequest({
      clientId: WEB_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.Code, // Use authorization code flow instead of implicit
      redirectUri: redirectUri,
      usePKCE: true, // Enable PKCE for security (required by Google)
      extraParams: {},
    });

    // Get authorization URL
    const result = await request.promptAsync(discovery);

    if (result.type === 'success') {
      // Type guard to check if result has params
      if ('params' in result && result.params && 'code' in result.params) {
        const code = result.params.code as string;
        
        // Get code verifier from request (PKCE)
        const codeVerifier = request.codeVerifier;
        
        if (!codeVerifier) {
          throw new Error('Không thể lấy code verifier từ request');
        }

        // Exchange authorization code for access token manually
        const tokenResponse = await fetch(discovery.tokenEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: WEB_CLIENT_ID,
            code: code,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
            code_verifier: codeVerifier,
          }).toString(),
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          throw new Error(`Không thể lấy access token từ Google: ${errorText}`);
        }

        const tokenData = await tokenResponse.json();

        if (!tokenData.access_token) {
          throw new Error('Không thể lấy access token từ Google');
        }

        // Get user info from Google API
        const userInfoResponse = await fetch(
          `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenData.access_token}`
        );
        
        if (!userInfoResponse.ok) {
          throw new Error('Không thể lấy thông tin người dùng từ Google');
        }

        const userInfo = await userInfoResponse.json();

        return {
          googleId: userInfo.id || '',
          email: userInfo.email || '',
          fullName: userInfo.name || '',
          avatarUrl: userInfo.picture || undefined,
        };
      } else {
        throw new Error('Không nhận được authorization code từ Google');
      }
    } else if (result.type === 'cancel') {
      throw new Error('Đăng nhập Google đã bị hủy');
    } else {
      // Check for error in result
      const errorMessage = ('params' in result && result.params && 'error_description' in result.params) 
        ? (result.params.error_description as string)
        : ('params' in result && result.params && 'error' in result.params)
        ? (result.params.error as string)
        : 'Đăng nhập Google thất bại';
      throw new Error(errorMessage);
    }
  } catch (error: any) {
    if (error.message) {
      throw error;
    }
    throw new Error('Đăng nhập Google thất bại: ' + (error.message || 'Unknown error'));
  }
};

export const signOutGoogle = async () => {
  // No explicit sign out needed for OAuth flow
  return;
};
