import React, { useState } from "react";
import { Button } from "@/components/shared/ui/Button";
import { Input } from "@/components/shared/ui/Input";
import { Eye, EyeOff, X, User } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/service/auth.service";
import toast from "react-hot-toast";
import { SetUpPasswordRequest, UpdatePasswordRequest } from "@/lib/types/auth";
import { useRouter } from "next/router";
import { Path } from "@/utils/enum";
import { signOut } from "next-auth/react";
import { PasswordUtils } from "@/utils/PasswordUtils";

type Props = {
    data: any
}

export default function SecurityTap({ data }: Props) {
    const router = useRouter();
    const [openPasswordForm, setOpenPasswordForm] = useState(false)
    const [formData, setFormData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: '',
    })

    const [errors, setErrors] = useState<{ [key: string]: string }>({})
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [signOutAllDevices, setSignOutAllDevices] = useState(false)
    const { mutate: setUpPassword, isPending: isLoadingSetUpPassword } = useMutation({
        mutationFn: (body: SetUpPasswordRequest) => authService.setUpPassword(body),
        onSuccess: async () => {
            toast.success('Password setup successfully')
            setOpenPasswordForm(false)
            setFormData({ old_password: '', new_password: '', confirm_password: '' })

            if (signOutAllDevices) {
                setTimeout(async () => {
                    await handleSignOutAllDevices()
                }, 2000)
            }
        },
        onError: (error: unknown) => {
            toast.error((error as { message?: string }).message || 'Failed to setup password')
        }
    });

    const { mutate: updatePassword, isPending: isLoadingUpdatePassword } = useMutation({
        mutationFn: (body: UpdatePasswordRequest) => authService.updatePassword(body),
        onSuccess: async () => {
            toast.success('Password updated successfully')
            setOpenPasswordForm(false)
            setFormData({ old_password: '', new_password: '', confirm_password: '' })

            if (signOutAllDevices) {
                setTimeout(async () => {
                    await handleSignOutAllDevices()
                }, 2000)
            }
        },
        onError: (error: unknown) => {
            toast.error((error as { message?: string }).message || 'Failed to update password')
        }
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {}

        // Validate old password for update scenario
        if (data?.is_pass && !formData.old_password) {
            newErrors.old_password = 'Current password is required'
        }

        if (!formData.new_password) {
            newErrors.new_password = 'Password is required'
        } else if (formData.new_password.length < 8) {
            newErrors.new_password = 'Password must be at least 8 characters'
        }

        if (!formData.confirm_password) {
            newErrors.confirm_password = 'Please confirm your password'
        } else if (formData.new_password !== formData.confirm_password) {
            newErrors.confirm_password = 'Passwords do not match'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (validateForm()) {
            if (!data?.is_pass) {
                setUpPassword({
                    new_password: PasswordUtils.encrypt(formData.new_password),
                    confirm_password: PasswordUtils.encrypt(formData.confirm_password)
                })
            } else {
                updatePassword({
                    old_password: formData.old_password,
                    new_password: PasswordUtils.encrypt(formData.new_password),
                    confirm_password: PasswordUtils.encrypt(formData.confirm_password)
                })
            }
        }
    }
    const handleClose = () => {
        setOpenPasswordForm(false)
        setFormData({ old_password: '', new_password: '', confirm_password: '' })
        setErrors({})
    }




    const handleSignOutAllDevices = async () => {
        try {
            await signOut({
                callbackUrl: Path.LOGIN,
                redirect: false,
            });
            router.push(Path.LOGIN);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };
    return (
        <>
            {/* Password Section */}
            <section className="bg-muted rounded-lg p-6 flex items-center justify-between">
                <div>
                    <div className="text-base font-semibold mb-1">Password</div>
                    <div className="text-sm text-muted-foreground">{!data?.is_pass ? "Setup password for your account" : "Update password for your account"}</div>
                </div>
                <Button variant="outline" onClick={() => setOpenPasswordForm(true)}>
                    {!data?.is_pass ? "Set Password" : "Update Password"}
                </Button>
            </section>

            {openPasswordForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">{data?.is_pass ? "Set password" : "Update password"}</h2>
                            <button
                                onClick={handleClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* New Password Field */}
                            {data?.is_pass ? (
                                <>

                                    <div>
                                        <label htmlFor="old_password" className="block text-sm font-medium text-gray-700 mb-1">
                                            Current password
                                        </label>
                                        <div className="relative">
                                            <Input
                                                id="old_password"
                                                name="old_password"
                                                type={showNewPassword ? "text" : "password"}
                                                value={formData.old_password}
                                                onChange={handleInputChange}
                                                className={`pr-10 ${errors.old_password ? 'border-red-500' : ''}`}
                                                placeholder="Enter current password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        {errors.old_password && (
                                            <p className="text-red-500 text-xs mt-1">{errors.old_password}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-1">
                                            New password
                                        </label>
                                        <div className="relative">
                                            <Input
                                                id="new_password"
                                                name="new_password"
                                                type={showNewPassword ? "text" : "password"}
                                                value={formData.new_password}
                                                onChange={handleInputChange}
                                                className={`pr-10 ${errors.new_password ? 'border-red-500' : ''}`}
                                                placeholder="Enter new password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        {errors.new_password && (
                                            <p className="text-red-500 text-xs mt-1">{errors.new_password}</p>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-1">
                                        New password
                                    </label>
                                    <div className="relative">
                                        <Input
                                            id="new_password"
                                            name="new_password"
                                            type={showNewPassword ? "text" : "password"}
                                            value={formData.new_password}
                                            onChange={handleInputChange}
                                            className={`pr-10 ${errors.new_password ? 'border-red-500' : ''}`}
                                            placeholder="Enter new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {errors.new_password && (
                                        <p className="text-red-500 text-xs mt-1">{errors.new_password}</p>
                                    )}
                                </div>
                            )}

                            {/* Confirm Password Field */}
                            <div>
                                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm password
                                </label>
                                <div className="relative">
                                    <Input
                                        id="confirm_password"
                                        name="confirm_password"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={formData.confirm_password}
                                        onChange={handleInputChange}
                                        className={`pr-10 ${errors.confirm_password ? 'border-red-500' : ''}`}
                                        placeholder="Confirm new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.confirm_password && (
                                    <p className="text-red-500 text-xs mt-1">{errors.confirm_password}</p>
                                )}
                            </div>
                            {data?.is_pass && (
                                <>
                                    {/* Sign out checkbox */}
                                    <div className="flex items-start space-x-3">
                                        <input
                                            id="signOutAllDevices"
                                            name="signOutAllDevices"
                                            type="checkbox"
                                            checked={signOutAllDevices}
                                            onChange={() => setSignOutAllDevices(!signOutAllDevices)}
                                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <div>
                                            <label htmlFor="signOutAllDevices" className="text-sm font-medium text-gray-700">
                                                Sign out of all other devices
                                            </label>
                                            <p className="text-xs text-gray-500 mt-1">
                                                It is recommended to sign out of all other devices which may have used your old password and you will need to login again.
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleClose}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="default"
                                    disabled={isLoadingSetUpPassword || isLoadingUpdatePassword}
                                >
                                    {(isLoadingSetUpPassword || isLoadingUpdatePassword) ? 'Saving...' : 'Save'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Connected Accounts Section */}
            <section className="bg-muted rounded-lg p-6">
                <div className="text-base font-semibold mb-4">Connected Account</div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {data?.auth_provider === "GOOGLE" && (
                            <img width="25" height="25" src="https://img.icons8.com/fluency/48/google-logo.png" alt="google-logo" />
                        )}
                        {data?.auth_provider === "FACEBOOK" && (
                            <img width="25" height="25" src="https://img.icons8.com/fluency/48/facebook-logo.png" alt="facebook-logo" />
                        )}
                        {data?.auth_provider === "LOCAL" && (
                            <User size={25} className="text-gray-400" />
                        )}
                        <span className="font-medium text-sm">{data?.auth_provider?.toUpperCase()}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{data?.auth_provider === "LOCAL" ? "Self-registered" : data?.email}</span>
                </div>
            </section>
        </>
    )
}
