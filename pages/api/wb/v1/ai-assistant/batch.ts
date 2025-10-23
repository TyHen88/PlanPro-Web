import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' })
    }

    try {
        const { messages } = req.body

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Messages array is required',
                timestamp: Date.now()
            })
        }

        // Process each message using the unified process endpoint
        const batchResults = await Promise.all(
            messages.map(async (message: string, index: number) => {
                try {
                    const processResponse = await fetch(`${req.headers.host?.includes('localhost') ? 'http' : 'https'}://${req.headers.host}/api/v1/ai-assistant/process`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ message })
                    })

                    const processData = await processResponse.json()

                    return {
                        index,
                        message,
                        intent: processData.intentAnalysis?.intent || 'unknown',
                        confidence: processData.intentAnalysis?.confidence || 0,
                        status: processData.success ? 'processed' : 'failed',
                        result: processData.data?.response || processData.message,
                        data: processData.data,
                        intentAnalysis: processData.intentAnalysis,
                        timestamp: Date.now()
                    }
                } catch (error: any) {
                    return {
                        index,
                        message,
                        intent: 'error',
                        confidence: 0,
                        status: 'failed',
                        error: error.message,
                        timestamp: Date.now()
                    }
                }
            })
        )

        const response = {
            success: true,
            message: `Batch processing completed for ${messages.length} messages`,
            data: {
                totalMessages: messages.length,
                processedCount: batchResults.filter(r => r.status === 'processed').length,
                failedCount: batchResults.filter(r => r.status === 'failed').length,
                results: batchResults
            },
            timestamp: Date.now()
        }

        res.status(200).json(response)
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error?.message || 'Failed to process batch commands',
            timestamp: Date.now()
        })
    }
}
