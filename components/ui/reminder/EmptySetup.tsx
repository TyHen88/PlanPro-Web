import React, { useState } from 'react'
import { Bell, Plus } from "lucide-react"
import { Button } from "@/components/shared/ui/Button"
import { EmptyState } from './EmptyState'
import ConnectTelegramBot from '../telegram/ConnectTelegramBot'
import IsTelegramPopup from '../telegram/IsTelegramPopup'

interface EmptySetupProps {
    isConnected: boolean
    isActive: boolean
}

const EmptySetup = ({ isConnected, isActive }: EmptySetupProps) => {
    const [isOpen, setIsOpen] = useState(false)
    console.log("isConnected", isConnected)
    console.log("isActive", isActive)
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 text-center">
            <div className="rounded-full bg-primary/10 dark:bg-primary/20 p-3 mb-4">
                <Bell className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">
                Connect Telegram to use Reminders.
            </h3>
            <p className="text-muted-foreground mb-4 max-w-md">
                To set up and receive reminders, you need to connect your Telegram account. Click the button below to connect and start using reminders.
            </p>

            <Button
                className="mb-2"
                onClick={() => setIsOpen(true)}
            >
                Connect Telegram
            </Button>
            {isOpen && !isActive === true && !isConnected === true && <ConnectTelegramBot open={isOpen} onClose={() => setIsOpen(false)} />}
            {isOpen && isActive === false && <IsTelegramPopup open={isOpen} onClose={() => setIsOpen(false)} />}
        </div>
    )
}

export { EmptySetup }