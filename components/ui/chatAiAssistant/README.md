# AI Assistant Components

This folder contains reusable components for the AI Assistant functionality in the PlanPro application.

## Components

### Core Components

- **`ChatInput.tsx`** - Reusable chat input component with auto-resize and keyboard shortcuts
- **`ChatMessage.tsx`** - Message display component with support for user, AI, and system messages
- **`QuickActions.tsx`** - Quick action buttons for common tasks
- **`ChatHeader.tsx`** - Header component with title, icon, and close button
- **`ChatContainer.tsx`** - Scrollable container for chat messages with auto-scroll
- **`AIAssistantProvider.tsx`** - Context provider for AI assistant state and actions
- **`MainChatDrawers.tsx`** - Main chat drawer component using all other components

### Features

- **Modular Design**: Each component is self-contained and reusable
- **TypeScript Support**: Full type safety with proper interfaces
- **Responsive Design**: Works on mobile and desktop
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Loading States**: Built-in loading indicators and disabled states
- **Auto-scroll**: Automatic scrolling to latest messages
- **Quick Actions**: Predefined action buttons for common tasks

## API Endpoints

The AI Assistant integrates with the following endpoints:

### GET Endpoints
- `/api/wb/v1/ai-assistant/intents` - Get supported intents
- `/api/wb/v1/ai-assistant/context` - Get AI assistant context

### POST Endpoints
- `/api/wb/v1/ai-assistant/analyze` - Analyze user intent
- `/api/wb/v1/ai-assistant/execute` - Execute commands
- `/api/wb/v1/ai-assistant/batch` - Execute batch commands
- `/api/wb/v1/ai-assistant/chat` - Chat with AI assistant

## Usage

### Basic Usage

```tsx
import { MainChatDrawers } from '@/components/ui/chatAiAssistant'

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <MainChatDrawers 
      open={isOpen} 
      setOpen={setIsOpen} 
    />
  )
}
```

### Using Individual Components

```tsx
import { 
  ChatInput, 
  ChatMessage, 
  QuickActions, 
  AIAssistantProvider 
} from '@/components/ui/chatAiAssistant'

function CustomChat() {
  return (
    <AIAssistantProvider>
      <ChatContainer>
        <ChatMessage 
          text="Hello!" 
          from="ai" 
          timestamp={Date.now()} 
        />
        <ChatInput onSend={handleSend} />
      </ChatContainer>
    </AIAssistantProvider>
  )
}
```

### Using the AI Assistant Context

```tsx
import { useAIAssistant } from '@/components/ui/chatAiAssistant'

function MyComponent() {
  const { 
    chatAiAssistant, 
    analyzeIntent, 
    executeCommand 
  } = useAIAssistant()
  
  const handleChat = async (message: string) => {
    const response = await chatAiAssistant({ message })
    // Handle response
  }
}
```

## Types

### QuickAction
```tsx
interface QuickAction {
  icon: ReactNode
  label: string
  generateMessage: () => string
  color?: string
}
```

### ChatMessage Props
```tsx
interface ChatMessageProps {
  text: string
  from: "ai" | "user" | "system"
  timestamp?: number
  isLoading?: boolean
  children?: ReactNode
  className?: string
}
```

## Styling

All components use Tailwind CSS classes and are fully customizable. The components follow the design system with:

- Consistent spacing and typography
- Hover and focus states
- Loading animations
- Responsive breakpoints
- Dark/light mode support (via CSS variables)

## Testing

To test the AI Assistant:

1. Navigate to `/ai-assistant-demo` in your browser
2. Click "Open AI Assistant" to open the chat drawer
3. Try the quick actions or type custom messages
4. Test all the different intents (trip, note, calendar, task, telegram)

## Integration

The AI Assistant can be integrated into any part of the application by:

1. Importing the `MainChatDrawers` component
2. Adding state management for open/close
3. Optionally customizing the quick actions
4. Implementing custom message handling if needed

## Future Enhancements

- Voice input support
- File upload capabilities
- Rich message formatting (markdown, links, etc.)
- Message history persistence
- Multi-language support
- Custom AI model integration
