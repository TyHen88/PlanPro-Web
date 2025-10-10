# Google OAuth2 Authentication Setup Guide

This guide explains how to set up and use Google OAuth2 authentication in the PlanPro application.

## Overview

The application now supports Google OAuth2 authentication alongside traditional username/password authentication. Users can sign in or register using their Google account.

## Architecture

### Flow Diagram

```
User clicks "Continue with Google"
    ↓
Frontend redirects to Backend OAuth endpoint
    ↓
Backend redirects to Google OAuth
    ↓
User authenticates with Google
    ↓
Google redirects to Backend callback
    ↓
Backend generates JWT token
    ↓
Backend redirects to Frontend OAuth redirect page (/oauth2/redirect?token=XXX&type=Bearer)
    ↓
Frontend exchanges token with NextAuth
    ↓
User is authenticated and redirected to dashboard
```

## Files Modified/Created

### New Files

1. **`pages/oauth2/redirect.tsx`**
   - Handles the OAuth2 redirect from the backend
   - Captures the JWT token from URL parameters
   - Signs in the user using NextAuth
   - Shows loading/success/error states

2. **`utils/googleOAuth.ts`**
   - Utility functions for Google OAuth
   - `initiateGoogleLogin()` - Redirects to backend OAuth endpoint
   - `initiateGoogleRegister()` - Same as login (OAuth handles both)
   - Helper functions for JWT validation and decoding

3. **`GOOGLE_OAUTH_SETUP.md`** (this file)
   - Documentation for Google OAuth implementation

### Modified Files

1. **`pages/api/auth/[...nextauth].ts`**
   - Added Google OAuth provider (`google-oauth`)
   - Handles JWT token from backend
   - Parses and validates token
   - Creates user session

2. **`components/ui/layout/LoginForm.tsx`**
   - Added "Continue with Google" button
   - Integrated with `initiateGoogleLogin()` function

3. **`components/ui/layout/SignUpForm.tsx`**
   - Added "Continue with Google" button
   - Integrated with `initiateGoogleRegister()` function

4. **`env.example`**
   - Added Google OAuth configuration variables

## Backend Requirements

Your backend API must implement the following endpoints:

### 1. OAuth Authorization Endpoint

**Endpoint:** `GET /api/wb/v1/oauth2/authorize/google`

**Query Parameters:**
- `redirect_uri` - The frontend redirect URI (e.g., `http://localhost:3000/oauth2/redirect`)

**Behavior:**
- Redirects user to Google OAuth consent screen
- After user consents, Google redirects to your backend callback

### 2. OAuth Callback Endpoint (Backend Internal)

**Endpoint:** `GET /api/wb/v1/oauth2/callback/google`

**Behavior:**
- Receives authorization code from Google
- Exchanges code for Google access token
- Gets user info from Google
- Creates or updates user in database
- Generates JWT token for your application
- Redirects to frontend with token: `{redirect_uri}?token={jwt_token}&type=Bearer`

### 3. Example Redirect URL

After successful authentication, backend should redirect to:

```
http://localhost:3000/oauth2/redirect?token=eyJhbGciOiJSUzI1NiJ9...&type=Bearer
```

## Environment Configuration

### Frontend (.env.local)

Add the following variables to your `.env.local` file:

### Next.js Image Configuration

Update `next.config.ts` to allow Google profile images:

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'planpro-dev.up.railway.app',
      'planpro.up.railway.app',
      'localhost',
      // Google OAuth profile images
      'lh3.googleusercontent.com',
      'lh4.googleusercontent.com',
      'lh5.googleusercontent.com',
      'lh6.googleusercontent.com',
      // Add other OAuth providers as needed
    ],
  },
  output: 'standalone',
  serverExternalPackages: [],
};

export default nextConfig;
```

**Note:** This is required to display user profile pictures from Google.

### Environment Variables

```bash
# Google OAuth2 Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
NEXT_PUBLIC_OAUTH_REDIRECT_URI=http://localhost:3000/oauth2/redirect

# For production
# NEXT_PUBLIC_OAUTH_REDIRECT_URI=https://your-domain.com/oauth2/redirect
```

### Backend Configuration

Your backend should be configured with:

```bash
# Google OAuth credentials (from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# Redirect URIs
GOOGLE_OAUTH_CALLBACK_URI=http://localhost:8080/api/wb/v1/oauth2/callback/google
FRONTEND_OAUTH_REDIRECT_URI=http://localhost:3000/oauth2/redirect
```

## Google Cloud Console Setup

### 1. Create a Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one

### 2. Enable Google+ API

1. Navigate to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click "Enable"

### 3. Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application"
4. Add authorized redirect URIs:
   - For development: `http://localhost:8080/api/wb/v1/oauth2/callback/google`
   - For production: `https://your-api-domain.com/api/wb/v1/oauth2/callback/google`
5. Add authorized JavaScript origins:
   - For development: `http://localhost:3000`
   - For production: `https://your-domain.com`
6. Save and copy your Client ID and Client Secret

### 4. Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" (or "Internal" for Google Workspace)
3. Fill in required information:
   - App name: PlanPro
   - User support email
   - Developer contact information
4. Add scopes:
   - `userinfo.email`
   - `userinfo.profile`
   - `openid`
5. Save and continue

## Usage

### Login with Google

1. User navigates to `/login`
2. User clicks "Continue with Google" button
3. User is redirected to Google OAuth
4. After authentication, user is redirected back and logged in

### Register with Google

1. User navigates to `/register`
2. User clicks "Continue with Google" button
3. If user doesn't exist, backend creates new account
4. User is redirected back and logged in

## JWT Token Structure

The backend should return a JWT token with the following structure:

```json
{
  "iss": "USER",
  "sub": "user@example.com",
  "id": 1,
  "exp": 1846469955,
  "iat": 1760069955,
  "username": "user@example.com"
}
```

**Required fields:**
- `sub` or `email` - User identifier
- `id` - User ID
- `exp` - Expiration timestamp
- `iat` - Issued at timestamp

## Security Considerations

### 1. Token Validation

- Frontend validates JWT token format
- NextAuth parses and verifies token structure
- Token expiration is checked

### 2. HTTPS in Production

- Always use HTTPS in production
- Configure proper CORS settings
- Validate redirect URIs

### 3. State Parameter

Consider adding CSRF protection with state parameter:
- Backend generates random state
- State is validated on callback
- Prevents CSRF attacks

### 4. Token Storage

- Tokens are stored in NextAuth session (JWT)
- Session is stored in HTTP-only cookies
- Tokens are not accessible via JavaScript

## Testing

### Local Testing

1. Start backend server: `http://localhost:8080`
2. Start frontend: `npm run dev`
3. Navigate to: `http://localhost:3000/login`
4. Click "Continue with Google"
5. Authenticate with Google
6. Verify redirect and authentication

### Manual Testing URLs

Test the OAuth flow manually:

```bash
# Step 1: Initiate OAuth (copy URL to browser)
http://localhost:8080/api/wb/v1/oauth2/authorize/google?redirect_uri=http://localhost:3000/oauth2/redirect

# Step 2: After Google auth, backend should redirect to:
http://localhost:3000/oauth2/redirect?token=JWT_TOKEN&type=Bearer
```

## Troubleshooting

### Common Issues

#### 1. "Missing authentication credentials" Error

**Cause:** Token or type parameter missing from URL

**Solution:**
- Check backend redirect URL format
- Ensure backend includes both `token` and `type` parameters
- Verify backend redirect URI matches frontend configuration

#### 2. "Invalid token format" Error

**Cause:** JWT token is malformed

**Solution:**
- Verify backend JWT generation
- Check token has 3 parts (header.payload.signature)
- Validate token payload structure

#### 3. Redirect Loop

**Cause:** Misconfigured redirect URIs

**Solution:**
- Verify `NEXT_PUBLIC_OAUTH_REDIRECT_URI` matches backend configuration
- Check Google Cloud Console authorized redirect URIs
- Ensure no trailing slashes in URIs

#### 4. "Failed to authenticate with Google" Error

**Cause:** Token parsing or validation failed

**Solution:**
- Check token payload includes required fields (`sub`, `id`, `exp`)
- Verify token is not expired
- Check backend JWT signing algorithm (RS256)

### Debug Mode

Enable debug logging in NextAuth:

```typescript
// pages/api/auth/[...nextauth].ts
export const authOption: NextAuthOptions = ({
    debug: true, // Enable debug logs
    // ... rest of config
})
```

## API Reference

### Frontend Functions

#### `initiateGoogleLogin()`

Redirects user to backend Google OAuth endpoint.

```typescript
import { initiateGoogleLogin } from "@/utils/googleOAuth";

// In your component
<button onClick={initiateGoogleLogin}>
  Continue with Google
</button>
```

#### `initiateGoogleRegister()`

Same as `initiateGoogleLogin()` - OAuth handles both login and registration.

```typescript
import { initiateGoogleRegister } from "@/utils/googleOAuth";

<button onClick={initiateGoogleRegister}>
  Sign up with Google
</button>
```

#### `decodeJWT(token: string)`

Decodes a JWT token payload.

```typescript
import { decodeJWT } from "@/utils/googleOAuth";

const payload = decodeJWT(token);
console.log(payload.email);
```

## Production Deployment

### Frontend

1. Update environment variables:
   ```bash
   NEXT_PUBLIC_OAUTH_REDIRECT_URI=https://your-domain.com/oauth2/redirect
   NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
   ```

2. Deploy frontend to Vercel/Netlify/etc.

### Backend

1. Update environment variables:
   ```bash
   FRONTEND_OAUTH_REDIRECT_URI=https://your-domain.com/oauth2/redirect
   ```

2. Update Google Cloud Console:
   - Add production redirect URIs
   - Add production JavaScript origins

3. Deploy backend to Railway/Heroku/etc.

### DNS Configuration

Ensure proper DNS records:
- Frontend: `your-domain.com` → Vercel/Netlify
- Backend API: `api.your-domain.com` → Railway/Heroku

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth2 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [JWT.io](https://jwt.io/) - JWT token debugger
- [Google Cloud Console](https://console.cloud.google.com/)

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review NextAuth debug logs
3. Verify backend API responses
4. Check browser console for errors

## Future Enhancements

Potential improvements:
- [ ] Add GitHub OAuth provider
- [ ] Add Microsoft OAuth provider
- [ ] Implement refresh token rotation
- [ ] Add two-factor authentication
- [ ] Support account linking (link Google to existing account)
- [ ] Add OAuth scope selection
- [ ] Implement logout from Google

