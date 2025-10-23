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
            <div className={`ai-response-formatter ${className}`}>
                <p className="formatted-paragraph">No content to display</p>
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
                        <ol key={`list-${elements.length}`} className="formatted-list-ordered">
                            {listItems.map((item, idx) => (
                                <li key={idx}>{parseInlineFormatting(item)}</li>
                            ))}
                        </ol>
                    );
                } else {
                    elements.push(
                        <ul key={`list-${elements.length}`} className="formatted-list-unordered">
                            {listItems.map((item, idx) => (
                                <li key={idx}>{parseInlineFormatting(item)}</li>
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
                    <div key={`table-${elements.length}`} className="formatted-table-wrapper">
                        <table className="formatted-table">
                            <thead>
                                <tr>
                                    {tableRows[0].map((cell, idx) => (
                                        <th key={idx}>{parseInlineFormatting(cell.trim())}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {tableRows.slice(2).map((row, rowIdx) => (
                                    <tr key={rowIdx}>
                                        {row.map((cell, cellIdx) => (
                                            <td key={cellIdx}>{parseInlineFormatting(cell.trim())}</td>
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
                    <div key={`code-${elements.length}`} className="formatted-code-block">
                        {codeLanguage && (
                            <div className="code-language">{codeLanguage}</div>
                        )}
                        <pre>
                            <code>{codeContent.join('\n')}</code>
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
                    <h1 key={`h1-${i}`} className="formatted-h1">
                        {parseInlineFormatting(trimmedLine.slice(2))}
                    </h1>
                );
            } else if (trimmedLine.startsWith('## ')) {
                flushList();
                flushTable();
                elements.push(
                    <h2 key={`h2-${i}`} className="formatted-h2">
                        {parseInlineFormatting(trimmedLine.slice(3))}
                    </h2>
                );
            } else if (trimmedLine.startsWith('### ')) {
                flushList();
                flushTable();
                elements.push(
                    <h3 key={`h3-${i}`} className="formatted-h3">
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
                    <p key={`p-${i}`} className="formatted-paragraph">
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
                parts.push(<strong key={idx}>{content}</strong>);
            } else if (token.startsWith('__ITALIC_')) {
                const content = token.match(/__ITALIC_\d+_(.+?)__/)?.[1] || '';
                parts.push(<em key={idx}>{content}</em>);
            } else if (token.startsWith('__CODE_')) {
                const content = token.match(/__CODE_\d+_(.+?)__/)?.[1] || '';
                parts.push(<code key={idx} className="formatted-inline-code">{content}</code>);
            } else if (token) {
                parts.push(token);
            }
        });

        return parts;
    };

    return (
        <div className={`ai-response-formatter ${className}`}>
            {formatContent(content)}

            <style jsx>{`
        .ai-response-formatter {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          color: #1a1a1a;
          line-height: 1.6;
        }

        .formatted-h1 {
          font-size: 2em;
          font-weight: 700;
          margin: 1em 0 0.5em 0;
          padding-bottom: 0.3em;
          border-bottom: 2px solid #e5e7eb;
          color: #111827;
        }

        .formatted-h2 {
          font-size: 1.5em;
          font-weight: 600;
          margin: 1em 0 0.5em 0;
          color: #1f2937;
        }

        .formatted-h3 {
          font-size: 1.25em;
          font-weight: 600;
          margin: 1em 0 0.5em 0;
          color: #374151;
        }

        .formatted-paragraph {
          margin: 0.75em 0;
          color: #374151;
        }

        .formatted-list-ordered,
        .formatted-list-unordered {
          margin: 1em 0;
          padding-left: 2em;
        }

        .formatted-list-ordered li,
        .formatted-list-unordered li {
          margin: 0.5em 0;
          color: #374151;
        }

        .formatted-list-ordered {
          list-style-type: decimal;
        }

        .formatted-list-unordered {
          list-style-type: disc;
        }

        .formatted-table-wrapper {
          overflow-x: auto;
          margin: 1.5em 0;
        }

        .formatted-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }

        .formatted-table thead {
          background: #f3f4f6;
        }

        .formatted-table th {
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          color: #111827;
          border-bottom: 2px solid #e5e7eb;
        }

        .formatted-table td {
          padding: 12px 16px;
          border-bottom: 1px solid #e5e7eb;
          color: #374151;
        }

        .formatted-table tbody tr:last-child td {
          border-bottom: none;
        }

        .formatted-table tbody tr:hover {
          background: #f9fafb;
        }

        .formatted-code-block {
          margin: 1.5em 0;
          border-radius: 8px;
          overflow: hidden;
          background: #1e293b;
        }

        .code-language {
          padding: 8px 16px;
          background: #334155;
          color: #94a3b8;
          font-size: 0.875em;
          font-weight: 500;
        }

        .formatted-code-block pre {
          margin: 0;
          padding: 16px;
          overflow-x: auto;
        }

        .formatted-code-block code {
          color: #e2e8f0;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 0.875em;
          line-height: 1.5;
        }

        .formatted-inline-code {
          background: #f3f4f6;
          color: #dc2626;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 0.875em;
        }

        strong {
          font-weight: 600;
          color: #111827;
        }

        em {
          font-style: italic;
        }
      `}</style>
        </div>
    );
};