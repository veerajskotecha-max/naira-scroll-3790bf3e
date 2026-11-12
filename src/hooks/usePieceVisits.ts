import { useQuery } from "@tanstack/react-query";
import { fetchVisits, readCachedVisits } from "@/lib/shopOrder";

// Shop and collection pages share one popularity request and cache.
export function usePieceVisits() {
  return useQuery({
    queryKey: ["piece-visits"],
    queryFn: async () => (await fetchVisits()) ?? readCachedVisits(),
    initialData: readCachedVisits,
    initialDataUpdatedAt: 0,
    staleTime: 60 * 60 * 1000,
    refetchInterval: 60 * 60 * 1000,
  }).data;
}