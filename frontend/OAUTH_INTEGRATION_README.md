# OAuth Authentication Integration

This document describes the OAuth authentication implementation for Google and GitHub login in the mailing application.

## Features

- **Google OAuth** - Login using Google account
- **GitHub OAuth** - Login using GitHub account
- **Seamless Integration** - OAuth buttons integrated into existing login page
- **Token Management** - Automatic token storage and user data synchronization
- **Callback Handling** - Dedicated callback view for OAuth flow completion

## Implementation Overview

### Files Created/Modified

1. **`src/services/auth.js`** - OAuth service handling authentication flow
2. **`src/views/OAuthCallbackView.vue`** - Callback handler view
3. **`src/views/LoginView.vue`** - Updated with OAuth buttons
4. **`src/router/index.js`** - Added OAuth callback route
5. **`src/locales/pl.json` & `en.json`** - Added OAuth translations

## Usage

### Frontend Integration

The OAuth buttons are automatically displayed on the login page:

```vue
<button @click="loginWithGoogle">Continue with Google</button>
<button @click="loginWithGitHub">Continue with GitHub</button>
```

### OAuth Flow

1. User clicks OAuth button (Google/GitHub)
2. Frontend redirects to backend OAuth endpoint: `GET /auth/{provider}?callback={url}`
3. Backend redirects to OAuth provider (Google/GitHub)
4. User authorizes the application
5. OAuth provider redirects back to: `GET /auth/callback/{provider}?code={code}&state={state}`
6. Frontend sends code to backend: `POST /auth/{provider}/callback`
7. Backend validates code, creates/finds user, returns token
8. Frontend stores token and redirects to dashboard

## Backend Requirements

The backend needs to implement the following endpoints:

### 1. OAuth Initiation

```
GET /auth/google?callback={callbackUrl}
GET /auth/github?callback={callbackUrl}
```

**Response**: Redirect to OAuth provider authorization page

### 2. OAuth Callback Processing

```
POST /auth/google/callback
POST /auth/github/callback
```

**Request Body**:
```json
{
  "code": "authorization_code_from_oauth_provider",
  "state": "optional_state_token"
}
```

**Response**:
```json
{
  "data": {
    "token": "jwt_auth_token",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "customer_id": 1,
      "roles": ["marketer"]
    }
  }
}
```

### Backend Implementation Steps

#### 1. Install OAuth Libraries

For Node.js/Express:
```bash
npm install passport passport-google-oauth20 passport-github2
```

#### 2. Configure OAuth Providers

Create OAuth applications:

**Google OAuth:**
- Go to: https://console.cloud.google.com/apis/credentials
- Create OAuth 2.0 Client ID
- Add authorized redirect URI: `http://localhost:3000/auth/google/redirect`

**GitHub OAuth:**
- Go to: https://github.com/settings/developers
- Create OAuth App
- Add callback URL: `http://localhost:3000/auth/github/redirect`

#### 3. Environment Variables

Add to `.env`:
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/redirect

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/redirect
```

#### 4. Example Backend Implementation (Node.js/Express)

```javascript
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    // Find or create user in database
    const user = await findOrCreateUser({
      provider: 'google',
      providerId: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName
    });
    return done(null, user);
  }
));

// GitHub Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    const user = await findOrCreateUser({
      provider: 'github',
      providerId: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName
    });
    return done(null, user);
  }
));

// Routes
app.get('/auth/google', (req, res, next) => {
  const { callback } = req.query;
  req.session.oauthCallback = callback; // Store for later
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })(req, res, next);
});

app.get('/auth/google/redirect', 
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const callback = req.session.oauthCallback;
    const code = 'generated_auth_code'; // Generate temporary code
    res.redirect(`${callback}?code=${code}`);
  }
);

app.post('/auth/google/callback', async (req, res) => {
  const { code } = req.body;
  
  // Validate code and get user
  const user = await validateCodeAndGetUser(code);
  
  // Generate JWT token
  const token = generateJWT(user);
  
  res.json({
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        customer_id: user.customer_id,
        roles: user.roles
      }
    }
  });
});

// Similar implementation for GitHub
app.get('/auth/github', ...);
app.get('/auth/github/redirect', ...);
app.post('/auth/github/callback', ...);
```

## Frontend API Methods

### `AuthService.initiateOAuth(provider)`

Initiates OAuth flow by redirecting to backend OAuth endpoint.

**Parameters:**
- `provider` (string): `'google'` or `'github'`

**Example:**
```javascript
import { AuthService } from '@/services/auth';

AuthService.initiateOAuth('google');
```

### `AuthService.handleOAuthCallback(provider, code, state)`

Processes OAuth callback by sending authorization code to backend.

**Parameters:**
- `provider` (string): `'google'` or `'github'`
- `code` (string): Authorization code from OAuth provider
- `state` (string): State token (optional)

**Returns:** Promise with result object

**Example:**
```javascript
const result = await AuthService.handleOAuthCallback('google', code, state);
if (result.success) {
  // User authenticated
}
```

## Security Considerations

1. **HTTPS Required**: OAuth should only work over HTTPS in production
2. **State Token**: Implement CSRF protection using state parameter
3. **Token Storage**: JWT tokens stored in localStorage (consider httpOnly cookies for production)
4. **Callback URL Validation**: Backend must validate callback URLs
5. **Scope Limitation**: Request only necessary OAuth scopes

## Environment Configuration

Add to frontend `.env`:
```env
VITE_API_BASE_URL=http://localhost:3000
```

## Testing

1. Start backend server with OAuth configured
2. Open login page
3. Click "Continue with Google" or "Continue with GitHub"
4. Authorize application on OAuth provider
5. Verify redirect back to application with authentication successful

## Troubleshooting

### "Redirect URI mismatch"
- Ensure OAuth app callback URL matches backend redirect URI exactly
- Check for http vs https mismatch
- Verify port numbers match

### "Invalid client"
- Check CLIENT_ID and CLIENT_SECRET are correct
- Ensure OAuth app is enabled on provider

### "Code expired"
- Authorization codes expire quickly (usually 10 minutes)
- Ensure backend processes callback promptly

### "User not found"
- Backend must create user account on first OAuth login
- Ensure email is extracted from OAuth profile correctly

## Future Enhancements

- [ ] Add Microsoft/Azure AD OAuth
- [ ] Add LinkedIn OAuth
- [ ] Implement popup-based OAuth (alternative to redirect)
- [ ] Add account linking (connect OAuth to existing email account)
- [ ] Remember OAuth provider preference
- [ ] Add OAuth token refresh logic
- [ ] Implement two-factor authentication with OAuth

## API Documentation

For complete API documentation, refer to backend API docs at:
- Swagger UI: `http://localhost:3000/api-docs`
- OpenAPI Spec: `http://localhost:3000/api-docs.json`

## Support

For issues or questions:
1. Check backend logs for OAuth errors
2. Verify OAuth app configuration on provider console
3. Test OAuth flow with provider's OAuth Playground
4. Check browser console for frontend errors
