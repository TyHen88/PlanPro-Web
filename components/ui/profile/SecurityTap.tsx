import React, { useState } from "react";
import { Button } from "@/components/shared/ui/Button";
import { Input } from "@/components/shared/ui/Input";
import { Eye, EyeOff, User } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/service/auth.service";
import { toast } from "sonner";
import { SetUpPasswordRequest, UpdatePasswordRequest } from "@/lib/types/auth";
import { useRouter } from "next/router";
import { Path } from "@/utils/enum";
import { signOut } from "next-auth/react";
import { PasswordUtils } from "@/utils/PasswordUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/shared/ui/dialog";
import { Label } from "@/components/shared/ui/label";

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
            <section className="bg-muted rounded-lg p-6 flex items-center justify-between border border-border">
                <div>
                    <div className="text-base font-semibold mb-1 text-foreground">Password</div>
                    <div className="text-sm text-muted-foreground">{!data?.is_pass ? "Setup password for your account" : "Update password for your account"}</div>
                </div>
                <Button variant="outline" onClick={() => setOpenPasswordForm(true)}>
                    {!data?.is_pass ? "Set Password" : "Update Password"}
                </Button>
            </section>

            <Dialog open={openPasswordForm} onOpenChange={setOpenPasswordForm}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{data?.is_pass ? "Update password" : "Set password"}</DialogTitle>
                        <DialogDescription>
                            {data?.is_pass ? "Update your account password" : "Setup a password for your account"}
                        </DialogDescription>
                    </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">
                        {data?.is_pass && (
                                    <div>
                                <Label htmlFor="old_password" className="text-foreground">
                                            Current password
                                </Label>
                                <div className="relative mt-1">
                                            <Input
                                                id="old_password"
                                                name="old_password"
                                                type={showNewPassword ? "text" : "password"}
                                                value={formData.old_password}
                                                onChange={handleInputChange}
                                        className={`pr-10 ${errors.old_password ? 'border-destructive' : ''}`}
                                                placeholder="Enter current password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        {errors.old_password && (
                                    <p className="text-destructive text-xs mt-1">{errors.old_password}</p>
                                        )}
                                    </div>
                        )}

                                <div>
                            <Label htmlFor="new_password" className="text-foreground">
                                        New password
                            </Label>
                            <div className="relative mt-1">
                                        <Input
                                            id="new_password"
                                            name="new_password"
                                            type={showNewPassword ? "text" : "password"}
                                            value={formData.new_password}
                                            onChange={handleInputChange}
                                    className={`pr-10 ${errors.new_password ? 'border-destructive' : ''}`}
                                            placeholder="Enter new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {errors.new_password && (
                                <p className="text-destructive text-xs mt-1">{errors.new_password}</p>
                            )}
                        </div>

                            <div>
                            <Label htmlFor="confirm_password" className="text-foreground">
                                    Confirm password
                            </Label>
                            <div className="relative mt-1">
                                    <Input
                                        id="confirm_password"
                                        name="confirm_password"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={formData.confirm_password}
                                        onChange={handleInputChange}
                                    className={`pr-10 ${errors.confirm_password ? 'border-destructive' : ''}`}
                                        placeholder="Confirm new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.confirm_password && (
                                <p className="text-destructive text-xs mt-1">{errors.confirm_password}</p>
                                )}
                            </div>

                            {data?.is_pass && (
                            <div className="flex items-start space-x-3 pt-2">
                                        <input
                                            id="signOutAllDevices"
                                            name="signOutAllDevices"
                                            type="checkbox"
                                            checked={signOutAllDevices}
                                            onChange={() => setSignOutAllDevices(!signOutAllDevices)}
                                    className="mt-1 h-4 w-4 text-primary focus:ring-primary border-input rounded"
                                        />
                                        <div>
                                    <Label htmlFor="signOutAllDevices" className="text-sm font-medium text-foreground cursor-pointer">
                                                Sign out of all other devices
                                    </Label>
                                    <p className="text-xs text-muted-foreground mt-1">
                                                It is recommended to sign out of all other devices which may have used your old password and you will need to login again.
                                            </p>
                                        </div>
                                    </div>
                            )}

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
                </DialogContent>
            </Dialog>

            {/* Connected Accounts Section */}
            <section className="bg-muted rounded-lg p-6 border border-border mt-6">
                <div className="text-base font-semibold mb-4 text-foreground">Connected Account</div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {data?.auth_provider === "GOOGLE" && (
                            <img width="25" height="25" src="https://img.icons8.com/fluency/48/google-logo.png" alt="google-logo" />
                        )}
                        {data?.auth_provider === "FACEBOOK" && (
                            <img width="25" height="25" src="https://img.icons8.com/fluency/48/facebook-logo.png" alt="facebook-logo" />
                        )}
                        {data?.auth_provider === "LOCAL" && (
                            <User size={25} className="text-muted-foreground" />
                        )}
                        <span className="font-medium text-sm text-foreground">{data?.auth_provider?.toUpperCase()}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{data?.auth_provider === "LOCAL" ? "Self-registered" : data?.email}</span>
                </div>
            </section>
        </>
    )
}
