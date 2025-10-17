export interface BrowserDetails {
    browser_nm: string;
    browser_v: string;
    platform: string;
    os: string;
    user_agent: string;
}

export interface IpDetails {
    ip: string;
    network: string;
    version: string;
    city: string;
    region: string;
    region_code: string;
    country: string;
    country_name: string;
    country_code: string;
    country_code_iso3: string;
    country_capital: string;
    country_tld: string;
    continent_code: string;
    in_eu: boolean;
    postal: string;
    latitude: number;
    longitude: number;
    timezone: string;
    utc_offset: string;
    country_calling_code: string;
    currency: string;
    currency_name: string;
    languages: string;
    country_area: number;
    country_population: number;
    asn: string;
    org: string;
}

export interface IdentificationData {
    browser_details: BrowserDetails;
    ip_details: IpDetails;
}

export interface Identification {
    visitor_id: string;
    data: IdentificationData;
    timestamp: number;
    time: string;
}

export interface AuthRequest {
    user_name: string;
    password: string;
    phone_number: string;
    // app_type: string;
    // identification: Identification;
}

export interface SignupRequest {
    // app_type: string;
    user_name: string;
    email: string;
    password: string;
    // user_id: string;
    // company_name: string;
    // business_type: string;
    // tax_id: string;
    // contact_phonenumber: string;
}

export interface SendOtpRequest {
    to: string;
    region_cd: string;
    app_type?: string;
}
export interface ResetPasswordRequest {
    session_id: string;
    password: string;
    confirm_password: string;
    // phonenumber: string;
    // otp_code: string;
    // app_type?: string;
}
export interface VerifyForgotPasswordRequest {
    email: string;
}

export interface SendOptResponse {
    security_key: string;
    lifetime: number;
}

export interface VerifyOtpRequest {
    security_key: string;
    security_code: string;
    phonenumber: string;
    region_cd: string;
    app_type?: string;
}
export interface SetUpPasswordRequest {
    new_password: string;
    confirm_password: string;
}
export interface UpdatePasswordRequest {
    old_password: string;
    new_password: string;
    confirm_password: string;
}