import { AuthRequest, ResetPasswordRequest, SetUpPasswordRequest, SignupRequest, UpdatePasswordRequest, VerifyForgotPasswordRequest } from "@/lib/types/auth";
import { http } from "@/utils/http";
const ServiceId = {
    LOGIN: '/api/wb/v1/auth/login',
    LOGOUT: '/api/wb/v1/auth/logout',
    SING_UP: '/api/wb/v1/auth/signup',
    SEND_OTP: '/api/wb/v1/otp/send',
    SEND_RESET_OTP: '/api/wb/v1/otp/send-reset',
    VERIFY_OTP: '/api/wb/v1/otp/verify',
    RESET_PASSWORD: '/api/wb/v1/auth/reset-password',
    TOKEN: '/api/wb/v1/auth/login/token',
    FORGOT_PASSWORD: '/api/wb/v1/auth/forgot-password',
    REFRESH_TOKEN: '/api/wb/v1/auth/get-user-session',
    SET_UP_PASSWORD: '/api/wb/v1/auth/setup-password',
    UPDATE_PASSWORD: '/api/wb/v1/auth/update-password',
}

const signup = (data: SignupRequest) => {
    return http.post(ServiceId.SING_UP, data);
}

const logout = () => {
    return http.post(ServiceId.LOGOUT);
}

const login = (data: AuthRequest) => {
    return http.post(ServiceId.LOGIN, data);
}

const forgotPassword = (data: VerifyForgotPasswordRequest) => {
    return http.post(ServiceId.FORGOT_PASSWORD, data);
}
const resetPassword = (data: ResetPasswordRequest) => {
    return http.post(ServiceId.RESET_PASSWORD, data);
}
const getRefreshToken = (data: VerifyForgotPasswordRequest) => {
    return http.get(ServiceId.REFRESH_TOKEN + `/${data.email}`);
}

const setUpPassword = (body: SetUpPasswordRequest) => {
    return http.put(ServiceId.SET_UP_PASSWORD, body);
}
const updatePassword = (body: UpdatePasswordRequest) => {
    return http.put(ServiceId.UPDATE_PASSWORD, body);
}

export const authService = {
    signup,
    logout,
    login,
    forgotPassword,
    resetPassword,
    getRefreshToken,
    setUpPassword,
    updatePassword
}