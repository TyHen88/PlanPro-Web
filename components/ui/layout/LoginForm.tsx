import type React from "react"

import { Button } from "@/components/shared/ui/Button"
import { Input } from "@/components/shared/ui/Input"
import { Path } from "@/utils/enum"
import { ArrowRight, Eye, EyeOff, Github, Lock, Sparkles, Twitter, User } from "lucide-react"
import { signIn, useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useReducer, useState } from "react"
import { toast } from "react-hot-toast"
import { initiateGoogleLogin } from "@/utils/googleOAuth"
export default function LoginPage() {
    const router = useRouter()
    const session = useSession()
    console.log(session)
    const [email, setEmail] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [mounted, setMounted] = useState(false)

    const [loginRequest, dispatch] = useReducer((state: any, action: any): any => {
        return { ...state, ...action }
    }, {
        user_name: '',
        password: '',
        loginError: '',
        usernameError: false,
        passwordError: false,
        submitting: false
    })

    useEffect(() => {
        setMounted(true)
    }, [])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (loginRequest.submitting) return;
        dispatch({ submitting: true });
        const toastId = toast.loading("Logging in...");

        try {
            setIsLoading(true);
            setError("");

            const result = await signIn("credentials", {
                redirect: false,
                user_name: loginRequest.user_name,
                password: loginRequest.password,
                callbackUrl: Path.TRIP,
            });


            if (result?.ok) {
                toast.success("Logged in successfully");

                // Wait a moment for session to be established
                await new Promise(resolve => setTimeout(resolve, 500));

                // Try multiple redirect methods to ensure it works
                try {
                    // Method 1: Try router.push first
                    await router.push(Path.TRIP);
                } catch (error) {
                    // Method 2: Fallback to window.location
                    setTimeout(() => {
                        window.location.href = Path.TRIP;
                    }, 100);
                }
                return;
            }

            toast.error("Invalid username or password");
            setError('Invalid username or password');
        } catch (err) {
            console.error(err);

            setError("An error occurred. Please try again.");
        } finally {
            toast.dismiss(toastId)
            setIsLoading(false);
            dispatch({ submitting: false });
        }
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        dispatch({ [name]: value, loginError: "", [`${name}Error`]: false });
    }

    if (!mounted) return null

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-teal-50">
            {/* Decorative elements */}
            <div className="fixed top-0 left-0 w-64 h-64 bg-blue-500 rounded-full opacity-10 -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
            <div className="fixed top-1/3 right-0 w-96 h-96 bg-teal-400 rounded-full opacity-10 translate-x-1/2 blur-3xl"></div>
            <div className="fixed bottom-0 left-1/3 w-80 h-80 bg-yellow-400 rounded-full opacity-10 translate-y-1/2 blur-3xl"></div>

            <header className="container mx-auto px-4 py-6 relative z-10">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500 rounded-full blur-sm opacity-50 group-hover:opacity-70 transition-opacity"></div>
                        <Sparkles className="h-6 w-6 text-blue-500 relative z-10" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
                        PlanPro
                    </span>
                </Link>
            </header>

            <main className="flex-1 flex items-center justify-center p-4 relative z-10">
                <div className="w-full max-w-md">
                    <div className="relative">
                        {/* Card glow effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-teal-400 to-yellow-400 rounded-2xl opacity-50 blur-lg"></div>

                        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-white relative z-10">
                            <div className="text-center mb-8">
                                <div className="flex justify-center mb-4">
                                    <div className="relative">
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 animate-pulse blur-md"></div>
                                        <div className="relative bg-white rounded-full p-3">
                                            <Sparkles className="h-8 w-8 text-blue-500" />
                                        </div>
                                    </div>
                                </div>
                                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
                                    Welcome back
                                </h1>
                                <p className="text-gray-600">Log in to your PlanPro account</p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-start">
                                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                                        <span className="text-red-600 text-xs">!</span>
                                    </div>
                                    <p>{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Username
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-teal-400 rounded-md opacity-30 blur-sm group-hover:opacity-40 transition-opacity"></div>
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                            <User className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <Input
                                            name="user_name"
                                            type="text"
                                            placeholder="john_doe"
                                            className="pl-10 border-transparent bg-white relative z-10"
                                            value={loginRequest.user_name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                            Password
                                        </label>
                                        <Link
                                            href="/forgot-password"
                                            className="text-sm text-blue-500 hover:text-blue-600 transition-colors hover:underline"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-teal-400 rounded-md opacity-30 blur-sm group-hover:opacity-40 transition-opacity"></div>
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                            <Lock className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="pl-10 pr-10 border-transparent bg-white relative z-10"
                                            value={loginRequest.password}
                                            onChange={handleChange}
                                            required
                                            maxLength={30}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center z-10"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                                            ) : (
                                                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Button type="submit" className="w-full relative group overflow-hidden" disabled={isLoading}>
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-teal-400 to-blue-500 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:via-teal-500 group-hover:to-blue-600 transition-all duration-300"></div>
                                        <span className="relative z-10 flex items-center justify-center text-white">
                                            {isLoading ? (
                                                <>
                                                    <svg
                                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                                                    Logging in...
                                                </>
                                            ) : (
                                                <>
                                                    Log in <ArrowRight className="ml-2 h-4 w-4" />
                                                </>
                                            )}
                                        </span>
                                    </Button>
                                </div>
                            </form>

                            <div className="mt-8">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white text-gray-500">Or continue with</span>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <button
                                        type="button"
                                        onClick={initiateGoogleLogin}
                                        className="w-full relative group overflow-hidden border border-gray-300 hover:border-gray-400 rounded-lg py-2.5 transition-all duration-300"
                                    >
                                        <span className="relative z-10 flex items-center justify-center text-gray-700">
                                            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                                                <path
                                                    fill="#4285F4"
                                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                />
                                                <path
                                                    fill="#34A853"
                                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                />
                                                <path
                                                    fill="#FBBC05"
                                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                />
                                                <path
                                                    fill="#EA4335"
                                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                />
                                            </svg>
                                            Continue with Google
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <div className="mt-8 text-center">
                                <p className="text-sm text-gray-600">
                                    Don't have an account?{" "}
                                    <Link
                                        href="/register"
                                        className="font-medium text-blue-500 hover:text-blue-600 transition-colors hover:underline"
                                    >
                                        Sign up
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
