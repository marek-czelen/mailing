import axios from "axios";
import { Response } from "../include/response.js";
import { badRequest, unavailable } from "../include/errors.js";
import EnvironmentConfig from "../config/environment.config.js";
import { createState, consumeState, getState } from "../include/oauthState.js";
import Admin from "../include/admin.js";
import Auth from "../include/auth.js";

// Domyślna rola nadawana użytkownikowi utworzonemu via OAuth
const DEFAULT_OAUTH_ROLES = ['marketer'];

const PROVIDERS = {
  google: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    scope: 'openid email profile',
    clientId: EnvironmentConfig.get('GOOGLE_CLIENT_ID'),
    clientSecret: EnvironmentConfig.get('GOOGLE_CLIENT_SECRET'),
    redirectUri: EnvironmentConfig.get('GOOGLE_CALLBACK_URL')
  },
  github: {
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userUrl: 'https://api.github.com/user',
    emailsUrl: 'https://api.github.com/user/emails',
    scope: 'read:user user:email',
    clientId: EnvironmentConfig.get('GITHUB_CLIENT_ID'),
    clientSecret: EnvironmentConfig.get('GITHUB_CLIENT_SECRET'),
    redirectUri: EnvironmentConfig.get('GITHUB_CALLBACK_URL')
  }
};

function getProviderConfig(provider) {
  const cfg = PROVIDERS[provider];
  if (!cfg || !cfg.clientId || !cfg.clientSecret || !cfg.redirectUri) {
    return null;
  }
  return cfg;
}

export async function startOAuth(req, res) {
  try {
    const { provider } = req.params;
    const callback = req.query.callback;
    const customerId = req.query.customer_id || null;

    const cfg = getProviderConfig(provider);
    if (!cfg) return badRequest(req, res, 'OAuth provider not configured');
    if (!callback) return badRequest(req, res, 'Callback URL is required');

    const state = createState({ provider, callback, customerId });
    const authUrl = new URL(cfg.authUrl);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', cfg.clientId);
    authUrl.searchParams.set('redirect_uri', cfg.redirectUri);
    authUrl.searchParams.set('scope', cfg.scope);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('access_type', 'offline');

    return res.redirect(authUrl.toString());
  } catch (err) {
    return unavailable(req, res, err);
  }
}

export async function handleRedirect(req, res) {
  try {
    const { provider } = req.params;
    const { code, state, error } = req.query;

    if (error) return badRequest(req, res, error);
    if (!code || !state) return badRequest(req, res, 'Missing code or state');

    const stateData = getState(state, provider);
    if (!stateData) return badRequest(req, res, 'Invalid or expired state');

    const callback = stateData.callback;
    const redirectUrl = new URL(callback);
    redirectUrl.searchParams.set('code', code);
    redirectUrl.searchParams.set('state', state);

    return res.redirect(redirectUrl.toString());
  } catch (err) {
    return unavailable(req, res, err);
  }
}

export async function processCallback(req, res) {
  try {
    const { provider } = req.params;
    const { code, state } = req.body;

    if (!code) return badRequest(req, res, 'Code is required');
    if (!state) return badRequest(req, res, 'State is required');

    const cfg = getProviderConfig(provider);
    if (!cfg) return badRequest(req, res, 'OAuth provider not configured');

    const stateData = consumeState(state, provider);
    if (!stateData) return badRequest(req, res, 'Invalid or expired state');

    const tokenData = await exchangeCodeForToken(provider, cfg, code);
    const profile = await fetchUserProfile(provider, cfg, tokenData);

    if (!profile.email) {
      return badRequest(req, res, 'Email not available from provider');
    }

    // Utwórz / uaktualnij użytkownika
    const user = await Admin.ensureUserExists({
      email: profile.email,
      name: profile.name,
      customerId: stateData.customerId,
      active: true
    });

    // Dodaj rolę domyślną, jeśli brak
    await Admin.ensureUserHasRoles(user.email, DEFAULT_OAUTH_ROLES);

    // Pobierz kompletne dane użytkownika
    const userData = await Admin.getUserWithRoles(user.email);

    // Token JWT
    const token = Auth.generateToken({ userEmail: user.email });

    return res.send(new Response({
      token,
      user: {
        id: user.email,
        email: user.email,
        name: userData?.name,
        customer_id: userData?.customerId,
        roles: userData?.roles || [],
        active: userData?.active,
        Customer: userData?.Customer || null
      }
    }, true, 'OAuth login successful'));
  } catch (err) {
    console.error('OAuth callback error:', err);
    return unavailable(req, res, err);
  }
}

async function exchangeCodeForToken(provider, cfg, code) {
  if (provider === 'google') {
    const response = await axios.post(cfg.tokenUrl, null, {
      params: {
        code,
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret,
        redirect_uri: cfg.redirectUri,
        grant_type: 'authorization_code'
      }
    });
    return response.data;
  }

  if (provider === 'github') {
    const response = await axios.post(cfg.tokenUrl, null, {
      params: {
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret,
        code,
        redirect_uri: cfg.redirectUri
      },
      headers: { Accept: 'application/json' }
    });
    return response.data;
  }

  throw new Error('Unsupported provider');
}

async function fetchUserProfile(provider, cfg, tokenData) {
  if (provider === 'google') {
    const resp = await axios.get(cfg.userUrl, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    return {
      email: resp.data.email,
      name: resp.data.name || resp.data.given_name || resp.data.email,
      providerId: resp.data.id
    };
  }

  if (provider === 'github') {
    const resp = await axios.get(cfg.userUrl, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    let email = resp.data.email;
    if (!email) {
      const emailsResp = await axios.get(cfg.emailsUrl, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });
      const primary = emailsResp.data.find(e => e.primary) || emailsResp.data[0];
      email = primary?.email;
    }

    return {
      email,
      name: resp.data.name || resp.data.login,
      providerId: resp.data.id
    };
  }

  throw new Error('Unsupported provider');
}

export default {
  startOAuth,
  handleRedirect,
  processCallback
};
