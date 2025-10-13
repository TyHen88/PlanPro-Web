import { authService } from "@/service/auth.service";
import { useQuery } from "@tanstack/react-query";

const useFetchAuthRefreshToken = (email: string) => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['auth-data', email],
        queryFn: () => authService.getRefreshToken({ email: email }),
        enabled: !!email,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchInterval: 10 * 60 * 1000,
        refetchIntervalInBackground: true,
    });

    return {
        data,
        isLoading,
        isError
    }
}

export { useFetchAuthRefreshToken } 