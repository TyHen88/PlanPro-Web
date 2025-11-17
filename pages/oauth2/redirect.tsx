import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { Sparkles } from "lucide-react";
import { Path } from "@/utils/enum";
import { toast } from "sonner";

export default function OAuth2Redirect() {
    const router = useRouter();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const handleOAuth2Redirect = async () => {
            // Get token and type from URL params
            const { token, type } = router.query;

            if (!token || !type) {
                // Wait for query params to be available
                if (router.isReady) {
                    setStatus("error");
                    setErrorMessage("Missing authentication credentials");
                }
                return;
            }

            try {
                // Sign in using the OAuth token
                const result = await signIn("google-oauth", {
                    redirect: false,
                    token: token as string,
                    tokenType: type as string,
                });

                if (result?.ok) {
                    setStatus("success");
                    // Wait a moment for session to be established
                    await new Promise(resolve => setTimeout(resolve, 500));
                    toast.success("Authentication successful");
                    // Redirect to main app
                    router.push(Path.TRIP);
                } else {
                    setStatus("error");
                    setErrorMessage(result?.error || "Authentication failed");
                }
            } catch (error) {
                console.error("OAuth redirect error:", error);
                setStatus("error");
                setErrorMessage("An unexpected error occurred");
            }
        };

        handleOAuth2Redirect();
    }, [router.query, router.isReady]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-teal-50">
            {/* Decorative elements */}
            <div className="fixed top-0 left-0 w-64 h-64 bg-blue-500 rounded-full opacity-10 -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
            <div className="fixed top-1/3 right-0 w-96 h-96 bg-teal-400 rounded-full opacity-10 translate-x-1/2 blur-3xl"></div>
            <div className="fixed bottom-0 left-1/3 w-80 h-80 bg-yellow-400 rounded-full opacity-10 translate-y-1/2 blur-3xl"></div>

            <div className="relative z-10 max-w-md w-full mx-4">
                <div className="relative">
                    {/* Card glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-teal-400 to-yellow-400 rounded-2xl opacity-50 blur-lg"></div>

                    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-white relative z-10">
                        <div className="text-center">
                            <div className="flex justify-center mb-6">
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 animate-pulse blur-md"></div>
                                    <div className="relative bg-white rounded-full p-4">
                                        <Sparkles className="h-10 w-10 text-blue-500" />
                                    </div>
                                </div>
                            </div>

                            {status === "loading" && (
                                <>
                                    <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
                                        Authenticating with Google
                                    </h1>
                                    <p className="text-gray-600 mb-6">Please wait while we verify your credentials...</p>
                                    <div className="flex justify-center">
                                        <svg
                                            className="animate-spin h-8 w-8 text-blue-500"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                    </div>
                                </>
                            )}

                            {status === "success" && (
                                <>
                                    <div className="mb-4">
                                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                            <svg
                                                className="w-8 h-8 text-green-500"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M5 13l4 4L19 7"
                                                ></path>
                                            </svg>
                                        </div>
                                    </div>
                                    <h1 className="text-2xl font-bold mb-2 text-green-600">
                                        Authentication Successful!
                                    </h1>
                                    <p className="text-gray-600">Redirecting to your dashboard...</p>
                                </>
                            )}

                            {status === "error" && (
                                <>
                                    <div className="mb-4">
                                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                            <svg
                                                className="w-8 h-8 text-red-500"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M6 18L18 6M6 6l12 12"
                                                ></path>
                                            </svg>
                                        </div>
                                    </div>
                                    <h1 className="text-2xl font-bold mb-2 text-red-600">
                                        Authentication Failed
                                    </h1>
                                    <p className="text-gray-600 mb-6">{errorMessage}</p>
                                    <button
                                        onClick={() => router.push("/login")}
                                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                        Back to Login
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

OAuth2Redirect.getLayout = (page: React.ReactElement) => page;

