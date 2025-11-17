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
                        <h1 className="text-lg font-bold text-foreground mb-2 mt-3 first:mt-0">
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-base font-bold text-foreground mb-2 mt-3 first:mt-0">
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-sm font-bold text-foreground mb-1 mt-2 first:mt-0">
                            {children}
                        </h3>
                    ),
                    h4: ({ children }) => (
                        <h4 className="text-sm font-semibold text-foreground mb-1 mt-2 first:mt-0">
                            {children}
                        </h4>
                    ),
                    h5: ({ children }) => (
                        <h5 className="text-sm font-medium text-foreground mb-1 mt-2 first:mt-0">
                            {children}
                        </h5>
                    ),
                    h6: ({ children }) => (
                        <h6 className="text-sm font-medium text-foreground mb-1 mt-2 first:mt-0">
                            {children}
                        </h6>
                    ),

                    // Paragraphs
                    p: ({ children }) => (
                        <p className="text-sm text-foreground mb-2 last:mb-0 leading-relaxed">
                            {children}
                        </p>
                    ),

                    // Lists
                    ul: ({ children }) => (
                        <ul className="list-disc list-inside text-sm text-foreground mb-2 space-y-1">
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="list-decimal list-inside text-sm text-foreground mb-2 space-y-1">
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => (
                        <li className="text-sm text-foreground">
                            {children}
                        </li>
                    ),

                    // Text formatting
                    strong: ({ children }) => (
                        <strong className="font-semibold text-foreground">
                            {children}
                        </strong>
                    ),
                    em: ({ children }) => (
                        <em className="italic text-foreground">
                            {children}
                        </em>
                    ),
                    code: ({ children, className }) => {
                        const isInline = !className?.includes('language-')
                        if (isInline) {
                            return (
                                <code className="bg-muted text-foreground px-1 py-0.5 rounded text-xs font-mono border border-border">
                                    {children}
                                </code>
                            )
                        }
                        return (
                            <code className="block bg-slate-900 dark:bg-slate-950 text-slate-100 dark:text-slate-200 p-2 rounded text-xs font-mono overflow-x-auto border border-border">
                                {children}
                            </code>
                        )
                    },

                    // Blockquotes
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary/50 pl-3 py-1 my-2 bg-primary/10 dark:bg-primary/20 text-foreground text-sm italic rounded-r">
                            {children}
                        </blockquote>
                    ),

                    // Links
                    a: ({ children, href }) => (
                        <a
                            href={href}
                            className="text-primary hover:text-primary/80 underline text-sm transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {children}
                        </a>
                    ),

                    // Tables
                    table: ({ children }) => (
                        <div className="overflow-x-auto my-2">
                            <table className="min-w-full border border-border rounded-lg bg-card">
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="bg-muted">
                            {children}
                        </thead>
                    ),
                    tbody: ({ children }) => (
                        <tbody className="divide-y divide-border">
                            {children}
                        </tbody>
                    ),
                    tr: ({ children }) => (
                        <tr className="hover:bg-muted/50 transition-colors">
                            {children}
                        </tr>
                    ),
                    th: ({ children }) => (
                        <th className="px-3 py-2 text-left text-xs font-medium text-foreground uppercase tracking-wider border-b border-border">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="px-3 py-2 text-sm text-foreground">
                            {children}
                        </td>
                    ),

                    // Horizontal rule
                    hr: () => (
                        <hr className="my-3 border-border" />
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
