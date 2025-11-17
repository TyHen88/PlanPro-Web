"use client"

import { useState, useRef, useEffect } from "react"
import { X, Trash2, CalendarDays, Edit, Copy, Check, Maximize2, Minimize2, Tag } from "lucide-react"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/shared/ui/Button"
import { Badge } from "@/components/shared/ui/badge"
import { OnConfirmationDelete } from "@/components/shared/OnConfirmationDelete"
import { cn } from "@/utils/utils"
import { formatDate } from "@/utils/dateformat"

type NoteDetailModalProps = {
  data: any
  onClose: () => void
  onDelete: () => void
  onEdit?: () => void
  open: boolean
}

const colorGradients: Record<string, string> = {
  "bg-blue-400": "from-blue-500 to-blue-300",
  "bg-green-400": "from-green-500 to-green-300",
  "bg-yellow-400": "from-yellow-500 to-yellow-300",
  "bg-orange-400": "from-orange-500 to-orange-300",
  "bg-teal-400": "from-teal-500 to-teal-300",
  "bg-purple-400": "from-purple-500 to-purple-300",
  "bg-pink-400": "from-pink-500 to-pink-300",
}

const NoteDetailModal = ({ data: dataDetail, onClose, onDelete, onEdit, open }: NoteDetailModalProps) => {
  const data = dataDetail
  const [isDeleting, setIsDeleting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const [isContentOverflowing, setIsContentOverflowing] = useState(false)
  const [wordCount, setWordCount] = useState(0)


  //useEffect to calculate word count
  useEffect(() => {
    if (!data?.content) {
      setWordCount(0)
      return
    }

    if (contentRef.current) {
      setIsContentOverflowing(
        contentRef.current.scrollHeight > contentRef.current.clientHeight
      )
    }

    const content = data.content
      .replace(/[^\w\s]|_/g, "")
      .replace(/\s+/g, " ")
      .trim()

    setWordCount(content ? content.split(" ").length : 0)
  }, [data?.content])



  const copyToClipboard = () => {
    if (data?.content) {
      navigator.clipboard.writeText(data.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!data) return null

  const gradient = colorGradients[data.color] || "from-gray-500 to-gray-300"
  const textColor = data.textColor || "text-gray-900"
  const contentLength = data?.content?.length || 0
  const isShortContent = contentLength < 100
  const tags = data.tags || []

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={cn(
              "relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-border",
              expanded ? "h-[80vh] max-h-[80vh]" : "max-h-[600px]",
            )}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Paper texture overlay */}
            <div className="absolute inset-0 bg-[url('/paper-texture.png')] opacity-[0.03] pointer-events-none z-10"></div>

            {/* Colorful Gradient Header with wave shape */}
            <div className={`relative bg-gradient-to-br ${gradient} pt-8 pb-14`}>
              <div className="absolute top-3 right-3 flex gap-2">

              </div>

              <div className="px-6">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={`inline-block w-4 h-4 rounded-full border-2 border-white shadow ${data.color}`}
                  ></span>
                  <h4 className={`text-2xl font-bold drop-shadow-sm text-white tracking-tight line-clamp-2`}>
                    {data.title || "Untitled Note"}
                  </h4>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag: string, index: number) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-white/20 hover:bg-white/30 text-white border-none"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Wave shape divider */}
              <div className="absolute -bottom-1 left-0 right-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
                  <path
                    fill="white"
                    fillOpacity="1"
                    d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,128C672,128,768,160,864,176C960,192,1056,192,1152,176C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                  ></path>
                </svg>
              </div>
            </div>

            {/* Note Content */}
            <div className="bg-card px-8 py-6 relative">
              {/* <div className="absolute -top-12 right-8 z-20">
                <div
                  className={` shadow-lg border-4 border-white ${data.color} w-16 h-16 flex items-center justify-center transform transition-transform hover:scale-110`}
                >
                  <Edit size={28} className="text-white/90" onClick={onEdit} />
                </div>
              </div> */}

              <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                <CalendarDays size={16} />
                <span>{data.createdAt ? formatDate(data.createdAt) : "Unknown"}</span>
                {data.updatedAt && data.updatedAt !== data.createdAt && (
                  <>
                    <span className="mx-1">•</span>
                    <span className="italic">Updated {formatDate(data.updatedAt)}</span>
                  </>
                )}
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-foreground font-medium">Content</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{wordCount} words</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={copyToClipboard}
                      disabled={!data.content}
                      title="Copy content"
                    >
                      {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </Button>
                  </div>
                </div>

                <div
                  className={cn(
                    "bg-muted/50 rounded-xl p-4 border border-border",
                    expanded ? "overflow-y-auto max-h-[calc(80vh-240px)]" : "overflow-y-auto max-h-[200px]",
                    isShortContent && !expanded && "min-h-[100px] flex items-center justify-center",
                  )}
                  ref={contentRef}
                >
                  {data.content ? (
                    <pre
                      className={cn(
                        "whitespace-pre-wrap text-base font-medium text-foreground leading-relaxed",
                        isShortContent && "text-center",
                      )}
                      style={{ fontFamily: "inherit" }}
                    >
                      {data.content}

                    </pre>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground italic">
                      <Tag size={24} className="mb-2 opacity-50" />
                      <span>No content</span>
                    </div>
                  )}
                </div>

                {isContentOverflowing && !expanded && (
                  <div className="text-center mt-2">
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => setExpanded(true)}>
                      Show more <Maximize2 size={14} className="ml-1" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end mt-6 gap-3">
                <Button variant="outline" size="sm" onClick={onClose}>
                  Close
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => setIsDeleting(true)}
                >
                  <Trash2 size={16} />
                  Delete
                </Button>
              </div>
              <div className="absolute top-2 right-8 flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-muted hover:bg-muted/80 text-foreground"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </Button>

              </div>
            </div>
          </motion.div>

          {isDeleting && (
            <OnConfirmationDelete
              show={isDeleting}
              onClose={() => setIsDeleting(false)}
              onConfirm={onDelete}
              title="Delete Note"
              description="Are you sure you want to delete this note? This action cannot be undone."
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default NoteDetailModal
