"use client"

import React, { useState } from 'react'
import TelegramTable, { TelegramData } from './TelegramTable'
import { Button } from '@/components/shared/ui/Button'
import { toast } from 'sonner'

const TelegramTableDemo: React.FC = () => {
  const [selectedRows, setSelectedRows] = useState<TelegramData[]>([])

  const handleRowSelect = (rows: TelegramData[]) => {
    setSelectedRows(rows)
    console.log('Selected rows:', rows)
  }

  const handleAddNew = () => {
    toast.success('Add new user functionality triggered!')
    // Implement your add new user logic here
  }

  const handleExport = () => {
    toast.success('Export functionality triggered!')
    console.log('Exporting data:', selectedRows)
    // Implement your export logic here
  }

  const handleBulkAction = () => {
    if (selectedRows.length === 0) {
      toast.error('Please select at least one row')
      return
    }
    toast.success(`Bulk action performed on ${selectedRows.length} rows`)
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Telegram Table Demo</h1>
          <p className="text-muted-foreground">
            A fully featured table built with TanStack Table
          </p>
        </div>

        {selectedRows.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              {selectedRows.length} selected
            </span>
            <Button onClick={handleBulkAction} variant="outline" size="sm">
              Bulk Action
            </Button>
          </div>
        )}
      </div>

      <TelegramTable
        onRowSelect={handleRowSelect}
        onAddNew={handleAddNew}
        onExport={handleExport}
      />

      {/* Selected rows display */}
      {selectedRows.length > 0 && (
        <div className="bg-muted/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Selected Users:</h3>
          <div className="space-y-1">
            {selectedRows.map((row) => (
              <div key={row.id} className="text-sm">
                <span className="font-medium">{row.name}</span> - {row.username} ({row.status})
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TelegramTableDemo 