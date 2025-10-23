import { AiAssistantResponse } from "@/lib/types/aiAssistant";
import aiAssistantService from "@/service/aiAssistant.service";
import { useQuery } from "@tanstack/react-query";

// Get supported intents
export const useFetchSupportedIntents = () => {
    return useQuery({
        queryKey: ["supported-intents"],
        queryFn: aiAssistantService.getSupportedIntents,
        retry: 0,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        staleTime: 5 * 60 * 1000,
        refetchInterval: 10 * 60 * 1000,
    });
};

// Get AI assistant context (accepts optional parameters)
export const useFetchAiAssistantContext = (params: Partial<AiAssistantResponse> = {}) => {
    return useQuery({
        queryKey: ["ai-assistant-context", params],
        queryFn: () => aiAssistantService.getAiAssistantContext(params),
        retry: 0,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        staleTime: 5 * 60 * 1000,
        refetchInterval: 10 * 60 * 1000,
    });
};

