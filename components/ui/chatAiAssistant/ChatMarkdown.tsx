"use client"

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ChatMarkdownProps {
    content: string
}

const ChatMarkdown: React.FC<ChatMarkdownProps> = ({ content }) => {
    return (
        <div className="chat-markdown">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // Headings
                    h1: ({ children }) => (
                        <h1 className="text-lg font-bold text-gray-900 mb-2 mt-3 first:mt-0">
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-base font-bold text-gray-900 mb-2 mt-3 first:mt-0">
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-sm font-bold text-gray-900 mb-1 mt-2 first:mt-0">
                            {children}
                        </h3>
                    ),
                    h4: ({ children }) => (
                        <h4 className="text-sm font-semibold text-gray-900 mb-1 mt-2 first:mt-0">
                            {children}
                        </h4>
                    ),
                    h5: ({ children }) => (
                        <h5 className="text-sm font-medium text-gray-900 mb-1 mt-2 first:mt-0">
                            {children}
                        </h5>
                    ),
                    h6: ({ children }) => (
                        <h6 className="text-sm font-medium text-gray-800 mb-1 mt-2 first:mt-0">
                            {children}
                        </h6>
                    ),

                    // Paragraphs
                    p: ({ children }) => (
                        <p className="text-sm text-gray-800 mb-2 last:mb-0 leading-relaxed">
                            {children}
                        </p>
                    ),

                    // Lists
                    ul: ({ children }) => (
                        <ul className="list-disc list-inside text-sm text-gray-800 mb-2 space-y-1">
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="list-decimal list-inside text-sm text-gray-800 mb-2 space-y-1">
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => (
                        <li className="text-sm text-gray-800">
                            {children}
                        </li>
                    ),

                    // Text formatting
                    strong: ({ children }) => (
                        <strong className="font-semibold text-gray-900">
                            {children}
                        </strong>
                    ),
                    em: ({ children }) => (
                        <em className="italic text-gray-800">
                            {children}
                        </em>
                    ),
                    code: ({ children, className }) => {
                        const isInline = !className?.includes('language-')
                        if (isInline) {
                            return (
                                <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-xs font-mono">
                                    {children}
                                </code>
                            )
                        }
                        return (
                            <code className="block bg-gray-100 text-gray-800 p-2 rounded text-xs font-mono overflow-x-auto">
                                {children}
                            </code>
                        )
                    },

                    // Blockquotes
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-blue-300 pl-3 py-1 my-2 bg-blue-50 text-sm text-gray-700 italic">
                            {children}
                        </blockquote>
                    ),

                    // Links
                    a: ({ children, href }) => (
                        <a
                            href={href}
                            className="text-blue-600 hover:text-blue-800 underline text-sm"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {children}
                        </a>
                    ),

                    // Tables
                    table: ({ children }) => (
                        <div className="overflow-x-auto my-2">
                            <table className="min-w-full border border-gray-200 rounded-lg">
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="bg-gray-50">
                            {children}
                        </thead>
                    ),
                    tbody: ({ children }) => (
                        <tbody className="divide-y divide-gray-200">
                            {children}
                        </tbody>
                    ),
                    tr: ({ children }) => (
                        <tr className="hover:bg-gray-50">
                            {children}
                        </tr>
                    ),
                    th: ({ children }) => (
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="px-3 py-2 text-sm text-gray-800">
                            {children}
                        </td>
                    ),

                    // Horizontal rule
                    hr: () => (
                        <hr className="my-3 border-gray-300" />
                    ),

                    // Line breaks
                    br: () => <br className="mb-1" />,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}

export default ChatMarkdown
