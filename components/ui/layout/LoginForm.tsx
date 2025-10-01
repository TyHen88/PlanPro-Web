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
                                        <span className="px-2 bg-white text-gray-500">Or </span>
                                    </div>
                                </div>

                                {/* <div className="mt-6 grid grid-cols-2 gap-3">
                                    <button type="button" className="w-full relative group overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 group-hover:from-gray-900 group-hover:to-black transition-all duration-300"></div>
                                        <span className="relative z-10 flex items-center justify-center text-white">
                                            <Github className="mr-2 h-4 w-4" />
                                            GitHub
                                        </span>
                                    </button>
                                    <Button type="button" className="w-full relative group overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 group-hover:from-blue-500 group-hover:to-blue-600 transition-all duration-300"></div>
                                        <span className="relative z-10 flex items-center justify-center text-white">
                                            <Twitter className="mr-2 h-4 w-4" />
                                            Twitter
                                        </span>
                                    </Button>
                                </div> */}
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
