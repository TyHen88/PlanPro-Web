import { AiAssistantResponse } from "@/lib/types/aiAssistant"

export interface TestCase {
    name: string
    message: string
    expectedIntent?: string
    expectedAction?: string
    description: string
}

export const testCases: TestCase[] = [
    {
        name: "Search Reminders",
        message: "Find my reminders for this week",
        expectedIntent: "SEARCH",
        expectedAction: "search",
        description: "Should search for reminders"
    },
    {
        name: "Create Note",
        message: "Create a new note about the meeting",
        expectedIntent: "UPDATE",
        expectedAction: "create",
        description: "Should create a new note"
    },
    {
        name: "General Chat",
        message: "Hello, how are you?",
        expectedIntent: "QUERY",
        expectedAction: "chat",
        description: "Should respond with general chat"
    },
    {
        name: "Delete Task",
        message: "Delete my old task",
        expectedIntent: "DELETE",
        expectedAction: "delete",
        description: "Should delete a task"
    },
    {
        name: "Update Event",
        message: "Update my meeting to 3 PM",
        expectedIntent: "UPDATE",
        expectedAction: "update",
        description: "Should update an event"
    }
]

export const runTestCase = async (
    testCase: TestCase,
    processMessage: (data: { message: string }) => Promise<AiAssistantResponse>
): Promise<{
    testCase: TestCase
    result: AiAssistantResponse
    passed: boolean
    errors: string[]
}> => {
    const errors: string[] = []

    try {
        const result = await processMessage({ message: testCase.message })

        // Check if response is successful
        if (!result.success) {
            errors.push(`Response was not successful: ${result.message}`)
        }

        // Check intent if expected
        if (testCase.expectedIntent && result.intentAnalysis?.intent !== testCase.expectedIntent) {
            errors.push(`Expected intent '${testCase.expectedIntent}', got '${result.intentAnalysis?.intent}'`)
        }

        // Check action if expected
        if (testCase.expectedAction && result.data?.action !== testCase.expectedAction) {
            errors.push(`Expected action '${testCase.expectedAction}', got '${result.data?.action}'`)
        }

        // Check if response has content
        if (!result.data?.response && !result.data?.message && !result.message) {
            errors.push("Response has no content")
        }

        return {
            testCase,
            result,
            passed: errors.length === 0,
            errors
        }
    } catch (error) {
        errors.push(`Test failed with error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        return {
            testCase,
            result: {
                success: false,
                message: "Test failed",
                timestamp: Date.now()
            },
            passed: false,
            errors
        }
    }
}

export const runAllTests = async (
    processMessage: (data: { message: string }) => Promise<AiAssistantResponse>
): Promise<{
    total: number
    passed: number
    failed: number
    results: Array<{
        testCase: TestCase
        result: AiAssistantResponse
        passed: boolean
        errors: string[]
    }>
}> => {
    const results = []

    for (const testCase of testCases) {
        const result = await runTestCase(testCase, processMessage)
        results.push(result)
    }

    const passed = results.filter(r => r.passed).length
    const failed = results.filter(r => !r.passed).length

    return {
        total: testCases.length,
        passed,
        failed,
        results
    }
}

export const generateTestReport = (testResults: {
    total: number
    passed: number
    failed: number
    results: Array<{
        testCase: TestCase
        result: AiAssistantResponse
        passed: boolean
        errors: string[]
    }>
}): string => {
    const { total, passed, failed, results } = testResults

    let report = `# AI Assistant Test Report\n\n`
    report += `**Summary:** ${passed}/${total} tests passed (${failed} failed)\n\n`

    report += `## Test Results\n\n`

    results.forEach((result, index) => {
        const status = result.passed ? '✅ PASS' : '❌ FAIL'
        report += `### ${index + 1}. ${result.testCase.name} - ${status}\n`
        report += `**Message:** "${result.testCase.message}"\n`
        report += `**Description:** ${result.testCase.description}\n`

        if (result.passed) {
            report += `**Intent:** ${result.result.intentAnalysis?.intent}\n`
            report += `**Action:** ${result.result.data?.action}\n`
        } else {
            report += `**Errors:**\n`
            result.errors.forEach(error => {
                report += `- ${error}\n`
            })
        }

        report += `\n`
    })

    return report
}
