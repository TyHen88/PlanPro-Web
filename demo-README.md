# Demo Folder - AI-Powered Product Visualization

This demo showcases an AI-powered product visualization system that allows users to see how products would look on them by uploading their photos.

## Features

- **AI-Powered Try-On**: Upload a photo and see how products would look on you
- **Product Catalog**: Browse through featured products (Nike shoes, caps, pants, hoodies)
- **Real-time Generation**: Watch as AI generates personalized product images
- **Smooth Animations**: Beautiful loading states and transitions

## Components

### `/pages/demo/index.tsx`
- Main demo page that renders the product visualization interface
- Uses RootLayout for consistent styling

### `/components/ui/demo/ProductPage.tsx`
- Main product showcase component
- Handles photo upload and AI image generation
- Manages state for personalized images and loading states

### `/components/ui/demo/Image-with-landing.tsx`
- Image component with loading states
- Handles image loading and error states gracefully

### `/components/ui/demo/LandingImage.tsx`
- Loading skeleton component
- Provides smooth loading experience

## API Routes

### `/pages/api/generate-image.ts`
- Handles general image generation requests
- Takes two images and a prompt to generate new images

### `/pages/api/generate-model-image.ts`
- Specialized for product modeling
- Takes user photo and product image to generate personalized product photos
- Includes detailed prompts for different product types

## Dependencies

- **AI SDK**: `ai` and `@ai-sdk/google` for AI image generation
- **UI Components**: Custom Button, Input, and Progress components
- **Icons**: Lucide React for UI icons

## Usage

1. Navigate to `/demo` in your application
2. Upload a photo by clicking the upload area or dragging and dropping
3. Watch as AI generates personalized product images
4. Toggle between product catalog and generated images

## Environment Variables

Make sure to set up the following environment variables:

```env
AI_GATEWAY_API_KEY=your_google_ai_api_key
```

## Notes

- The demo uses placeholder images for products
- AI generation requires proper API keys to be configured
- The system is designed to work with Google's Gemini AI model
