import React, { useState, useMemo, useCallback, useRef } from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  ArrowUpDown,
  Eye,
  EyeOff
} from 'lucide-react'
import { Button } from '@/components/shared/ui/Button'
import { Input } from '@/components/shared/ui/Input'
import { Badge } from '@/components/shared/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shared/ui/select'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/shared/ui/dropdown-menu'
import { cn } from '@/utils/utils'

// Sample data type - replace with your actual data type
export interface TelegramData {
  id: string
  name: string
  username: string
  status: 'active' | 'inactive' | 'pending'
  joinDate: string
  messageCount: number
  lastSeen: string
  role: 'admin' | 'member' | 'moderator'
}

// Sample data - replace with your actual data source
const sampleData: TelegramData[] = [
  {
    id: '1',
    name: 'John Doe',
    username: '@johndoe',
    status: 'active',
    joinDate: '2024-01-15',
    messageCount: 2543,
    lastSeen: '2024-01-20',
    role: 'admin'
  },
  {
    id: '2',
    name: 'Jane Smith',
    username: '@janesmith',
    status: 'inactive',
    joinDate: '2024-01-10',
    messageCount: 1234,
    lastSeen: '2024-01-18',
    role: 'member'
  },
  {
    id: '3',
    name: 'Bob Wilson',
    username: '@bobwilson',
    status: 'pending',
    joinDate: '2024-01-20',
    messageCount: 456,
    lastSeen: '2024-01-21',
    role: 'moderator'
  },
  {
    id: '4',
    name: 'Alice Brown',
    username: '@alicebrown',
    status: 'active',
    joinDate: '2024-01-12',
    messageCount: 3456,
    lastSeen: '2024-01-21',
    role: 'member'
  },
  {
    id: '5',
    name: 'Charlie Davis',
    username: '@charliedavis',
    status: 'active',
    joinDate: '2024-01-08',
    messageCount: 789,
    lastSeen: '2024-01-19',
    role: 'admin'
  }
]

interface TelegramTableProps {
  data?: TelegramData[]
  onRowSelect?: (rows: TelegramData[]) => void
  onAddNew?: () => void
  onExport?: () => void
}

const TelegramTable: React.FC<TelegramTableProps> = ({
  data = sampleData,
  onRowSelect,
  onAddNew,
  onExport
}) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')

  // Use ref to store the latest onRowSelect callback
  const onRowSelectRef = useRef(onRowSelect)
  onRowSelectRef.current = onRowSelect

  // Define columns
  const columns = useMemo<ColumnDef<TelegramData>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(value) => table.toggleAllPageRowsSelected(!!value.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={(value) => row.toggleSelected(!!value.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold"
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('name')}</div>
        ),
      },
      {
        accessorKey: 'username',
        header: 'Username',
        cell: ({ row }) => (
          <div className="text-blue-600 font-mono text-sm">
            {row.getValue('username')}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status') as string
          return (
            <Badge
              variant={
                status === 'active'
                  ? 'default'
                  : status === 'inactive'
                    ? 'secondary'
                    : 'destructive'
              }
              className={cn(
                status === 'active' && 'bg-green-100 text-green-800 hover:bg-green-200',
                status === 'inactive' && 'bg-gray-100 text-gray-800 hover:bg-gray-200',
                status === 'pending' && 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              )}
            >
              {status}
            </Badge>
          )
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id))
        },
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => {
          const role = row.getValue('role') as string
          return (
            <Badge
              variant="outline"
              className={cn(
                role === 'admin' && 'border-red-200 text-red-700',
                role === 'moderator' && 'border-blue-200 text-blue-700',
                role === 'member' && 'border-gray-200 text-gray-700'
              )}
            >
              {role}
            </Badge>
          )
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id))
        },
      },
      {
        accessorKey: 'messageCount',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold"
          >
            Messages
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-right font-mono">
            {row.getValue<number>('messageCount').toLocaleString()}
          </div>
        ),
      },
      {
        accessorKey: 'joinDate',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold"
          >
            Join Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-sm">
            {new Date(row.getValue('joinDate')).toLocaleDateString()}
          </div>
        ),
      },
      {
        accessorKey: 'lastSeen',
        header: 'Last Seen',
        cell: ({ row }) => (
          <div className="text-sm text-gray-600">
            {new Date(row.getValue('lastSeen')).toLocaleDateString()}
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem>View Details</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Edit User</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Send Message</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem className="text-red-600">
                Remove User
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updater) => {
      const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater
      setRowSelection(newSelection)

      // Call onRowSelect with the current selected rows
      if (onRowSelectRef.current) {
        // Calculate selected rows based on the new selection
        const selectedRowIds = Object.keys(newSelection).filter(key => newSelection[key])
        const selectedRows = data.filter((_, index) => selectedRowIds.includes(String(index)))
        onRowSelectRef.current(selectedRows)
      }
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  })

  return (
    <div className="w-full space-y-4 overflow-auto h-[300px] lg:h-[400px]">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-2xl font-bold tracking-tight">Telegram Users</h2>
          <Badge variant="secondary" className="ml-2">
            {table.getFilteredRowModel().rows.length} users
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          {onAddNew && (
            <Button onClick={onAddNew} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          )}
          {onExport && (
            <Button onClick={onExport} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Filters and controls */}
      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={globalFilter ?? ''}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pl-8 max-w-sm"
            />
          </div>
        </div>

        {/* Status filter */}
        <Select
          value={(table.getColumn('status')?.getFilterValue() as string[])?.join(',') || 'all'}
          onValueChange={(value) => {
            table.getColumn('status')?.setFilterValue(value === 'all' ? undefined : [value])
          }}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>

        {/* Role filter */}
        <Select
          value={(table.getColumn('role')?.getFilterValue() as string[])?.join(',') || 'all'}
          onValueChange={(value) => {
            table.getColumn('role')?.setFilterValue(value === 'all' ? undefined : [value])
          }}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="moderator">Moderator</SelectItem>
            <SelectItem value="member">Member</SelectItem>
          </SelectContent>
        </Select>

        {/* Column visibility */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Eye className="mr-2 h-4 w-4" />
              Columns
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value: boolean) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Selected rows info */}
      {table.getFilteredSelectedRowModel().rows.length > 0 && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>
            {table.getFilteredSelectedRowModel().rows.length} of{' '}
            {table.getFilteredRowModel().rows.length} row(s) selected
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRowSelection({})}
          >
            Clear Selection
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b bg-muted/50">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "border-b transition-colors hover:bg-muted/50",
                      row.getIsSelected() && "bg-muted"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="p-4 align-middle"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TelegramTable