
import React from "react"
import { usePathname, useSearchParams } from "next/navigation"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/utils/utils"

type ProgressState = {
    isVisible: boolean
    percent: number
}

export function RouteProgress() {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Fix hydration by ensuring client-side only rendering
    const [isClient, setIsClient] = React.useState(false)
    const [progress, setProgress] = React.useState<ProgressState>({
        isVisible: false,
        percent: 0,
    })

    // Ensure client-side rendering to prevent hydration mismatch
    React.useEffect(() => {
        setIsClient(true)
    }, [])

    const animationRef = React.useRef<number | null>(null)
    const hideTimeoutRef = React.useRef<number | null>(null)

    const clearTimers = React.useCallback(() => {
        if (animationRef.current !== null) {
            cancelAnimationFrame(animationRef.current)
            animationRef.current = null
        }
        if (hideTimeoutRef.current !== null) {
            window.clearTimeout(hideTimeoutRef.current)
            hideTimeoutRef.current = null
        }
    }, [])

    const startProgress = React.useCallback(() => {
        clearTimers()
        setProgress({ isVisible: true, percent: 8 })

        const tick = () => {
            setProgress((prev) => {
                if (!prev.isVisible) return prev
                const next = prev.percent + Math.max(0.2, (100 - prev.percent) * 0.02)
                const clamped = Math.min(next, 92)
                return { ...prev, percent: clamped }
            })
            animationRef.current = requestAnimationFrame(tick)
        }

        animationRef.current = requestAnimationFrame(tick)
    }, [clearTimers])

    const completeProgress = React.useCallback(() => {
        setProgress((prev) => ({ ...prev, percent: 100 }))
        clearTimers()
        // Give the CSS transition a moment, then hide and reset
        hideTimeoutRef.current = window.setTimeout(() => {
            setProgress({ isVisible: false, percent: 0 })
        }, 250) as unknown as number
    }, [clearTimers])

    // Detect route/search changes
    React.useEffect(() => {
        // Ignore on first mount: show only on subsequent navigations
        let didMount = true
        const id = window.requestAnimationFrame(() => {
            if (didMount) {
                didMount = false
                return
            }
        })
        return () => cancelAnimationFrame(id)
    }, [])

    // Start on change
    const key = React.useMemo(() => `${pathname}?${searchParams?.toString() ?? ""}`, [pathname, searchParams])

    const isFirstLoadRef = React.useRef(true)
    React.useEffect(() => {
        if (isFirstLoadRef.current) {
            isFirstLoadRef.current = false
            return
        }
        startProgress()
        // Complete when the new route paint has occurred
        const afterPaint = () => completeProgress()
        const raf = requestAnimationFrame(() => {
            // Allow a tiny delay for data loading; if still visible, complete after a grace period
            const timeout = window.setTimeout(afterPaint, 400)
            // If the component unmounts or key changes again, cleanup
            return () => window.clearTimeout(timeout)
        })
        return () => {
            cancelAnimationFrame(raf)
            clearTimers()
        }
    }, [key, startProgress, completeProgress, clearTimers])

    if (!isClient || !progress.isVisible) return null

    return (
        <div
            aria-hidden
            className="fixed left-0 right-0 top-0 z-[1000] pointer-events-none px-0"
            style={{
                height: 3,
            }}
        >
            <ProgressPrimitive.Root
                value={progress.percent}
                className={cn(
                    "relative h-full w-full overflow-hidden rounded-none bg-transparent"
                )}
            >
                <ProgressPrimitive.Indicator
                    className="h-full w-full flex-1 bg-primary transition-all shadow-lg shadow-primary/30"
                    style={{ transform: `translateX(-${100 - (progress.percent || 0)}%)` }}
                />
            </ProgressPrimitive.Root>
        </div>
    )
}

export default RouteProgress


