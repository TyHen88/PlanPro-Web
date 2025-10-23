import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' })
    }

    try {
        // Mock supported intents - replace with actual implementation
        const supportedIntents = {
            success: true,
            message: 'Supported intents retrieved successfully',
            data: {
                intents: [
                    {
                        id: 'create_trip',
                        name: 'Create Trip',
                        description: 'Plan and create a new trip',
                        examples: ['Plan a trip to Paris', 'Create a vacation to Japan', 'I want to travel to New York']
                    },
                    {
                        id: 'create_note',
                        name: 'Create Note',
                        description: 'Create a new note or reminder',
                        examples: ['Create a note about meeting', 'Remind me to call mom', 'Take a note about project ideas']
                    },
                    {
                        id: 'calendar_action',
                        name: 'Calendar Action',
                        description: 'Manage calendar events',
                        examples: ['Schedule a meeting', 'Check my calendar', 'Add event to calendar']
                    },
                    {
                        id: 'task_management',
                        name: 'Task Management',
                        description: 'Create and manage tasks',
                        examples: ['Create a task', 'Mark task as done', 'Show my tasks']
                    },
                    {
                        id: 'telegram_integration',
                        name: 'Telegram Integration',
                        description: 'Manage Telegram bot interactions',
                        examples: ['Send message to Telegram', 'Check Telegram messages', 'Setup Telegram bot']
                    }
                ]
            },
            timestamp: Date.now()
        }

        res.status(200).json(supportedIntents)
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error?.message || 'Failed to fetch supported intents',
            timestamp: Date.now()
        })
    }
}
