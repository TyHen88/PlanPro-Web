import CredentialsProvider from "next-auth/providers/credentials"
import NextAuth, { NextAuthOptions, Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import * as process from "node:process";
import { authService } from "@/service/auth.service";
import { AuthRequest } from "@/lib/types/auth";
import { PasswordUtils } from "@/utils/PasswordUtils";

async function refreshAccessToken(token: JWT) {
    try {
        // Since there's no refresh token endpoint, we'll extend the session
        // by updating the expiration time to give users more time
        const now = Date.now();
        const timeUntilExpiry = token.accessTokenExpires - now;

        // If token is close to expiry (less than 5 minutes), extend it
        if (timeUntilExpiry < 5 * 60 * 1000) {
            return {
                ...token,
                accessTokenExpires: now + (2 * 60 * 60 * 1000), // Extend by 2 hours
            }
        }

        // If token is still valid, return as is
        return token;
    } catch (error) {
        return {
            ...token,
            error: "RefreshAccessTokenError",
        }
    }
}

export const jwt = async ({ token, user, account }: { token: JWT; user?: User; account?: any }) => {
    // Initial sign in
    if (user && account) {
        token.token = user.data.access_token
        token.accessTokenExpires = Date.now() + (user.data.expires_in * 1000)
        token.refreshToken = undefined // No refresh token available in current API
        return token
    }

    // Return previous token if the access token has not expired yet
    if (Date.now() < token.accessTokenExpires) {
        return token
    }

    // Access token has expired, try to update it
    return await refreshAccessToken(token)
};

export const session = ({ session, token }: { session: Session; token: JWT }): Promise<Session> => {
    // Handle refresh token errors
    if (token.error) {
        session.error = token.error;
        return Promise.resolve(session);
    }

    // Validate token format
    const tokenPart = token.token?.split(".")?.at(1);
    if (!tokenPart) {
        session.error = "Invalid token format.";
        return Promise.resolve(session);
    }

    try {
        const accessTokenData = JSON.parse(atob(tokenPart));
        session.user = accessTokenData;
        session.token = token.token;
        session.accessTokenExpires = token.accessTokenExpires.toString();

        return Promise.resolve(session);
    } catch (error) {
        session.error = "Invalid token data.";
        return Promise.resolve(session);
    }
};


export const authOption: NextAuthOptions = ({
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === "development",
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                user_name: {},
                password: {},
                phone_number: {}
            },
            async authorize(credentials) {

                const authRequest: AuthRequest = {
                    user_name: credentials?.user_name ?? "",
                    password: PasswordUtils.encrypt(credentials?.password ?? ""),
                    phone_number: credentials?.phone_number ?? "",
                }
                const response = await authService.login(authRequest)
                    .catch(err => err);


                if (response.status === 200) {
                    return response.data;
                }
                throw new Error(response?.message || "Invalid username or password")
            }
        }),
        CredentialsProvider({
            id: "google-oauth",
            name: "Google OAuth",
            credentials: {
                token: { label: "Token", type: "text" },
                tokenType: { label: "Token Type", type: "text" }
            },
            async authorize(credentials): Promise<User | null> {
                try {
                    if (!credentials?.token) {
                        throw new Error("No token provided");
                    }

                    // Parse the JWT token to extract user information
                    const tokenParts = credentials.token.split(".");
                    if (tokenParts.length !== 3) {
                        throw new Error("Invalid token format");
                    }

                    // Decode the token payload
                    const payload = JSON.parse(atob(tokenParts[1]));

                    // Return user data in the format expected by NextAuth
                    const user: User = {
                        id: payload.id || payload.sub,
                        status: {
                            code: 200,
                            message: "Success"
                        },
                        data: {
                            access_token: credentials.token,
                            token_type: credentials.tokenType || "Bearer",
                            expires_in: payload.exp ? payload.exp - Math.floor(Date.now() / 1000) : 7200
                        },
                        sub: payload.sub || payload.email,
                        scope: "user"
                    };

                    return user;
                } catch (error) {
                    console.error("Google OAuth error:", error);
                    throw new Error("Failed to authenticate with Google");
                }
            }
        })
    ],
    session: {
        strategy: "jwt",
        maxAge: 2 * 60 * 60, // 2 hours
    },
    callbacks: {
        jwt,
        session
    },
    pages: {
        signIn: '/login'
    }
})

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as
     * a prop on the `SessionProvider` React Context
     */
    interface Session {
        refreshTokenExpires?: number;
        accessTokenExpires?: string;
        refreshToken?: string;
        token?: string;
        error?: string;
        user?: User;
    }

    interface User {
        id?: string;
        status: {
            code: number;
            message: string;
        };
        data: {
            access_token: string;
            token_type: string;
            expires_in: number;
        };
        sub: string;
        scope: string;
    }
}

declare module "next-auth/jwt" {
    /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
    interface JWT {
        refreshTokenExpires?: number;
        accessTokenExpires: number;
        refreshToken?: string;
        token: string;
        exp?: number;
        iat?: number;
        jti?: string;
        error?: string;
    }
}

export default NextAuth(authOption);