import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/shared/ui/dialog'
import { Button } from '@/components/shared/ui/Button'
import { Input } from '@/components/shared/ui/Input'
import { MessageCircle, Check, Zap, User, Shield, Loader2, Send, X } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import TelegramService from '@/service/telegram.service'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useFetchTelegram } from '@/lib/hooks/useFetchTelegram'

type Props = {
    open: boolean;
    onClose: () => void;
};

type TelegramUserInfo = {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
};

const ConnectTelegramBot = ({ open, onClose }: Props) => {
    const [chatId, setChatId] = useState('')
    const [verifying, setVerifying] = useState(false)
    const [verified, setVerified] = useState(false)
    const [userInfo, setUserInfo] = useState<TelegramUserInfo | null>(null)
    const [connecting, setConnecting] = useState(false)
    const [connected, setConnected] = useState(false)
    const [step, setStep] = useState(1) // 1: Enter ID, 2: Verify, 3: Connect
    const { historyData } = useFetchTelegram()
    const isConnected = historyData?.data?.data?.connected || null;
    const queryClient = useQueryClient()
    const { mutate: connectTelegram } = useMutation({
        mutationFn: async () => await TelegramService.connectTelegram(Number(chatId)),
        onSuccess: async () => {
            toast.success('Telegram connected.')
            queryClient.invalidateQueries({ queryKey: ["telegramUserInfo"] })
        },
        onError: () => {
            toast.error('Failed to connect to Telegram.')
        },
        onSettled: () => {
        }
    })
    const { mutate: verifyTelegram } = useMutation({
        mutationFn: async () => {
            const response = await TelegramService.verifyTelegram(Number(chatId));
            return response.data.data as TelegramUserInfo;
        },
        onSuccess: async (data: TelegramUserInfo) => {
            await queryClient.invalidateQueries({ queryKey: ["telegramUserInfo"] })
            toast.success('Telegram verified.')
            setUserInfo(data)
            setVerified(true)
            setStep(3)
        },
        onError: (error: any) => {
            toast.error('Failed to verify Telegram.')
            setStep(1)
            if (error?.response?.data?.message) {
                toast.error(error?.response?.data?.message)
            }
        },
        onSettled: () => {
            setVerifying(false)
            queryClient.invalidateQueries({ queryKey: ["telegramUserInfo"] })
        }
    })


    // Mock functions for demo purposes
    const handleVerify = () => {
        //validate chat id using regex
        const regex = /^[0-9]+$/
        if (!regex.test(chatId)) {
            toast.error('Please enter a valid chat ID')
            return;
        }
        setVerifying(true)
        verifyTelegram()
    }


    const handleConnect = async () => {
        setConnecting(true)
        try {
            await new Promise((resolve, reject) => {
                connectTelegram(undefined, {
                    onSuccess: () => {
                        setConnected(true)
                        setConnecting(false)
                        setTimeout(() => {
                            onClose()
                        }, 1500)
                        resolve(undefined)
                    },
                    onError: (error) => {
                        setConnecting(false)
                        reject(error)
                    }
                })
            })
        } catch (error) {
            setConnecting(false)
        }
    }

    const handleClose = () => {
        setChatId('')
        setVerifying(false)
        setVerified(false)
        setUserInfo(null)
        setConnecting(false)
        setConnected(false)
        setStep(1)
        onClose()
    }

    const getStepIcon = (stepNum: number) => {
        if (stepNum < step) return <Check className="w-5 h-5 text-white" />
        if (stepNum === step && step === 2 && verifying) return <Loader2 className="w-5 h-5 text-white animate-spin" />
        if (stepNum === step && step === 3 && connecting) return <Loader2 className="w-5 h-5 text-white animate-spin" />
        if (stepNum === step) return <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />
    }

    const getStepBg = (stepNum: number) => {
        if (stepNum < step) return 'bg-green-500'
        if (stepNum === step) return 'bg-blue-500'
        return 'bg-gray-300'
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md mx-auto">
                <DialogHeader className="text-center pb-6">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                        <MessageCircle className="w-8 h-8 text-white" />
                    </div>
                    <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Connect to Telegram
                    </DialogTitle>
                    <p className="text-gray-500 text-sm mt-2 text-center">
                        Link your Telegram account to receive notifications
                    </p>
                </DialogHeader>

                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-8 px-4">
                    <div className="flex items-center space-x-4">
                        {[1, 2, 3].map((stepNum, index) => (
                            <React.Fragment key={stepNum}>
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                                    ${getStepBg(stepNum)} shadow-lg
                                `}>
                                    {getStepIcon(stepNum)}
                                </div>
                                {index < 2 && (
                                    <div className={`
                                        w-8 h-1 rounded-full transition-all duration-300
                                        ${stepNum < step ? 'bg-green-500' : 'bg-gray-300'}
                                    `} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Step 1: Enter Chat ID */}
                    <div className={`transition-all duration-300 ${step >= 2 && verified ? 'opacity-50' : ''}`}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Telegram Chat ID
                        </label>
                        <div className="relative">
                            <Input
                                type="text"
                                placeholder="Enter your Chat ID (e.g., 123456789)"
                                value={chatId}
                                onChange={e => setChatId(e.target.value)}
                                disabled={verified}
                                className="pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-colors"
                            />
                            <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Find your Chat ID by messaging<a href="https://t.me/planproapp_bot" target="_blank" rel="noopener noreferrer" className="text-blue-500 "> @planproapp_bot</a> on Telegram
                        </p>
                    </div>

                    {/* Step 2: Verify Button */}
                    {step === 1 && (
                        <Button
                            onClick={() => {
                                setStep(2)
                                handleVerify()
                            }}
                            disabled={!chatId}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            <Shield className="w-5 h-5 mr-2" />
                            Verify Chat ID
                        </Button>
                    )}

                    {/* Step 2: Verifying State */}
                    {step === 2 && verifying && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                            </div>
                            <p className="text-gray-600 font-medium">Verifying your Telegram account...</p>
                            <p className="text-sm text-gray-500 mt-1">This may take a few seconds</p>
                        </div>
                    )}

                    {/* Step 3: User Info & Connect */}
                    {verified && userInfo && (
                        <div className="space-y-4">
                            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                                        <User className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">
                                            {userInfo.firstName} {userInfo.lastName}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            ID: {userInfo.id}
                                        </p>
                                        <div className="flex items-center mt-1">
                                            <Check className="w-4 h-4 text-green-500 mr-1" />
                                            <span className="text-xs text-green-600 font-medium">Verified</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {!connected && (
                                <Button
                                    onClick={handleConnect}
                                    disabled={connecting}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
                                >
                                    {connecting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Connecting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5 mr-2" />
                                            Connect to Telegram
                                        </>
                                    )}
                                </Button>
                            )}

                            {connected && (
                                <div className="text-center py-4">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                                        <Check className="w-8 h-8 text-green-500" />
                                    </div>
                                    <p className="text-green-600 font-semibold text-lg">Successfully Connected!</p>
                                    <p className="text-sm text-gray-500 mt-1">You'll now receive notifications on Telegram</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="pt-6">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className="px-6 py-2 rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ConnectTelegramBot