/**
 * Google OAuth2 Utilities
 * Functions to handle Google OAuth authentication flow
 */

/**
 * Initiates Google OAuth login by redirecting to backend OAuth endpoint
 */
export const initiateGoogleLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    // Redirect to backend Google OAuth endpoint
    // Backend uses Spring Security OAuth2 which has /oauth2/authorization/{provider} endpoint
    // Spring Security will handle the OAuth flow and redirect back based on backend configuration
    window.location.href = `${apiUrl}/oauth2/authorization/google`;
};

/**
 * Initiates Google OAuth registration by redirecting to backend OAuth endpoint
 * Same as login since OAuth typically handles both login and registration
 */
export const initiateGoogleRegister = () => {
    // For OAuth, login and register are typically the same flow
    // The backend determines if it's a new user and creates an account if needed
    initiateGoogleLogin();
};

/**
 * Extracts OAuth parameters from URL query string
 * @param queryString - The URL query string
 * @returns Object containing token and type
 */
export const extractOAuthParams = (queryString: string): { token?: string; type?: string } => {
    const params = new URLSearchParams(queryString);
    return {
        token: params.get('token') || undefined,
        type: params.get('type') || undefined,
    };
};

/**
 * Validates a JWT token format
 * @param token - The JWT token to validate
 * @returns true if token format is valid
 */
export const isValidJWT = (token: string): boolean => {
    const parts = token.split('.');
    return parts.length === 3;
};

/**
 * Decodes a JWT token payload
 * @param token - The JWT token to decode
 * @returns Decoded payload object or null if invalid
 */
export const decodeJWT = (token: string): any | null => {
    try {
        if (!isValidJWT(token)) {
            return null;
        }
        const payload = token.split('.')[1];
        return JSON.parse(atob(payload));
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
};

