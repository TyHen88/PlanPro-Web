import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' })
    }

    try {
        const { message, metadata } = req.body

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required',
                timestamp: Date.now()
            })
        }

        // AI-powered intent analysis
        const intentAnalysis = await analyzeIntent(message)

        // Route based on intent
        let response
        switch (intentAnalysis.intent) {
            case 'SEARCH':
                response = await handleSearch(intentAnalysis, message)
                break
            case 'UPDATE':
                response = await handleUpdate(intentAnalysis, message)
                break
            case 'DELETE':
                response = await handleDelete(intentAnalysis, message)
                break
            case 'QUERY':
            default:
                response = await handleQuery(intentAnalysis, message)
                break
        }

        res.status(200).json({
            success: true,
            message: response.message,
            data: response.data,
            intentAnalysis: intentAnalysis,
            timestamp: Date.now()
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error?.message || 'Failed to process AI assistant request',
            timestamp: Date.now()
        })
    }
}

// AI-powered intent analysis
async function analyzeIntent(message: string) {
    const lowerMessage = message.toLowerCase()

    // Search patterns
    if (lowerMessage.includes('find') || lowerMessage.includes('search') ||
        lowerMessage.includes('show') || lowerMessage.includes('get') ||
        lowerMessage.includes('list') || lowerMessage.includes('display')) {

        const entities = extractSearchEntities(message)
        return {
            intent: 'SEARCH',
            entities: entities,
            confidence: 0.9
        }
    }

    // Update patterns
    if (lowerMessage.includes('update') || lowerMessage.includes('edit') ||
        lowerMessage.includes('modify') || lowerMessage.includes('change')) {

        const entities = extractUpdateEntities(message)
        return {
            intent: 'UPDATE',
            entities: entities,
            confidence: 0.9
        }
    }

    // Delete patterns
    if (lowerMessage.includes('delete') || lowerMessage.includes('remove') ||
        lowerMessage.includes('cancel') || lowerMessage.includes('clear')) {

        const entities = extractDeleteEntities(message)
        return {
            intent: 'DELETE',
            entities: entities,
            confidence: 0.9
        }
    }

    // Default to query/chat
    return {
        intent: 'QUERY',
        entities: { query: message },
        confidence: 0.7
    }
}

// Extract search entities
function extractSearchEntities(message: string) {
    const lowerMessage = message.toLowerCase()
    const entities: any = { query: message }

    // Determine data type
    if (lowerMessage.includes('reminder')) {
        entities.type = 'reminders'
    } else if (lowerMessage.includes('note')) {
        entities.type = 'notes'
    } else if (lowerMessage.includes('event') || lowerMessage.includes('calendar') || lowerMessage.includes('meeting')) {
        entities.type = 'events'
    } else if (lowerMessage.includes('trip') || lowerMessage.includes('travel')) {
        entities.type = 'trips'
    } else {
        entities.type = 'all' // Search all types
    }

    // Extract date filters
    if (lowerMessage.includes('today')) {
        entities.date = 'today'
    } else if (lowerMessage.includes('tomorrow')) {
        entities.date = 'tomorrow'
    } else if (lowerMessage.includes('this week')) {
        entities.date = 'this_week'
    } else if (lowerMessage.includes('next week')) {
        entities.date = 'next_week'
    } else if (lowerMessage.includes('this month')) {
        entities.date = 'this_month'
    }

    return entities
}

// Extract update entities
function extractUpdateEntities(message: string) {
    const lowerMessage = message.toLowerCase()
    return {
        query: message,
        type: lowerMessage.includes('reminder') ? 'reminders' :
            lowerMessage.includes('note') ? 'notes' :
                lowerMessage.includes('event') ? 'events' : 'unknown'
    }
}

// Extract delete entities
function extractDeleteEntities(message: string) {
    const lowerMessage = message.toLowerCase()
    return {
        query: message,
        type: lowerMessage.includes('reminder') ? 'reminders' :
            lowerMessage.includes('note') ? 'notes' :
                lowerMessage.includes('event') ? 'events' : 'unknown'
    }
}

// Handle search requests
async function handleSearch(intentAnalysis: any, message: string) {
    const { entities } = intentAnalysis
    const { type, date, query } = entities

    // Mock search results - replace with actual search implementation
    const mockResults = generateMockSearchResults(type, date, query)

    return {
        message: `Found ${mockResults.length} ${type === 'all' ? 'items' : type} matching your search`,
        data: {
            results: mockResults,
            total: mockResults.length,
            query: query,
            type: type,
            filters: { date: date },
            suggestions: generateSuggestions(type)
        }
    }
}

// Handle update requests
async function handleUpdate(intentAnalysis: any, message: string) {
    const { entities } = intentAnalysis

    return {
        message: `Update request processed for ${entities.type}`,
        data: {
            action: 'update',
            type: entities.type,
            status: 'pending',
            message: `I'll help you update your ${entities.type}. What would you like to change?`
        }
    }
}

// Handle delete requests
async function handleDelete(intentAnalysis: any, message: string) {
    const { entities } = intentAnalysis

    return {
        message: `Delete request processed for ${entities.type}`,
        data: {
            action: 'delete',
            type: entities.type,
            status: 'pending',
            message: `I'll help you delete items from your ${entities.type}. Please confirm which items to remove.`
        }
    }
}

// Handle query/chat requests
async function handleQuery(intentAnalysis: any, message: string) {
    const lowerMessage = message.toLowerCase()

    let aiResponse = "I'm here to help you with your productivity needs. How can I assist you today?"

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        aiResponse = "Hello! I can help you search, manage, and organize your reminders, notes, events, and trips. What would you like to do?"
    } else if (lowerMessage.includes('help')) {
        aiResponse = "I can help you with:\n• **Search** - Find reminders, notes, events, or trips\n• **Update** - Modify existing items\n• **Delete** - Remove items\n• **General questions** - Ask me anything!\n\nJust tell me what you need!"
    } else if (lowerMessage.includes('reminder') || lowerMessage.includes('note') ||
        lowerMessage.includes('event') || lowerMessage.includes('trip')) {
        aiResponse = "I can help you manage your data. Try saying:\n• 'Find my reminders for this week'\n• 'Show me my notes about work'\n• 'What events do I have today?'\n• 'List my upcoming trips'"
    }

    return {
        message: aiResponse,
        data: {
            response: aiResponse,
            type: 'chat',
            suggestions: [
                "Find my reminders for this week",
                "Show me my notes",
                "What events do I have today?",
                "List my upcoming trips"
            ]
        }
    }
}

// Generate mock search results
function generateMockSearchResults(type: string, date: string, query: string) {
    const baseResults = {
        reminders: [
            { id: 1, title: "Team meeting", date: "2024-01-15", type: "reminder" },
            { id: 2, title: "Doctor appointment", date: "2024-01-16", type: "reminder" }
        ],
        notes: [
            { id: 1, title: "Project ideas", content: "Brainstorming session notes", type: "note" },
            { id: 2, title: "Meeting notes", content: "Key points from today's meeting", type: "note" }
        ],
        events: [
            { id: 1, title: "Lunch with Sarah", date: "2024-01-15", type: "event" },
            { id: 2, title: "Project deadline", date: "2024-01-20", type: "event" }
        ],
        trips: [
            { id: 1, title: "Weekend getaway", destination: "Paris", date: "2024-02-01", type: "trip" }
        ]
    }

    if (type === 'all') {
        return [...baseResults.reminders, ...baseResults.notes, ...baseResults.events, ...baseResults.trips]
    }

    return baseResults[type as keyof typeof baseResults] || []
}

// Generate suggestions based on type
function generateSuggestions(type: string) {
    const suggestions = {
        reminders: ["Set a new reminder", "Find overdue reminders", "Update reminder time"],
        notes: ["Create a new note", "Search notes by keyword", "Organize notes by category"],
        events: ["Add new event", "Check calendar conflicts", "Update event details"],
        trips: ["Plan new trip", "Check travel dates", "Update trip itinerary"],
        all: ["Search everything", "Find recent items", "Get overview"]
    }

    return suggestions[type as keyof typeof suggestions] || suggestions.all
}
