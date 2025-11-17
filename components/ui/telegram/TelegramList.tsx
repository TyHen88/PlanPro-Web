import React, { useState } from 'react'
import TelegramTable, { TelegramData } from '@/components/shared/TelegramTable'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/shared/ui/card'
import { CheckSquare, Target, Zap, Star, Plus } from 'lucide-react'
import { Tabs, TabsTrigger, TabsList, TabsContent } from '@/components/shared/ui/tabs'
import { Search } from 'lucide-react'
import Image from 'next/image'
import tripImg from '@/public/images/trip.png'
import { Input } from '@/components/shared/ui/Input'


const features = [
    {
        id: 'trip',
        name: 'Trip',
        color: 'blue',
        icon: <CheckSquare className="h-5 w-5 text-blue-600" />,
        bg: 'bg-blue-100',
    },
    {
        id: 'reminder',
        name: 'Reminder',
        color: 'green',
        icon: <Target className="h-5 w-5 text-green-600" />,
        bg: 'bg-green-100',
    },
    {
        id: 'report',
        name: 'Report',
        color: 'purple',
        icon: <Zap className="h-5 w-5 text-purple-600" />,
        bg: 'bg-purple-100',
    },
    {
        id: 'note',
        name: 'Note',
        color: 'yellow',
        icon: <Star className="h-5 w-5 text-yellow-600" />,
        bg: 'bg-yellow-100',
    },
    {
        id: 'todo',
        name: 'Todo',
        color: 'pink',
        icon: <Star className="h-5 w-5 text-pink-600" />,
        bg: 'bg-pink-100',
    },
    {
        id: 'calendar',
        name: 'Calendar',
        color: 'orange',
        icon: <Star className="h-5 w-5 text-orange-600" />,
        bg: 'bg-orange-100',
    },
]
const StatCard = ({
    value,
    label,
    color,
    bgColor,
}: {
    value: number
    label: string
    color: string
    bgColor: string
}) => (
    <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-lg px-4 py-3 shadow-sm border border-white flex items-center">
        <div className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center mr-3`}>
            <span className={`${color} font-semibold`}>{value}</span>
        </div>
        <span className="text-gray-700">{label}</span>
    </div>
)
const TelegramList: React.FC = () => {
    const [selectedRows, setSelectedRows] = useState<TelegramData[]>([])
    const [activeTab, setActiveTab] = useState<string>('trip')

    const handleRowSelect = (rows: TelegramData[]) => {
        setSelectedRows(rows)
        // console.log('Selected rows:', rows)
    }

    const handleAddNew = () => {
        toast.success('Add new user functionality triggered!')
        // Implement your add new user logic here
    }

    const handleExport = () => {
        toast.success('Export functionality triggered!')
        // console.log('Exporting data:', selectedRows)
        // Implement your export logic here
    }

    // No handleBulkAction or handleFeatureToggle needed for this UI

    return (
        <>
            {/* Header Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-400 to-teal-400 opacity-10 rounded-xl"></div>
                <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-teal-50 rounded-xl p-6 relative shadow-lg border border-white z-1">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full opacity-5 translate-x-1/3 -translate-y-1/3"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400 rounded-full opacity-5 -translate-x-1/3 translate-y-1/3"></div>

                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent mb-2">
                            Telegram List
                        </h1>
                        <div className="text-gray-600 text-sm mb-4">Dashboard • Telegram List</div>
                        <div className="flex flex-wrap gap-4 text-sm">
                            <StatCard
                                value={0}
                                label="Total Trips"
                                color="text-blue-500"
                                bgColor="bg-blue-100"
                            />
                            <StatCard
                                value={0}
                                label="Upcoming"
                                color="text-yellow-500"
                                bgColor="bg-yellow-100"
                            />
                            <StatCard
                                value={0}
                                label="Completed"
                                color="text-green-500"
                                bgColor="bg-green-100"
                            />
                            <StatCard
                                value={0}
                                label="Destinations"
                                color="text-purple-500"
                                bgColor="bg-purple-100"
                            />
                        </div>
                    </div>
                    <div className="absolute right-6 top-1/2 transform -translate-y-1/2 hidden md:block">
                        {/* <Image src={tripImg || "/placeholder.svg"} alt="Travel illustration" width={120} height={120} /> */}
                    </div>
                </div>
            </div>


            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mt-4 mb-4 flex gap-2 bg-white/80 rounded-lg shadow-sm p-1 border border-gray-200 w-full max-w-2xl text-left">
                    {features.map((feature) => (
                        <TabsTrigger
                            key={feature.id}
                            value={feature.id}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors duration-150 text-left
                                ${activeTab === feature.id
                                    ? `${feature.bg} ${feature.color} shadow`
                                    : "text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            {feature.icon}
                            {feature.name}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="trip">
                    <div className="p-4 overflow-auto">
                        <TelegramTable
                            onRowSelect={handleRowSelect}
                            onAddNew={handleAddNew}
                            onExport={handleExport}
                        />
                    </div>
                </TabsContent>
                <TabsContent value="reminder">
                    <div className='h-full w-full'>
                        <h1>Reminder</h1>
                    </div>
                </TabsContent>
                <TabsContent value="report">
                    <div className='h-full w-full'>
                        <h1>Report</h1>
                    </div>
                </TabsContent>
                <TabsContent value="note">
                    <div className='h-full w-full'>
                        <h1>Note</h1>
                    </div>
                </TabsContent>
                <TabsContent value="todo">
                    <div className='h-full w-full'>
                        <h1>Todo</h1>
                    </div>
                </TabsContent>
                <TabsContent value="calendar">
                    <div className='h-full w-full'>
                        <h1>Calendar</h1>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Selected rows display */}
            {/* {selectedRows.length > 0 && (
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
            )} */}
        </>
    )
}

export default TelegramList
