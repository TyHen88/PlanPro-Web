
import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Sparkles, Mail, ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/shared/ui/Button"
import { Input } from "@/components/shared/ui/Input"
import { authService } from "@/service/auth.service"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { useFetchAuthRefreshToken } from "@/lib/hooks/useFetchAuthRefreshToken"
import { ResetPasswordRequest, VerifyForgotPasswordRequest } from "@/lib/types/auth"
import { PasswordUtils } from "@/utils/PasswordUtils"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [showPasswordForm, setShowPasswordForm] = useState(false)
    const [mounted, setMounted] = useState(false)

    // Password visibility state
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    //mutate
    const mutationResetPassword = useMutation({
        mutationFn: (data: ResetPasswordRequest) => authService.resetPassword(data),
        onSuccess: () => {
            setSuccess(true)
            setShowPasswordForm(false)
            toast.success("Password reset successfully! You can now login with your new password.")
        },
        onError: (error: unknown) => {
            toast.error("Reset failed. Please try again.")
        }
    })
    const { mutate: forgotPassword, isPending: isLoadingForgotPassword, isError: isErrorForgotPassword } = useMutation({
        mutationFn: (data: VerifyForgotPasswordRequest) => authService.forgotPassword(data),
        onSuccess: () => {
            setSuccess(true)
            setShowPasswordForm(true)
            toast.success("Email verified successfully. Please set your new password.")
        },
        onError: (error: unknown) => {
            toast.error("Verify failed. Please try again.")
        }
    })
    const { data: authData, isLoading: isLoadingAuthData, isError: isErrorAuthData } = useFetchAuthRefreshToken(email)
    console.log("authData", authData)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setSuccess(false)

        if (!email) {
            setError("Please enter your email address")
            return
        }

        try {
            setIsLoading(true)
            // Simulate API call
            // await new Promise((resolve) => setTimeout(resolve, 1500))
            const requestBody: VerifyForgotPasswordRequest = {
                email: email
            }
            console.log("requestBody", requestBody)
            forgotPassword(requestBody)
            // In a real app, you would handle password reset here
            console.log("Password reset requested for:", email)
            // setSuccess(true)
        } catch (err) {
            setError("Failed to send reset link. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setSuccess(false)

        const password = (e.target as HTMLFormElement).password.value
        const confirmPassword = (e.target as HTMLFormElement).confirm_password.value

        if (!password || !confirmPassword) {
            setError("Please fill in all fields")
            return
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long")
            return
        }

        try {
            setIsLoading(true)
            const requestBody: ResetPasswordRequest = {
                session_id: authData?.data?.data?.token,
                password: PasswordUtils.encrypt(password),
                confirm_password: PasswordUtils.encrypt(confirmPassword)
            }
            console.log("requestBody", requestBody)
            mutationResetPassword.mutate(requestBody)
        } catch (err) {
            setError("Failed to reset password. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    if (!mounted) return null

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50/50 dark:from-green-950/20 via-background to-teal-50/50 dark:to-teal-950/20">
            {/* Decorative elements */}
            <div className="fixed top-0 left-0 w-64 h-64 bg-green-400 rounded-full opacity-10 dark:opacity-20 -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
            <div className="fixed top-1/3 right-0 w-96 h-96 bg-teal-400 rounded-full opacity-10 dark:opacity-20 translate-x-1/2 blur-3xl"></div>
            <div className="fixed bottom-0 left-1/3 w-80 h-80 bg-blue-500 rounded-full opacity-10 dark:opacity-20 translate-y-1/2 blur-3xl"></div>

            <header className="container mx-auto px-4 py-6 relative z-10">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="relative">
                        <div className="absolute inset-0 bg-green-400 rounded-full blur-sm opacity-50 group-hover:opacity-70 transition-opacity"></div>
                        <Sparkles className="h-6 w-6 text-green-500 relative z-10" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                        PlanPro
                    </span>
                </Link>
            </header>

            <main className="flex-1 flex items-center justify-center p-4 relative z-10">
                <div className="w-full max-w-md">
                    <div className="relative">
                        {/* Card glow effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-green-400 via-teal-400 to-blue-500 rounded-2xl opacity-50 blur-lg"></div>

                        <div className="bg-card/90 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-border relative z-10">
                            <div className="text-center mb-8">
                                <div className="flex justify-center mb-4">
                                    <div className="relative">
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-teal-400 animate-pulse blur-md"></div>
                                        <div className="relative bg-card rounded-full p-3">
                                            <Sparkles className="h-8 w-8 text-green-500" />
                                        </div>
                                    </div>
                                </div>
                                {!showPasswordForm && (
                                    <>
                                        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                                            Verify your email
                                        </h1>
                                        <p className="text-muted-foreground">We&apos;ll send you a link to verify your email</p>
                                    </>
                                )}
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm flex items-start">
                                    <div className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                                        <span className="text-destructive text-xs">!</span>
                                    </div>
                                    <p>{error}</p>
                                </div>
                            )}

                            {success && !showPasswordForm ? (
                                <div className="space-y-6">
                                    <div className="p-6 bg-green-50/50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-lg relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-teal-400"></div>
                                        <div className="flex items-start">
                                            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mr-4 flex-shrink-0">
                                                <Mail className="h-5 w-5 text-green-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-lg">Password reset successfully!</p>
                                                <p className="mt-1 text-sm">
                                                    Your password has been reset successfully. You can now login with your new password.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <Link href="/login">
                                        <Button type="button" className="w-full relative group overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-teal-400 to-green-400 group-hover:bg-gradient-to-r group-hover:from-green-500 group-hover:via-teal-500 group-hover:to-green-500 transition-all duration-300"></div>
                                            <span className="relative z-10 flex items-center justify-center text-white">
                                                <ArrowLeft className="mr-2 h-4 w-4" /> Back to login
                                            </span>
                                        </Button>
                                    </Link>
                                </div>
                            ) : showPasswordForm ? (
                                <form onSubmit={handleResetPassword} className="space-y-6">
                                    <div className="text-center mb-6">
                                        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                                            Set New Password
                                        </h2>
                                        <p className="text-muted-foreground">Enter your new password below</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label htmlFor="email" className="block text-sm font-medium text-foreground">
                                                Email
                                            </label>
                                            <div className="relative flex items-center">
                                                <input
                                                    id="email"
                                                    type="text"
                                                    value={authData?.data?.data?.email || ""}
                                                    readOnly
                                                    className="w-full border border-input rounded-md px-3 py-2 bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-not-allowed"
                                                    tabIndex={-1}
                                                />
                                                {/* Success icon on the right */}
                                                <span className="absolute right-3 flex items-center">
                                                    <svg
                                                        className="h-5 w-5 text-green-500"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth={2}
                                                    >
                                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#d1fae5" />
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M9 12l2 2l4-4"
                                                            stroke="#10b981"
                                                            strokeWidth="2"
                                                            fill="none"
                                                        />
                                                    </svg>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="password" className="block text-sm font-medium text-foreground">
                                                New Password
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-teal-400 rounded-md opacity-30 blur-sm group-hover:opacity-40 transition-opacity"></div>
                                                <Input
                                                    id="password"
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Enter new password"
                                                    className="border-transparent bg-background relative z-10 pr-10"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    tabIndex={-1}
                                                    onClick={() => setShowPassword((prev) => !prev)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 text-muted-foreground hover:text-primary focus:outline-none"
                                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-5 w-5" />
                                                    ) : (
                                                        <Eye className="h-5 w-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="confirm_password" className="block text-sm font-medium text-foreground">
                                                Confirm Password
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-teal-400 rounded-md opacity-30 blur-sm group-hover:opacity-40 transition-opacity"></div>
                                                <Input
                                                    id="confirm_password"
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder="Confirm new password"
                                                    className="border-transparent bg-background relative z-10 pr-10"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    tabIndex={-1}
                                                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 text-muted-foreground hover:text-primary focus:outline-none"
                                                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff className="h-5 w-5" />
                                                    ) : (
                                                        <Eye className="h-5 w-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <Button type="submit" className="w-full relative group overflow-hidden" disabled={isLoading}>
                                            <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-teal-400 to-green-400 group-hover:bg-gradient-to-r group-hover:from-green-500 group-hover:via-teal-500 group-hover:to-green-500 transition-all duration-300"></div>
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
                                                        Resetting...
                                                    </>
                                                ) : (
                                                    <>
                                                        Reset Password <ArrowRight className="ml-2 h-4 w-4" />
                                                    </>
                                                )}
                                            </span>
                                        </Button>
                                    </div>

                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowPasswordForm(false)
                                                setSuccess(false)
                                                setError("")
                                            }}
                                            className="text-sm text-primary hover:text-primary/80 transition-colors hover:underline"
                                        >
                                            Back to email verification
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="block text-sm font-medium text-foreground">
                                            Email
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-teal-400 rounded-md opacity-30 blur-sm group-hover:opacity-40 transition-opacity"></div>
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                                <Mail className="h-5 w-5 text-green-500" />
                                            </div>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="you@example.com"
                                                className="pl-10 border-transparent bg-background relative z-10"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <Button type="submit" className="w-full relative group overflow-hidden" disabled={isLoading}>
                                            <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-teal-400 to-green-400 group-hover:bg-gradient-to-r group-hover:from-green-500 group-hover:via-teal-500 group-hover:to-green-500 transition-all duration-300"></div>
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
                                                        Verifying...
                                                    </>
                                                ) : (
                                                    <>
                                                        Verify <ArrowRight className="ml-2 h-4 w-4" />
                                                    </>
                                                )}
                                            </span>
                                        </Button>
                                    </div>

                                    <div className="text-center">
                                        <Link
                                            href="/login"
                                            className="text-sm text-primary hover:text-primary/80 transition-colors hover:underline"
                                        >
                                            Back to login
                                        </Link>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
