import { Button } from '@/components/shared/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/shared/ui/dialog'
import { MessageCircle } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import ProfileContrainer from '../profile/ProfileContrainer'
import { useFetchProfile } from '@/lib/hooks/useFetchProfile'

const IsTelegramPopup = ({ open, onClose }: { open: boolean, onClose: () => void }) => {
    const { data: profile_data } = useFetchProfile()
    const [showProfile, setShowProfile] = useState(false)
    const [shouldCloseDialog, setShouldCloseDialog] = useState(false)

    // When showProfile is triggered, close the dialog after the next tick
    useEffect(() => {
        if (showProfile) {
            setShouldCloseDialog(true)
        }
    }, [showProfile])

    // Actually close the dialog after rendering ProfileContrainer
    useEffect(() => {
        if (shouldCloseDialog) {
            onClose()
            setShouldCloseDialog(false)
        }
    }, [shouldCloseDialog, onClose])

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="max-w-md mx-auto">
                    <DialogHeader className="text-center pb-6">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                            <MessageCircle className="w-8 h-8 text-white" />
                        </div>
                        <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            You are a disabled reminder feature.
                        </DialogTitle>
                        <p className="text-gray-500 text-sm mt-2 text-center">
                            Please visit the Telegram settings to enable your account.
                        </p>
                        <div className="flex flex-col gap-2 mt-4">
                            {/* <Button
                                onClick={() => setShowProfile(true)}
                                className="w-full"
                            >
                                Go to Telegram settings
                            </Button> */}
                            <Button
                                onClick={onClose}
                                variant="secondary"
                                className="w-full"
                            >
                                Close
                            </Button>
                        </div>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
            {showProfile && (
                <ProfileContrainer
                    showProfile={showProfile}
                    profile_data={profile_data}
                    onClose={() => setShowProfile(false)}
                />
            )}
        </>
    )
}

export default IsTelegramPopup