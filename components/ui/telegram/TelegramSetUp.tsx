"use client"

import { useState } from "react"
import { MessageCircle, Calendar, CheckSquare, FileText, MapPin, Bell, BarChart3, Users, Settings, ArrowRight, Check, Star, Clock, Target, Zap, Shield, Smartphone, Globe, ChevronRight, Info, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card"
import { Badge } from "@/components/shared/ui/badge"
import { Label } from "@/components/shared/ui/label"
import { Button } from "@/components/shared/ui/Button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/shared/ui/dialog"
import { Switch } from "@/components/shared/ui/swtich"
import { Input } from "@/components/shared/ui/Input"
import { cn } from "@/utils/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shared/ui/tabs"

// Types
interface ProductivityFeature {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: "core" | "advanced" | "premium"
  isEnabled: boolean
  telegramIntegration: {
    notifications: boolean
    commands: boolean
    reports: boolean
  }
  benefits: string[]
  commands: string[]
  notifications: string[]
}

interface FeatureCategory {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  features: ProductivityFeature[]
}

// Sample data
const productivityFeatures: FeatureCategory[] = [
  {
    id: "core",
    name: "Core Features",
    description: "Essential productivity tools for daily task management",
    icon: <CheckSquare className="h-5 w-5" />,
    color: "blue",
    features: [
      {
        id: "tasks",
        name: "Task Management",
        description: "Create, organize, and track your daily tasks with priorities and deadlines",
        icon: <CheckSquare className="h-5 w-5 text-blue-500" />,
        category: "core",
        isEnabled: true,
        telegramIntegration: {
          notifications: true,
          commands: true,
          reports: true,
        },
        benefits: [
          "Get task reminders via Telegram",
          "Add tasks using bot commands",
          "Mark tasks complete from chat",
          "Daily task summary messages",
        ],
        commands: ["/add", "/complete", "/today", "/tasks"],
        notifications: ["Task due reminders", "Task completion confirmations", "Daily task summary"],
      },
      {
        id: "calendar",
        name: "Calendar & Events",
        description: "Schedule events, meetings, and appointments with smart reminders",
        icon: <Calendar className="h-5 w-5 text-green-500" />,
        category: "core",
        isEnabled: true,
        telegramIntegration: {
          notifications: true,
          commands: true,
          reports: false,
        },
        benefits: [
          "Event reminders before meetings",
          "Quick event creation via chat",
          "Daily schedule overview",
          "Meeting conflict alerts",
        ],
        commands: ["/schedule", "/events", "/agenda", "/next"],
        notifications: ["Event reminders", "Schedule changes", "Meeting alerts"],
      },
      {
        id: "notes",
        name: "Notes & Documentation",
        description: "Capture ideas, create documentation, and organize your thoughts",
        icon: <FileText className="h-5 w-5 text-purple-500" />,
        category: "core",
        isEnabled: true,
        telegramIntegration: {
          notifications: false,
          commands: true,
          reports: false,
        },
        benefits: [
          "Quick note creation from chat",
          "Search notes via commands",
          "Share notes instantly",
          "Voice note transcription",
        ],
        commands: ["/note", "/search", "/notes", "/share"],
        notifications: ["Note sharing confirmations"],
      },
      {
        id: "reminders",
        name: "Smart Reminders",
        description: "Set up intelligent reminders for important deadlines and events",
        icon: <Bell className="h-5 w-5 text-orange-500" />,
        category: "core",
        isEnabled: true,
        telegramIntegration: {
          notifications: true,
          commands: true,
          reports: false,
        },
        benefits: [
          "Instant reminder notifications",
          "Snooze reminders from chat",
          "Recurring reminder setup",
          "Location-based reminders",
        ],
        commands: ["/remind", "/snooze", "/reminders", "/recurring"],
        notifications: ["Reminder alerts", "Snooze confirmations", "Recurring reminders"],
      },
    ],
  },
  {
    id: "advanced",
    name: "Advanced Features",
    description: "Enhanced productivity tools for power users and teams",
    icon: <Target className="h-5 w-5" />,
    color: "purple",
    features: [
      {
        id: "planning",
        name: "Project Planning",
        description: "Create detailed project plans with milestones, deadlines, and progress tracking",
        icon: <Target className="h-5 w-5 text-indigo-500" />,
        category: "advanced",
        isEnabled: false,
        telegramIntegration: {
          notifications: true,
          commands: true,
          reports: true,
        },
        benefits: [
          "Project milestone alerts",
          "Progress update notifications",
          "Deadline warnings",
          "Weekly project reports",
        ],
        commands: ["/projects", "/milestones", "/progress", "/deadlines"],
        notifications: ["Milestone alerts", "Deadline warnings", "Progress updates", "Weekly reports"],
      },
      {
        id: "trips",
        name: "Travel Planning",
        description: "Plan and organize your trips with itineraries, bookings, and travel reminders",
        icon: <MapPin className="h-5 w-5 text-emerald-500" />,
        category: "advanced",
        isEnabled: false,
        telegramIntegration: {
          notifications: true,
          commands: true,
          reports: false,
        },
        benefits: [
          "Flight and hotel reminders",
          "Itinerary updates",
          "Travel document alerts",
          "Weather notifications",
        ],
        commands: ["/trips", "/itinerary", "/bookings", "/travel"],
        notifications: ["Flight reminders", "Check-in alerts", "Weather updates", "Itinerary changes"],
      },
      {
        id: "analytics",
        name: "Productivity Analytics",
        description: "Track your productivity patterns and get insights on your performance",
        icon: <BarChart3 className="h-5 w-5 text-cyan-500" />,
        category: "advanced",
        isEnabled: false,
        telegramIntegration: {
          notifications: false,
          commands: true,
          reports: true,
        },
        benefits: [
          "Weekly productivity reports",
          "Goal achievement tracking",
          "Time management insights",
          "Performance trends",
        ],
        commands: ["/stats", "/report", "/goals", "/insights"],
        notifications: ["Weekly reports", "Goal achievements", "Performance insights"],
      },
    ],
  },
  {
    id: "premium",
    name: "Premium Features",
    description: "Advanced collaboration and automation tools for teams",
    icon: <Star className="h-5 w-5" />,
    color: "gold",
    features: [
      {
        id: "collaboration",
        name: "Team Collaboration",
        description: "Share projects, assign tasks, and collaborate with team members",
        icon: <Users className="h-5 w-5 text-rose-500" />,
        category: "premium",
        isEnabled: false,
        telegramIntegration: {
          notifications: true,
          commands: true,
          reports: true,
        },
        benefits: [
          "Team task assignments",
          "Collaboration notifications",
          "Shared project updates",
          "Team performance reports",
        ],
        commands: ["/assign", "/team", "/collaborate", "/shared"],
        notifications: ["Task assignments", "Team updates", "Collaboration alerts", "Team reports"],
      },
      {
        id: "automation",
        name: "Smart Automation",
        description: "Automate repetitive tasks and create intelligent workflows",
        icon: <Zap className="h-5 w-5 text-yellow-500" />,
        category: "premium",
        isEnabled: false,
        telegramIntegration: {
          notifications: true,
          commands: true,
          reports: false,
        },
        benefits: [
          "Automated task creation",
          "Smart scheduling",
          "Workflow notifications",
          "AI-powered suggestions",
        ],
        commands: ["/automate", "/workflows", "/ai", "/smart"],
        notifications: ["Automation alerts", "Workflow updates", "AI suggestions"],
      },
      {
        id: "integrations",
        name: "Third-party Integrations",
        description: "Connect with popular tools like Google Calendar, Slack, and more",
        icon: <Globe className="h-5 w-5 text-teal-500" />,
        category: "premium",
        isEnabled: false,
        telegramIntegration: {
          notifications: true,
          commands: false,
          reports: false,
        },
        benefits: [
          "Cross-platform sync",
          "Unified notifications",
          "Data synchronization",
          "Seamless workflows",
        ],
        commands: ["/sync", "/connect", "/integrations"],
        notifications: ["Sync notifications", "Integration alerts", "Data updates"],
      },
    ],
  },
]

// Components
const FeatureCard = ({
  feature,
  onToggle,
  onViewDetails,
}: {
  feature: ProductivityFeature
  onToggle: (featureId: string, enabled: boolean) => void
  onViewDetails: (feature: ProductivityFeature) => void
}) => {
  const categoryColors = {
    core: "border-blue-200 bg-blue-50",
    advanced: "border-purple-200 bg-purple-50",
    premium: "border-yellow-200 bg-yellow-50",
  }

  const categoryBadges = {
    core: "bg-blue-100 text-blue-800",
    advanced: "bg-purple-100 text-purple-800",
    premium: "bg-yellow-100 text-yellow-800",
  }

  return (
    <Card className={cn("transition-all duration-200 hover:shadow-md", feature.isEnabled && categoryColors[feature.category])}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-white shadow-sm">{feature.icon}</div>
            <div>
              <CardTitle className="text-lg">{feature.name}</CardTitle>
              <Badge className={categoryBadges[feature.category]} variant="secondary">
                {feature.category}
              </Badge>
            </div>
          </div>
          <Switch checked={feature.isEnabled} onCheckedChange={(checked) => onToggle(feature.id, checked)} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600 text-sm">{feature.description}</p>

        {feature.isEnabled && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Telegram Integration:</span>
              <div className="flex space-x-2">
                {feature.telegramIntegration.notifications && (
                  <Badge variant="outline" className="text-xs">
                    <Bell className="h-3 w-3 mr-1" />
                    Notifications
                  </Badge>
                )}
                {feature.telegramIntegration.commands && (
                  <Badge variant="outline" className="text-xs">
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Commands
                  </Badge>
                )}
                {feature.telegramIntegration.reports && (
                  <Badge variant="outline" className="text-xs">
                    <BarChart3 className="h-3 w-3 mr-1" />
                    Reports
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{feature.commands.length} commands available</span>
              <Button variant="ghost" size="sm" onClick={() => onViewDetails(feature)}>
                View Details
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const FeatureDetailsModal = ({
  feature,
  isOpen,
  onClose,
}: {
  feature: ProductivityFeature | null
  isOpen: boolean
  onClose: () => void
}) => {
  if (!feature) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            {feature.icon}
            <span>{feature.name}</span>
            <Badge className={feature.category === "core" ? "bg-blue-100 text-blue-800" :
              feature.category === "advanced" ? "bg-purple-100 text-purple-800" :
                "bg-yellow-100 text-yellow-800"}>
              {feature.category}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-gray-700">{feature.description}</p>

          <div className="space-y-4">
            <h4 className="font-semibold flex items-center">
              <Star className="h-4 w-4 mr-2 text-yellow-500" />
              Benefits with Telegram Integration
            </h4>
            <ul className="space-y-2">
              {feature.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold flex items-center">
              <MessageCircle className="h-4 w-4 mr-2 text-blue-500" />
              Available Commands
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {feature.commands.map((command, index) => (
                <code key={index} className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                  {command}
                </code>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold flex items-center">
              <Bell className="h-4 w-4 mr-2 text-orange-500" />
              Notification Types
            </h4>
            <ul className="space-y-2">
              {feature.notifications.map((notification, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <Bell className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{notification}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Integration Status</h4>
                <p className="text-sm text-blue-700 mt-1">
                  {feature.isEnabled
                    ? "This feature is enabled and will be available in Telegram after you connect your account."
                    : "Enable this feature to access it through Telegram integration."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const SetupSummary = ({
  features,
  onProceedToTelegram,
}: {
  features: FeatureCategory[]
  onProceedToTelegram: () => void
}) => {
  const enabledFeatures = features.flatMap(category => category.features.filter(f => f.isEnabled))
  const totalCommands = enabledFeatures.reduce((sum, feature) => sum + feature.commands.length, 0)
  const totalNotifications = enabledFeatures.reduce((sum, feature) => sum + feature.notifications.length, 0)

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="h-5 w-5 mr-2 text-blue-500" />
          Setup Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{enabledFeatures.length}</div>
            <div className="text-sm text-gray-600">Features Enabled</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{totalCommands}</div>
            <div className="text-sm text-gray-600">Bot Commands</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{totalNotifications}</div>
            <div className="text-sm text-gray-600">Notification Types</div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium">Enabled Features:</h4>
          <div className="flex flex-wrap gap-2">
            {enabledFeatures.map((feature) => (
              <Badge key={feature.id} variant="outline" className="bg-white">
                {feature.name}
              </Badge>
            ))}
          </div>
        </div>

        {enabledFeatures.length > 0 ? (
          <div className="space-y-3">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Ready for Telegram Integration</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Your features are configured and ready to connect with Telegram. You'll be able to use {totalCommands} commands and receive {totalNotifications} types of notifications.
                  </p>
                </div>
              </div>
            </div>

            <Button onClick={onProceedToTelegram} className="w-full" size="lg">
              <MessageCircle className="h-5 w-5 mr-2" />
              Proceed to Telegram Setup
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900">No Features Enabled</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Please enable at least one feature to proceed with Telegram integration.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Main component
export default function TelegramFeatureSetup() {
  const [features, setFeatures] = useState<FeatureCategory[]>(productivityFeatures)
  const [selectedFeature, setSelectedFeature] = useState<ProductivityFeature | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const handleFeatureToggle = (featureId: string, enabled: boolean) => {
    setFeatures(prev =>
      prev.map(category => ({
        ...category,
        features: category.features.map(feature =>
          feature.id === featureId ? { ...feature, isEnabled: enabled } : feature
        ),
      }))
    )
  }

  const handleViewDetails = (feature: ProductivityFeature) => {
    setSelectedFeature(feature)
    setShowDetailsModal(true)
  }

  const handleProceedToTelegram = () => {
    // Navigate to Telegram integration page
    console.log("Proceeding to Telegram setup...")
    // In a real app, this would navigate to the TelegramIntegration component
  }

  const enabledFeaturesCount = features.reduce(
    (sum, category) => sum + category.features.filter(f => f.isEnabled).length,
    0
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="relative">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 opacity-70"></div>

          <div className="relative container mx-auto px-4 py-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Configure Your Productivity Features
                </span>
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Choose which features you want to enable for Telegram integration. You can always modify these settings later.
              </p>

              <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">1</div>
                  <span>Configure Features</span>
                </div>
                <ArrowRight className="h-4 w-4" />
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 font-medium">2</div>
                  <span>Connect Telegram</span>
                </div>
                <ArrowRight className="h-4 w-4" />
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 font-medium">3</div>
                  <span>Start Using</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="core">Core Features</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="premium">Premium</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8 mt-8">
            {/* Quick stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Enabled Features</p>
                      <h3 className="text-2xl font-bold text-gray-900">{enabledFeaturesCount}</h3>
                    </div>
                    <div className="rounded-full bg-blue-100 p-2">
                      <CheckSquare className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Core Features</p>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {features.find(c => c.id === "core")?.features.filter(f => f.isEnabled).length || 0}
                      </h3>
                    </div>
                    <div className="rounded-full bg-green-100 p-2">
                      <Target className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Advanced</p>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {features.find(c => c.id === "advanced")?.features.filter(f => f.isEnabled).length || 0}
                      </h3>
                    </div>
                    <div className="rounded-full bg-purple-100 p-2">
                      <Zap className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Premium</p>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {features.find(c => c.id === "premium")?.features.filter(f => f.isEnabled).length || 0}
                      </h3>
                    </div>
                    <div className="rounded-full bg-yellow-100 p-2">
                      <Star className="h-5 w-5 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Feature categories overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {features.map((category) => (
                <Card key={category.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        category.color === "blue" && "bg-blue-100",
                        category.color === "purple" && "bg-purple-100",
                        category.color === "gold" && "bg-yellow-100"
                      )}>
                        {category.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{category.name}</h3>
                        <p className="text-sm text-gray-500 font-normal">{category.description}</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Features:</span>
                        <span className="font-medium">
                          {category.features.filter(f => f.isEnabled).length} / {category.features.length} enabled
                        </span>
                      </div>

                      <div className="space-y-2">
                        {category.features.map((feature) => (
                          <div key={feature.id} className="flex items-center justify-between">
                            <span className="text-sm">{feature.name}</span>
                            <Switch
                              checked={feature.isEnabled}
                              onCheckedChange={(checked) => handleFeatureToggle(feature.id, checked)}
                            //   size="sm"
                            />
                          </div>
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setActiveTab(category.id)}
                      >
                        Configure {category.name}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Setup summary */}
            <SetupSummary features={features} onProceedToTelegram={handleProceedToTelegram} />
          </TabsContent>

          {/* Individual category tabs */}
          {features.map((category) => (
            <TabsContent key={category.id} value={category.id} className="space-y-6 mt-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{category.name}</h2>
                <p className="text-gray-600">{category.description}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {category.features.map((feature) => (
                  <FeatureCard
                    key={feature.id}
                    feature={feature}
                    onToggle={handleFeatureToggle}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Feature details modal */}
        <FeatureDetailsModal
          feature={selectedFeature}
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
        />
      </div>
    </div>
  )
}
