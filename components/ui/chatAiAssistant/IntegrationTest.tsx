"use client"

import { useState, useEffect } from "react"
import { AIAssistantProvider, useAIAssistant } from "./AIAssistantProvider"
import { validateMessage, validateCommandRequest } from "./utils/errorHandler"
import { testCases, runAllTests, generateTestReport } from "./utils/testUtils"

// Test component that uses the AI Assistant
function TestComponent() {
    const [testResults, setTestResults] = useState<any>(null)
    const [isRunning, setIsRunning] = useState(false)
    const { processMessage, supportedIntents, context, isLoadingIntents, isLoadingContext } = useAIAssistant()

    const runIntegrationTest = async () => {
        setIsRunning(true)
        try {
            // Test 1: Validate inputs
            console.log("Test 1: Input Validation")
            const validMessage = validateMessage("Hello, how are you?")
            const invalidMessage = validateMessage("")
            const validRequest = validateCommandRequest({ message: "Test message" })
            const invalidRequest = validateCommandRequest(null)

            console.log("Valid message:", validMessage)
            console.log("Invalid message:", invalidMessage)
            console.log("Valid request:", validRequest)
            console.log("Invalid request:", invalidRequest)

            // Test 2: Check context loading
            console.log("Test 2: Context Loading")
            console.log("Supported intents:", supportedIntents)
            console.log("Context:", context)
            console.log("Loading intents:", isLoadingIntents)
            console.log("Loading context:", isLoadingContext)

            // Test 3: Run test suite
            console.log("Test 3: Running Test Suite")
            const results = await runAllTests(processMessage)
            setTestResults(results)

            // Test 4: Generate report
            console.log("Test 4: Generating Report")
            const report = generateTestReport(results)
            console.log("Test Report:", report)

        } catch (error) {
            console.error("Integration test failed:", error)
        } finally {
            setIsRunning(false)
        }
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">AI Assistant Integration Test</h2>

            <div className="mb-6">
                <button
                    onClick={runIntegrationTest}
                    disabled={isRunning}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg disabled:opacity-50"
                >
                    {isRunning ? "Running Tests..." : "Run Integration Test"}
                </button>
            </div>

            {testResults && (
                <div className="space-y-6">
                    <div className="p-4 bg-gray-100 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4">Test Results Summary</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{testResults.total}</div>
                                <div className="text-sm text-gray-600">Total Tests</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">{testResults.passed}</div>
                                <div className="text-sm text-gray-600">Passed</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-red-600">{testResults.failed}</div>
                                <div className="text-sm text-gray-600">Failed</div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-gray-100 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4">Individual Test Results</h3>
                        <div className="space-y-2">
                            {testResults.results.map((result: any, index: number) => (
                                <div key={index} className={`p-3 rounded ${result.passed ? 'bg-green-50' : 'bg-red-50'}`}>
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{result.testCase.name}</span>
                                        <span className={`text-sm ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                                            {result.passed ? '✅ PASS' : '❌ FAIL'}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        "{result.testCase.message}"
                                    </div>
                                    {!result.passed && result.errors.length > 0 && (
                                        <div className="mt-2 text-sm text-red-600">
                                            <strong>Errors:</strong>
                                            {result.errors.map((error: string, i: number) => (
                                                <div key={i} className="ml-2">• {error}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// Main integration test component
export default function IntegrationTest() {
    return (
        <AIAssistantProvider>
            <TestComponent />
        </AIAssistantProvider>
    )
}
