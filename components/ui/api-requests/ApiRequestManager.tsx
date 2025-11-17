import React, { useState, useEffect, useCallback } from 'react'
import { useApiRequests } from '@/lib/hooks/useApiRequests'
import { ApiRequest, ApiResponse } from '@/service/openApiTool.service'
import { Button } from '@/components/shared/ui/Button'
import { Input } from '@/components/shared/ui/Input'
import { Textarea } from '@/components/shared/ui/textarea'
import { Card } from '@/components/shared/ui/card'
import { Badge } from '@/components/shared/ui/badge'

const ApiRequestManager: React.FC = () => {
    const {
        loading,
        error,
        createRequest,
        executeRequest,
        getHistory,
        getRequests,
        clearError
    } = useApiRequests()

    const [requests, setRequests] = useState<ApiRequest[]>([])
    const [selectedRequest, setSelectedRequest] = useState<ApiRequest | null>(null)
    const [history, setHistory] = useState<ApiResponse[]>([])
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        url: '',
        method: 'POST' as const,
        headers: [{ key: '', value: '' }],
        body: ''
    })

    const loadRequests = useCallback(async () => {
        try {
            const response = await getRequests()
            setRequests(response.data || [])
        } catch (err) {
            console.error('Failed to load requests:', err)
        }
    }, [getRequests])

    useEffect(() => {
        loadRequests()
    }, [loadRequests])

    const handleCreateRequest = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await createRequest(formData)
            setFormData({
                name: '',
                description: '',
                url: '',
                method: 'POST',
                headers: [{ key: '', value: '' }],
                body: ''
            })
            loadRequests()
        } catch (err) {
            console.error('Failed to create request:', err)
        }
    }

    const handleExecuteRequest = async (id: number) => {
        try {
            const response = await executeRequest(id)
            console.log('Execution result:', response)
            // You could show a success message or update the UI
        } catch (err) {
            console.error('Failed to execute request:', err)
        }
    }

    const handleViewHistory = async (id: number) => {
        try {
            const response = await getHistory(id)
            setHistory(response.data || [])
        } catch (err) {
            console.error('Failed to load history:', err)
        }
    }

    const addHeader = () => {
        setFormData(prev => ({
            ...prev,
            headers: [...prev.headers, { key: '', value: '' }]
        }))
    }

    const removeHeader = (index: number) => {
        setFormData(prev => ({
            ...prev,
            headers: prev.headers.filter((_, i) => i !== index)
        }))
    }

    const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
        setFormData(prev => ({
            ...prev,
            headers: prev.headers.map((header, i) =>
                i === index ? { ...header, [field]: value } : header
            )
        }))
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">API Request Manager</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                    <button onClick={clearError} className="ml-2 text-red-500">×</button>
                </div>
            )}

            {/* Create Request Form */}
            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Create New API Request</h2>
                <form onSubmit={handleCreateRequest} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Name</label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <Input
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">URL</label>
                            <Input
                                value={formData.url}
                                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                                required
                            />
                        </div>
                        <select
                            value={formData.method}
                            onChange={(e) => setFormData(prev => ({ ...prev, method: e.target.value as any }))}
                            className="border rounded px-3 py-2"
                        >
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                            <option value="DELETE">DELETE</option>
                            <option value="PATCH">PATCH</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Headers</label>
                        {formData.headers.map((header, index) => (
                            <div key={index} className="flex gap-2 mb-2">
                                <Input
                                    placeholder="Key"
                                    value={header.key}
                                    onChange={(e) => updateHeader(index, 'key', e.target.value)}
                                />
                                <Input
                                    placeholder="Value"
                                    value={header.value}
                                    onChange={(e) => updateHeader(index, 'value', e.target.value)}
                                />
                                <Button
                                    type="button"
                                    onClick={() => removeHeader(index)}
                                    variant="outline"
                                    size="sm"
                                >
                                    Remove
                                </Button>
                            </div>
                        ))}
                        <Button type="button" onClick={addHeader} variant="outline" size="sm">
                            Add Header
                        </Button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Body (JSON)</label>
                        <textarea
                            value={formData.body}
                            onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                            className="w-full border rounded px-3 py-2 h-32"
                            placeholder='{"key": "value"}'
                        />
                    </div>

                    <Button type="submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Request'}
                    </Button>
                </form>
            </Card>

            {/* Requests List */}
            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Stored Requests</h2>
                <div className="space-y-4">
                    {requests.map((request) => (
                        <div key={request.id} className="border rounded p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-semibold">{request.name}</h3>
                                    <p className="text-sm text-gray-600">{request.description}</p>
                                    <div className="flex gap-2 mt-1">
                                        <Badge variant="outline">{request.method}</Badge>
                                        <span className="text-sm text-gray-500">{request.url}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => request.id && handleExecuteRequest(request.id)}
                                        size="sm"
                                        disabled={!request.id}
                                    >
                                        Execute
                                    </Button>
                                    <Button
                                        onClick={() => request.id && handleViewHistory(request.id)}
                                        variant="outline"
                                        size="sm"
                                        disabled={!request.id}
                                    >
                                        History
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* History Modal */}
            {history.length > 0 && (
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Execution History</h2>
                    <div className="space-y-4">
                        {history.map((execution) => (
                            <div key={execution.id} className="border rounded p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <Badge
                                        variant={execution.status === 'success' ? 'default' : 'destructive'}
                                    >
                                        {execution.status}
                                    </Badge>
                                    <span className="text-sm text-gray-500">
                                        {new Date(execution.executedAt).toLocaleString()}
                                    </span>
                                </div>
                                {execution.error && (
                                    <p className="text-red-600 text-sm">{execution.error}</p>
                                )}
                                {execution.response && (
                                    <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                                        {JSON.stringify(execution.response, null, 2)}
                                    </pre>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    )
}

export default ApiRequestManager 