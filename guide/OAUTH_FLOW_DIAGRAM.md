# Google OAuth2 Authentication Flow Diagram

## Complete Flow Visualization

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          GOOGLE OAUTH2 FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
│          │         │          │         │          │         │          │
│   USER   │         │ FRONTEND │         │ BACKEND  │         │  GOOGLE  │
│          │         │          │         │          │         │          │
└─────┬────┘         └─────┬────┘         └─────┬────┘         └─────┬────┘
      │                    │                    │                    │
      │                    │                    │                    │
      │  1. Navigate to    │                    │                    │
      │  /login or         │                    │                    │
      │  /register         │                    │                    │
      ├───────────────────>│                    │                    │
      │                    │                    │                    │
      │  2. Display page   │                    │                    │
      │  with Google btn   │                    │                    │
      │<───────────────────┤                    │                    │
      │                    │                    │                    │
      │  3. Click "Continue│                    │                    │
      │  with Google"      │                    │                    │
      ├───────────────────>│                    │                    │
      │                    │                    │                    │
      │                    │  4. Redirect to    │                    │
      │                    │  /oauth2/authorize/│                    │
      │                    │  google            │                    │
      │                    ├───────────────────>│                    │
      │                    │                    │                    │
      │                    │                    │  5. Redirect to    │
      │                    │                    │  Google OAuth      │
      │                    │                    ├───────────────────>│
      │                    │                    │                    │
      │  6. Redirect to Google OAuth consent screen                 │
      │<────────────────────────────────────────────────────────────┤
      │                    │                    │                    │
      │  7. User authenticates                  │                    │
      │  with Google credentials                │                    │
      ├────────────────────────────────────────────────────────────>│
      │                    │                    │                    │
      │                    │                    │  8. Authorization  │
      │                    │                    │  code              │
      │                    │                    │<───────────────────┤
      │                    │                    │                    │
      │                    │                    │  9. Exchange code  │
      │                    │                    │  for access token  │
      │                    │                    ├───────────────────>│
      │                    │                    │                    │
      │                    │                    │  10. Access token  │
      │                    │                    │<───────────────────┤
      │                    │                    │                    │
      │                    │                    │  11. Get user info │
      │                    │                    ├───────────────────>│
      │                    │                    │                    │
      │                    │                    │  12. User info     │
      │                    │                    │<───────────────────┤
      │                    │                    │                    │
      │                    │                    │  13. Create/update │
      │                    │                    │  user in database  │
      │                    │                    │                    │
      │                    │                    │  14. Generate JWT  │
      │                    │                    │  token             │
      │                    │                    │                    │
      │                    │  15. Redirect to   │                    │
      │                    │  /oauth2/redirect  │                    │
      │                    │  ?token=xxx        │                    │
      │                    │<───────────────────┤                    │
      │                    │                    │                    │
      │  16. Display       │                    │                    │
      │  "Authenticating..." │                  │                    │
      │<───────────────────┤                    │                    │
      │                    │                    │                    │
      │                    │  17. Validate JWT  │                    │
      │                    │  with NextAuth     │                    │
      │                    │                    │                    │
      │                    │  18. Create session│                    │
      │                    │                    │                    │
      │  19. Display       │                    │                    │
      │  "Success!" page   │                    │                    │
      │<───────────────────┤                    │                    │
      │                    │                    │                    │
      │                    │  20. Redirect to   │                    │
      │                    │  /trips (dashboard)│                    │
      │                    │                    │                    │
      │  21. Access        │                    │                    │
      │  protected page    │                    │                    │
      │<───────────────────┤                    │                    │
      │                    │                    │                    │
      ▼                    ▼                    ▼                    ▼

```

## Detailed Steps Explanation

### Step 1-3: User Initiates OAuth
- User navigates to login or register page
- Clicks "Continue with Google" button
- Frontend calls `initiateGoogleLogin()` function

### Step 4-5: Frontend to Backend
- Frontend redirects to backend OAuth endpoint
- URL: `GET /api/wb/v1/oauth2/authorize/google?redirect_uri=http://localhost:3000/oauth2/redirect`
- Backend receives request and prepares OAuth flow

### Step 6-7: Google Authentication
- Backend redirects user to Google OAuth consent screen
- User logs in with Google credentials
- User grants permissions to the application

### Step 8-12: Token Exchange
- Google redirects back to backend with authorization code
- Backend exchanges code for Google access token
- Backend uses access token to fetch user information from Google

### Step 13-14: User Management
- Backend checks if user exists in database
- Creates new user if first time, or updates existing user
- Generates JWT token for the application

### Step 15-16: Return to Frontend
- Backend redirects to frontend OAuth redirect page
- URL: `http://localhost:3000/oauth2/redirect?token={JWT}&type=Bearer`
- Frontend shows "Authenticating..." loading state

### Step 17-18: Session Creation
- Frontend validates JWT token format
- NextAuth authenticates using `google-oauth` provider
- Creates secure session with JWT token

### Step 19-21: Completion
- Shows success message
- Redirects to dashboard (trips page)
- User is now authenticated and can access protected routes

## URL Examples

### Development URLs

```
Frontend Base:    http://localhost:3000
Backend Base:     http://localhost:8080/api/wb/v1

Step 4:  http://localhost:8080/api/wb/v1/oauth2/authorize/google?redirect_uri=http://localhost:3000/oauth2/redirect

Step 5:  https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=...

Step 8:  http://localhost:8080/api/wb/v1/oauth2/callback/google?code=xxx&state=yyy

Step 15: http://localhost:3000/oauth2/redirect?token=eyJhbGci...&type=Bearer

Step 21: http://localhost:3000/trips
```

### Production URLs

```
Frontend Base:    https://your-domain.com
Backend Base:     https://api.your-domain.com/api/wb/v1

Step 4:  https://api.your-domain.com/api/wb/v1/oauth2/authorize/google?redirect_uri=https://your-domain.com/oauth2/redirect

Step 5:  https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=...

Step 8:  https://api.your-domain.com/api/wb/v1/oauth2/callback/google?code=xxx&state=yyy

Step 15: https://your-domain.com/oauth2/redirect?token=eyJhbGci...&type=Bearer

Step 21: https://your-domain.com/trips
```

## Data Flow

### User Information Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA TRANSFORMATION                       │
└─────────────────────────────────────────────────────────────┘

Google User Info                Backend Processing              Frontend Session
─────────────────               ──────────────────             ────────────────

{                               Create/Update User:             {
  "id": "123456",              ├─ Check if exists                 "user": {
  "email": "user@gmail.com",   ├─ Create or update                 "iss": "USER",
  "verified_email": true,      └─ Save to database                 "sub": "user@gmail.com",
  "name": "John Doe",                                              "id": 1,
  "given_name": "John",        Generate JWT:                       "exp": 1846469955,
  "family_name": "Doe",        ├─ Sign with RS256                  "iat": 1760069955,
  "picture": "https://...",    ├─ Include user data                "username": "user@gmail.com"
  "locale": "en"               └─ Set expiration                 },
}                                                                 "token": "eyJhbGci...",
                               Return JWT:                        "accessTokenExpires": "..."
                               └─ Redirect to frontend          }
                                  with token parameter
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    ERROR SCENARIOS                           │
└─────────────────────────────────────────────────────────────┘

Error Point                     Action                          User Experience
───────────                     ──────                          ───────────────

Missing token/type       →      Display error page       →      "Missing authentication credentials"
                                "Back to Login" button          Click to return to login

Invalid JWT format       →      Validation fails         →      "Invalid token format"
                                Log error                       "Back to Login" button

Token expired           →       Check exp claim          →      "Token has expired"
                                Reject authentication           "Back to Login" button

Google auth fails       →       Google error page        →      Google error message
                                User can retry                  Option to go back

Backend unavailable     →       Request fails            →      "Backend service unavailable"
                                Show error                      Retry button

Network error           →       Catch network error      →      "Network connection error"
                                Show user-friendly msg          Retry button
```

## Security Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY MEASURES                         │
└─────────────────────────────────────────────────────────────┘

Layer                    Security Measure                      Implementation
─────                    ────────────────                      ──────────────

Transport Layer    →     HTTPS (Production)              →     TLS/SSL encryption
                         HTTP (Development)                    Certificate validation

OAuth Layer        →     State parameter                 →     CSRF protection
                         Authorization code                    One-time use
                         Redirect URI validation               Exact match required

Token Layer        →     JWT signature                   →     RS256 algorithm
                         Expiration time                       Time-limited access
                         Token validation                      Format and content checks

Session Layer      →     HTTP-only cookies               →     XSS protection
                         Secure flag                           HTTPS only
                         SameSite attribute                    CSRF protection

Application Layer  →     Rate limiting                   →     Prevent brute force
                         Input validation                      Sanitize user input
                         Error handling                        No sensitive info in errors
```

## Component Interaction

```
┌─────────────────────────────────────────────────────────────┐
│                  COMPONENT RESPONSIBILITIES                  │
└─────────────────────────────────────────────────────────────┘

LoginForm.tsx                   OAuth2Redirect.tsx              NextAuth
─────────────                   ──────────────────              ────────

├─ Display UI                   ├─ Capture URL params            ├─ Validate token
├─ Google button                ├─ Extract token/type            ├─ Create session
├─ Click handler                ├─ Show loading state            ├─ Manage cookies
└─ Initiate OAuth               ├─ Call NextAuth signIn          ├─ Handle callbacks
                                ├─ Show success/error            └─ Session management
googleOAuth.ts                  └─ Redirect to dashboard
──────────────
                                [...nextauth].ts
├─ Build OAuth URL              ────────────────
├─ Redirect to backend
├─ JWT utilities                ├─ Google OAuth provider
└─ Token validation             ├─ Authorize function
                                ├─ Parse JWT
                                ├─ Return user data
                                └─ Error handling
```

## Timeline (Approximate)

```
┌─────────────────────────────────────────────────────────────┐
│                     EXECUTION TIMELINE                       │
└─────────────────────────────────────────────────────────────┘

Event                                                   Duration
─────                                                   ────────

User clicks "Continue with Google"                      0ms
Frontend redirect to backend                            50-100ms
Backend redirect to Google                              100-200ms
Google OAuth consent screen loads                       500-1000ms
User authenticates with Google                          5-30 seconds (user action)
Google redirects to backend                             50-100ms
Backend exchanges code for token                        200-500ms
Backend gets user info                                  200-500ms
Backend processes user                                  50-200ms
Backend redirects to frontend                           50-100ms
Frontend validates token                                10-50ms
NextAuth creates session                                50-100ms
Frontend redirects to dashboard                         50-100ms
                                                        ───────────
Total (excluding user auth time):                       ~1-3 seconds
Total (including user auth time):                       ~6-33 seconds
```

## State Management

```
┌─────────────────────────────────────────────────────────────┐
│                      STATE TRACKING                          │
└─────────────────────────────────────────────────────────────┘

OAuth2Redirect Component States:
─────────────────────────────────

┌──────────┐     Token received    ┌──────────┐     Auth success    ┌─────────┐
│          │  ───────────────────> │          │  ──────────────────> │         │
│ LOADING  │                        │ LOADING  │                      │ SUCCESS │
│          │                        │ (validating)                    │         │
└──────────┘                        └──────────┘                      └─────────┘
     │                                   │                                  │
     │                                   │                                  │
     │ Missing params                    │ Auth failed                      │ Auto redirect
     │                                   │                                  │
     ▼                                   ▼                                  ▼
┌──────────┐                        ┌─────────┐                        ┌──────────┐
│          │                        │         │                        │          │
│  ERROR   │ ◄───────────────────── │  ERROR  │                        │ DASHBOARD│
│          │                        │         │                        │          │
└──────────┘                        └─────────┘                        └──────────┘
     │                                                                      │
     │                                                                      │
     │ Back to Login                                                        │
     │                                                                      │
     ▼                                                                      ▼
┌──────────┐                                                          ┌──────────┐
│          │                                                          │          │
│  LOGIN   │                                                          │ APP HOME │
│          │                                                          │          │
└──────────┘                                                          └──────────┘
```

---

## Quick Reference

### Key URLs to Remember

| Purpose | URL Pattern |
|---------|-------------|
| Login Page | `/login` |
| Register Page | `/register` |
| OAuth Redirect | `/oauth2/redirect?token={JWT}&type=Bearer` |
| Backend Auth | `/api/wb/v1/oauth2/authorize/google?redirect_uri={uri}` |
| Backend Callback | `/api/wb/v1/oauth2/callback/google?code={code}` |
| Dashboard | `/trips` |

### Key Components

| Component | File | Purpose |
|-----------|------|---------|
| Login Form | `components/ui/layout/LoginForm.tsx` | Google button |
| Register Form | `components/ui/layout/SignUpForm.tsx` | Google button |
| OAuth Redirect | `pages/oauth2/redirect.tsx` | Handle redirect |
| OAuth Utils | `utils/googleOAuth.ts` | Helper functions |
| NextAuth Config | `pages/api/auth/[...nextauth].ts` | Auth provider |

### Key Functions

| Function | File | Purpose |
|----------|------|---------|
| `initiateGoogleLogin()` | `utils/googleOAuth.ts` | Start OAuth flow |
| `authorize()` | `pages/api/auth/[...nextauth].ts` | Validate JWT |
| `jwt()` callback | `pages/api/auth/[...nextauth].ts` | Handle token |
| `session()` callback | `pages/api/auth/[...nextauth].ts` | Create session |

---

For more detailed information, see:
- **Setup Guide**: `GOOGLE_OAUTH_SETUP.md`
- **Backend Guide**: `BACKEND_OAUTH_GUIDE.md`
- **Quick Start**: `OAUTH_QUICKSTART.md`
- **Summary**: `IMPLEMENTATION_SUMMARY.md`

