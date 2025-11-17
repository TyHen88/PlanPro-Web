import React from 'react';

interface AIResponseFormatterProps {
    content: string;
    className?: string;
}

// Enhanced type safety and error handling
export const AIResponseFormatter: React.FC<AIResponseFormatterProps> = ({
    content,
    className = ''
}) => {
    // Validate content
    if (!content || typeof content !== 'string') {
        return (
            <div className={`ai-response-formatter text-foreground ${className}`}>
                <p className="my-3 text-muted-foreground">No content to display</p>
            </div>
        );
    }
    const formatContent = (text: string): React.ReactNode[] => {
        const lines = text.split('\n');
        const elements: React.ReactNode[] = [];
        let i = 0;
        let listItems: string[] = [];
        let listType: 'ordered' | 'unordered' | null = null;
        let tableRows: string[][] = [];
        let inCodeBlock = false;
        let codeContent: string[] = [];
        let codeLanguage = '';

        const flushList = () => {
            if (listItems.length > 0) {
                if (listType === 'ordered') {
                    elements.push(
                        <ol key={`list-${elements.length}`} className="my-4 pl-8 list-decimal text-foreground">
                            {listItems.map((item, idx) => (
                                <li key={idx} className="my-2">{parseInlineFormatting(item)}</li>
                            ))}
                        </ol>
                    );
                } else {
                    elements.push(
                        <ul key={`list-${elements.length}`} className="my-4 pl-8 list-disc text-foreground">
                            {listItems.map((item, idx) => (
                                <li key={idx} className="my-2">{parseInlineFormatting(item)}</li>
                            ))}
                        </ul>
                    );
                }
                listItems = [];
                listType = null;
            }
        };

        const flushTable = () => {
            if (tableRows.length > 0) {
                elements.push(
                    <div key={`table-${elements.length}`} className="my-6 overflow-x-auto">
                        <table className="w-full border-collapse bg-card rounded-lg overflow-hidden border border-border shadow-sm">
                            <thead className="bg-muted">
                                <tr>
                                    {tableRows[0].map((cell, idx) => (
                                        <th key={idx} className="px-4 py-3 text-left text-sm font-semibold text-foreground border-b-2 border-border">{parseInlineFormatting(cell.trim())}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {tableRows.slice(2).map((row, rowIdx) => (
                                    <tr key={rowIdx} className="hover:bg-muted/50 transition-colors">
                                        {row.map((cell, cellIdx) => (
                                            <td key={cellIdx} className="px-4 py-3 text-sm text-foreground">{parseInlineFormatting(cell.trim())}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
                tableRows = [];
            }
        };

        const flushCodeBlock = () => {
            if (codeContent.length > 0) {
                elements.push(
                    <div key={`code-${elements.length}`} className="my-6 rounded-lg overflow-hidden bg-slate-900 dark:bg-slate-950 border border-border">
                        {codeLanguage && (
                            <div className="px-4 py-2 bg-slate-800 dark:bg-slate-900 text-slate-300 dark:text-slate-400 text-xs font-medium border-b border-slate-700">{codeLanguage}</div>
                        )}
                        <pre className="m-0 p-4 overflow-x-auto">
                            <code className="text-slate-100 dark:text-slate-200 font-mono text-sm leading-relaxed">{codeContent.join('\n')}</code>
                        </pre>
                    </div>
                );
                codeContent = [];
                codeLanguage = '';
            }
        };

        while (i < lines.length) {
            const line = lines[i];
            const trimmedLine = line.trim();

            // Handle code blocks
            if (trimmedLine.startsWith('```')) {
                if (inCodeBlock) {
                    flushCodeBlock();
                    inCodeBlock = false;
                } else {
                    flushList();
                    flushTable();
                    inCodeBlock = true;
                    codeLanguage = trimmedLine.slice(3).trim();
                }
                i++;
                continue;
            }

            if (inCodeBlock) {
                codeContent.push(line);
                i++;
                continue;
            }

            // Headers
            if (trimmedLine.startsWith('# ')) {
                flushList();
                flushTable();
                elements.push(
                    <h1 key={`h1-${i}`} className="text-2xl font-bold text-foreground my-4 pb-2 border-b-2 border-border">
                        {parseInlineFormatting(trimmedLine.slice(2))}
                    </h1>
                );
            } else if (trimmedLine.startsWith('## ')) {
                flushList();
                flushTable();
                elements.push(
                    <h2 key={`h2-${i}`} className="text-xl font-semibold text-foreground my-3">
                        {parseInlineFormatting(trimmedLine.slice(3))}
                    </h2>
                );
            } else if (trimmedLine.startsWith('### ')) {
                flushList();
                flushTable();
                elements.push(
                    <h3 key={`h3-${i}`} className="text-lg font-semibold text-foreground my-2">
                        {parseInlineFormatting(trimmedLine.slice(4))}
                    </h3>
                );
            }
            // Tables
            else if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
                flushList();
                const cells = trimmedLine.split('|').slice(1, -1);
                tableRows.push(cells);
            }
            // Ordered list
            else if (/^\d+\.\s/.test(trimmedLine)) {
                flushTable();
                if (listType !== 'ordered') {
                    flushList();
                    listType = 'ordered';
                }
                listItems.push(trimmedLine.replace(/^\d+\.\s/, ''));
            }
            // Unordered list
            else if (/^[-*+]\s/.test(trimmedLine)) {
                flushTable();
                if (listType !== 'unordered') {
                    flushList();
                    listType = 'unordered';
                }
                listItems.push(trimmedLine.replace(/^[-*+]\s/, ''));
            }
            // Regular paragraph
            else if (trimmedLine) {
                flushList();
                flushTable();
                elements.push(
                    <p key={`p-${i}`} className="my-3 text-foreground leading-relaxed">
                        {parseInlineFormatting(trimmedLine)}
                    </p>
                );
            } else {
                flushList();
                flushTable();
            }

            i++;
        }

        flushList();
        flushTable();
        flushCodeBlock();

        return elements;
    };

    const parseInlineFormatting = (text: string): React.ReactNode => {
        const parts: React.ReactNode[] = [];
        let remaining = text;
        let key = 0;

        // Bold **text**
        remaining = remaining.replace(/\*\*(.+?)\*\*/g, (_, content) => {
            return `__BOLD_${key++}_${content}__`;
        });

        // Italic *text*
        remaining = remaining.replace(/\*(.+?)\*/g, (_, content) => {
            return `__ITALIC_${key++}_${content}__`;
        });

        // Inline code `code`
        remaining = remaining.replace(/`(.+?)`/g, (_, content) => {
            return `__CODE_${key++}_${content}__`;
        });

        // Split and reconstruct
        const tokens = remaining.split(/(__(?:BOLD|ITALIC|CODE)_\d+_.+?__)/g);

        tokens.forEach((token, idx) => {
            if (token.startsWith('__BOLD_')) {
                const content = token.match(/__BOLD_\d+_(.+?)__/)?.[1] || '';
                parts.push(<strong key={idx} className="font-semibold text-foreground">{content}</strong>);
            } else if (token.startsWith('__ITALIC_')) {
                const content = token.match(/__ITALIC_\d+_(.+?)__/)?.[1] || '';
                parts.push(<em key={idx} className="italic">{content}</em>);
            } else if (token.startsWith('__CODE_')) {
                const content = token.match(/__CODE_\d+_(.+?)__/)?.[1] || '';
                parts.push(<code key={idx} className="bg-muted text-foreground px-1.5 py-0.5 rounded text-xs font-mono border border-border">{content}</code>);
            } else if (token) {
                parts.push(token);
            }
        });

        return parts;
    };

    return (
        <div className={`ai-response-formatter text-foreground ${className}`}>
            {formatContent(content)}
        </div>
    );
};