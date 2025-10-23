import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' })
    }

    try {
        const { intentAnalysis, data, metadata } = req.body

        if (!intentAnalysis) {
            return res.status(400).json({
                success: false,
                message: 'Intent analysis is required',
                timestamp: Date.now()
            })
        }

        // Use the unified process endpoint internally
        const processResponse = await fetch(`${req.headers.host?.includes('localhost') ? 'http' : 'https'}://${req.headers.host}/api/v1/ai-assistant/process`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: data?.message || 'Execute command',
                metadata: { ...metadata, intentAnalysis }
            })
        })

        const processData = await processResponse.json()

        // Return the execution result
        const response = {
            success: processData.success,
            message: 'Command executed successfully',
            data: processData.data,
            intentAnalysis: processData.intentAnalysis,
            timestamp: Date.now()
        }

        res.status(200).json(response)
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error?.message || 'Failed to execute command',
            timestamp: Date.now()
        })
    }
}
