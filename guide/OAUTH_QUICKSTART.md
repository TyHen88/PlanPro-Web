# Google OAuth2 Quick Start Guide

Quick reference for implementing and testing Google OAuth2 authentication.

## 🚀 What Was Implemented

✅ Google OAuth2 login and registration  
✅ OAuth2 redirect handler page  
✅ NextAuth integration with Google provider  
✅ "Continue with Google" buttons on login/register pages  
✅ JWT token handling from backend  
✅ Comprehensive documentation  

## 📁 New Files Created

```
pages/oauth2/redirect.tsx          - OAuth redirect handler
utils/googleOAuth.ts               - OAuth utility functions
GOOGLE_OAUTH_SETUP.md              - Complete setup guide
BACKEND_OAUTH_GUIDE.md             - Backend implementation guide
OAUTH_QUICKSTART.md                - This quick start guide
```

## 📝 Modified Files

```
pages/api/auth/[...nextauth].ts    - Added Google OAuth provider
components/ui/layout/LoginForm.tsx - Added Google sign-in button
components/ui/layout/SignUpForm.tsx - Added Google sign-in button
env.example                        - Added OAuth environment variables
```

## ⚡ Quick Setup (5 Minutes)

### 1. Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project or select existing
3. Enable Google+ API
4. Create OAuth credentials (Web application)
5. Add authorized redirect URI:
   ```
   http://localhost:8080/api/wb/v1/oauth2/callback/google
   ```
6. Copy Client ID and Client Secret

### 2. Update Next.js Configuration

The `next.config.ts` has been updated to allow Google profile images. No action needed!

### 3. Update Environment Variables

Create or update `.env.local`:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
NEXT_PUBLIC_OAUTH_REDIRECT_URI=http://localhost:3000/oauth2/redirect

# API URL
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### 4. Backend Requirements

Your backend must implement two endpoints:

**Authorization Endpoint:**
```
GET /api/wb/v1/oauth2/authorize/google?redirect_uri={frontend_uri}
→ Redirects to Google OAuth
```

**Callback Endpoint:**
```
GET /api/wb/v1/oauth2/callback/google?code={code}&state={state}
→ Exchanges code for token
→ Redirects to: {frontend_uri}?token={jwt_token}&type=Bearer
```

### 5. Test It!

1. Start your backend server
2. Run frontend: `npm run dev`
3. Navigate to: `http://localhost:3000/login`
4. Click "Continue with Google"
5. Authenticate with Google
6. Should redirect to dashboard

## 🔄 OAuth Flow Summary

```
User → Frontend (Login/Register)
  ↓ (clicks "Continue with Google")
Frontend → Backend (/oauth2/authorize/google)
  ↓
Backend → Google (OAuth consent screen)
  ↓
User authenticates with Google
  ↓
Google → Backend (/oauth2/callback/google)
  ↓
Backend processes authentication
  ↓ (generates JWT)
Backend → Frontend (/oauth2/redirect?token=xxx)
  ↓
Frontend validates token with NextAuth
  ↓
User authenticated & redirected to dashboard ✓
```

## 🧪 Testing URLs

### Manual Testing

**Step 1: Authorization**
```
http://localhost:8080/api/wb/v1/oauth2/authorize/google?redirect_uri=http://localhost:3000/oauth2/redirect
```

**Step 2: Expected Callback**
```
http://localhost:3000/oauth2/redirect?token=eyJhbGci...&type=Bearer
```

### Test with Your Token

Replace `YOUR_TOKEN` with your actual JWT token:

```
http://localhost:3000/oauth2/redirect?token=YOUR_TOKEN&type=Bearer
```

## 📊 JWT Token Format

Your backend should return a JWT token with this structure:

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

## 🔍 Debugging

### Check Frontend Logs

```javascript
// Open browser console (F12)
// Look for logs from:
// - OAuth2Redirect component
// - NextAuth session logs
```

### Check Backend Logs

```bash
# Look for:
- OAuth authorization requests
- Token exchange attempts
- User creation/login events
- Redirect URLs
```

### Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Redirect loop | Check redirect URIs match exactly |
| "Missing credentials" | Verify token & type params in URL |
| "Invalid token" | Check JWT format (3 parts) |
| Token expired | Check exp claim in JWT |
| CORS errors | Configure backend CORS settings |

## 🎯 Key Components

### Frontend Functions

```typescript
// Initiate Google login
import { initiateGoogleLogin } from "@/utils/googleOAuth";
initiateGoogleLogin();

// Decode JWT token
import { decodeJWT } from "@/utils/googleOAuth";
const payload = decodeJWT(token);
```

### NextAuth Providers

```typescript
// In [...nextauth].ts
providers: [
  CredentialsProvider({ ... }),        // Traditional login
  CredentialsProvider({                 // Google OAuth
    id: "google-oauth",
    // ... handles JWT token from backend
  })
]
```

## 🛠️ Development vs Production

### Development

```bash
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_OAUTH_REDIRECT_URI=http://localhost:3000/oauth2/redirect

# Backend
GOOGLE_OAUTH_CALLBACK_URI=http://localhost:8080/api/wb/v1/oauth2/callback/google
FRONTEND_OAUTH_REDIRECT_URI=http://localhost:3000/oauth2/redirect
```

### Production

```bash
# Frontend
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api
NEXT_PUBLIC_OAUTH_REDIRECT_URI=https://your-domain.com/oauth2/redirect

# Backend
GOOGLE_OAUTH_CALLBACK_URI=https://api.your-domain.com/api/wb/v1/oauth2/callback/google
FRONTEND_OAUTH_REDIRECT_URI=https://your-domain.com/oauth2/redirect
```

**Don't forget to update Google Cloud Console with production URIs!**

## 📚 Documentation Files

| File | Description |
|------|-------------|
| `OAUTH_QUICKSTART.md` | This quick reference |
| `GOOGLE_OAUTH_SETUP.md` | Complete frontend setup guide |
| `BACKEND_OAUTH_GUIDE.md` | Complete backend implementation |

## ✅ Production Checklist

Before deploying to production:

- [ ] Configure production environment variables
- [ ] Update Google Cloud Console with production URIs
- [ ] Enable HTTPS everywhere
- [ ] Configure proper CORS settings
- [ ] Implement rate limiting
- [ ] Set up error logging and monitoring
- [ ] Test OAuth flow end-to-end
- [ ] Test error scenarios
- [ ] Verify token expiration handling
- [ ] Document emergency procedures

## 🆘 Need Help?

1. **Read full documentation:**
   - `GOOGLE_OAUTH_SETUP.md` - Frontend details
   - `BACKEND_OAUTH_GUIDE.md` - Backend implementation

2. **Check troubleshooting sections** in the documentation

3. **Common debugging steps:**
   ```bash
   # 1. Verify environment variables
   echo $NEXT_PUBLIC_API_URL
   
   # 2. Check browser console (F12)
   
   # 3. Check backend logs
   
   # 4. Test URLs manually
   
   # 5. Verify Google Cloud Console settings
   ```

## 🎉 Success Indicators

You'll know it's working when:

✅ Clicking "Continue with Google" redirects to Google  
✅ After Google auth, you see "Authenticating..." page  
✅ You're redirected to the dashboard  
✅ User session is created  
✅ JWT token is stored in NextAuth session  

## 📞 Support Resources

- [Google OAuth2 Docs](https://developers.google.com/identity/protocols/oauth2)
- [NextAuth.js Docs](https://next-auth.js.org/)
- [JWT.io](https://jwt.io/) - Token debugger
- [Google Cloud Console](https://console.cloud.google.com/)

---

**Ready to implement?** Start with the backend endpoints, then test the flow!

For detailed implementation guides, see:
- Frontend: `GOOGLE_OAUTH_SETUP.md`
- Backend: `BACKEND_OAUTH_GUIDE.md`

