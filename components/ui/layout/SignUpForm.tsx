import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Sparkles,
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    CheckCircle,
} from "lucide-react";
import { Input } from "@/components/shared/ui/Input";
import { Button } from "@/components/shared/ui/Button";
import { useForm } from "react-hook-form";
import { useFormContextState } from "@/lib/hooks/useFromState";
import useSignUpMutation from "@/lib/hooks/useSignUpMutation";
import { PasswordUtils } from "@/utils/PasswordUtils";
import { toast } from "sonner";
import { initiateGoogleRegister } from "@/utils/googleOAuth";

interface RegisterFormValues {
    first_name: string;
    last_name: string;
    user_name: string;
    email: string;
    phone_number: string;
    password: string;
}

export default function RegisterPage() {
    const { state } = useFormContextState();

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [mounted, setMounted] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { isSubmitting },
        watch,
        setError: setFormError,
    } = useForm<RegisterFormValues>({
        mode: "onChange",
        defaultValues: {
            first_name: typeof state?.value === 'object' && state.value !== null && 'data' in state.value && (state.value as any).data?.first_name ? (state.value as any).data.first_name : "",
            last_name: typeof state?.value === 'object' && state.value !== null && 'data' in state.value && (state.value as any).data?.last_name ? (state.value as any).data.last_name : "",
            user_name: typeof state?.value === 'object' && state.value !== null && 'data' in state.value && (state.value as any).data?.user_name ? (state.value as any).data.user_name : "",
            email: typeof state?.value === 'object' && state.value !== null && 'data' in state.value && (state.value as any).data?.email ? (state.value as any).data.email : "",
            phone_number: typeof state?.value === 'object' && state.value !== null && 'data' in state.value && (state.value as any).data?.phone_number ? (state.value as any).data.phone_number : "",
            password: typeof state?.value === 'object' && state.value !== null && 'data' in state.value && (state.value as any).data?.email?.password ? PasswordUtils.encrypt((state.value as any).data.email.password) : "",
        },
    });
    const mutation = useSignUpMutation(setFormError);
    const password = watch("password");

    useEffect(() => {
        setMounted(true);
    }, []);

    const onSubmit = async (data: RegisterFormValues) => {
        setError("");
        const toastId = toast.loading("Signing up...");
        try {
            const requestBody = {
                first_name: data.first_name,
                last_name: data.last_name,
                user_name: data.user_name,
                email: data.email,
                phone_number: data.phone_number,
                password: PasswordUtils.encrypt(data.password),
            };

            const response: any = await mutation.mutate(requestBody, {
                onError: (err) => {
                    console.error("Registration error:", err);
                    setError("Registration failed. Please try again.");
                },
                onSuccess: () => {
                    toast.success("Account created successfully!");
                }
            });
        } catch (err) {
            console.error("Unexpected registration error:", err);
            setError("An unexpected error occurred.");
        } finally {
            toast.dismiss(toastId);
        }
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50/50 dark:from-orange-950/20 via-background to-yellow-50/50 dark:to-yellow-950/20">
            {/* Background Decorations */}
            <div className="fixed top-0 right-0 w-64 h-64 bg-orange-400 rounded-full opacity-10 dark:opacity-20 translate-x-1/2 -translate-y-1/2 blur-3xl" />
            <div className="fixed top-1/3 left-0 w-96 h-96 bg-yellow-400 rounded-full opacity-10 dark:opacity-20 -translate-x-1/2 blur-3xl" />
            <div className="fixed bottom-0 right-1/3 w-80 h-80 bg-green-400 rounded-full opacity-10 dark:opacity-20 translate-y-1/2 blur-3xl" />

            <header className="container mx-auto px-4 py-6 relative z-10">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="relative">
                        <div className="absolute inset-0 bg-orange-400 rounded-full blur-sm opacity-50 group-hover:opacity-70 transition-opacity" />
                        <Sparkles className="h-6 w-6 text-orange-500 relative z-10" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                        PlanPro
                    </span>
                </Link>
            </header>

            <main className="flex-1 flex items-center justify-center p-4 relative z-10">
                <div className="w-full max-w-md">
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 via-yellow-400 to-green-400 rounded-2xl opacity-50 blur-lg" />

                        <div className="bg-card/90 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-border relative z-10">
                            <div className="text-center mb-8">
                                <div className="flex justify-center mb-4">
                                    <div className="relative">
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 to-yellow-400 animate-pulse blur-md" />
                                        <div className="relative bg-card rounded-full p-3">
                                            <Sparkles className="h-8 w-8 text-orange-500" />
                                        </div>
                                    </div>
                                </div>
                                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                                    Create your account
                                </h1>
                                <p className="text-muted-foreground">Start planning smarter with PlanPro</p>
                                <p className="text-muted-foreground">Already have an account? <Link href="/login" className="text-primary hover:text-primary/80">Login</Link></p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm">
                                    <p>{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                {/* Name (First and Last side by side) */}
                                <div className="flex space-x-4">
                                    {/* First Name */}
                                    <div className="flex-1 space-y-2">
                                        <label htmlFor="first_name" className="block text-sm font-medium text-foreground">
                                            First Name
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                                <User className="h-5 w-5 text-orange-500" />
                                            </div>
                                            <Input
                                                type="text"
                                                id="first_name"
                                                placeholder="First Name"
                                                className="pl-10 border-transparent bg-background relative z-10"
                                                {...register("first_name", { required: "First name is required" })}
                                            />
                                        </div>
                                    </div>
                                    {/* Last Name */}
                                    <div className="flex-1 space-y-2">
                                        <label htmlFor="last_name" className="block text-sm font-medium text-foreground">
                                            Last Name
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                                <User className="h-5 w-5 text-orange-500" />
                                            </div>
                                            <Input
                                                type="text"
                                                id="last_name"
                                                placeholder="Last Name"
                                                className="pl-10 border-transparent bg-background relative z-10"
                                                {...register("last_name", { required: "Last name is required" })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="name" className="block text-sm font-medium text-foreground">
                                        Username
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                            <User className="h-5 w-5 text-orange-500" />
                                        </div>
                                        <Input
                                            type="text"
                                            placeholder="John Doe"
                                            className="pl-10 border-transparent bg-background relative z-10"
                                            {...register("user_name", { required: "Full name is required" })}
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <label htmlFor="email" className="block text-sm font-medium text-foreground">
                                        Email
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                            <Mail className="h-5 w-5 text-orange-500" />
                                        </div>
                                        <Input
                                            type="email"
                                            placeholder="you@example.com"
                                            className="pl-10 border-transparent bg-background relative z-10"
                                            {...register("email", { required: "Email is required" })}
                                        />
                                    </div>
                                </div>

                                {/* Phone Number */}

                                <div className="space-y-2">
                                    <label htmlFor="phone_number" className="block text-sm font-medium text-foreground">
                                        Phone Number
                                    </label>
                                </div>

                                <Input
                                    type="tel"
                                    placeholder="1234567890"
                                    className="pl-10 border-transparent bg-background relative z-10"
                                    {...register("phone_number", { required: "Phone number is required" })}
                                />

                                {/* Password */}
                                <div className="space-y-2">
                                    <label htmlFor="password" className="block text-sm font-medium text-foreground">
                                        Password
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                            <Lock className="h-5 w-5 text-orange-500" />
                                        </div>
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="pl-10 pr-10 border-transparent bg-background relative z-10"
                                            {...register("password", { required: "Password is required" })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center z-10"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
                                        </button>
                                    </div>

                                    {/* Password rules */}
                                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                                        <div className="flex items-center">
                                            <CheckCircle className={`h-3 w-3 mr-1.5 ${password.length >= 8 ? "text-green-500" : "text-muted-foreground/50"}`} />
                                            At least 8 characters
                                        </div>
                                        <div className="flex items-center">
                                            <CheckCircle className={`h-3 w-3 mr-1.5 ${/[A-Z]/.test(password) ? "text-green-500" : "text-muted-foreground/50"}`} />
                                            At least one uppercase letter
                                        </div>
                                        <div className="flex items-center">
                                            <CheckCircle className={`h-3 w-3 mr-1.5 ${/[0-9]/.test(password) ? "text-green-500" : "text-muted-foreground/50"}`} />
                                            At least one number
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Creating account..." : "Sign Up"}
                                </Button>
                            </form>

                            <div className="mt-8">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-border"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <button
                                        type="button"
                                        onClick={initiateGoogleRegister}
                                        className="w-full relative group overflow-hidden border border-border hover:border-border/80 rounded-lg py-2.5 transition-all duration-300"
                                    >
                                        <span className="relative z-10 flex items-center justify-center text-foreground">
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
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
