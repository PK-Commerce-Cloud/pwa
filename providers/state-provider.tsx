"use client";
import { configureObservablePersistence } from "@legendapp/state/persist";
import { ObservablePersistLocalStorage } from "@legendapp/state/persist-plugins/local-storage";

import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { store$ } from "@/lib/state/store";
import { persistObservable } from "@legendapp/state/persist";
import { persistPluginQuery } from "@legendapp/state/persist-plugins/query";

import axios from "axios";
import { enableReactTracking } from "@legendapp/state/config/enableReactTracking";
import { customer$ } from "@/lib/state/customer";

// Global configuration
configureObservablePersistence({
  pluginLocal: ObservablePersistLocalStorage,
});

enableReactTracking({ auto: true });

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <StateProvider>{children}</StateProvider>
    </QueryClientProvider>
  );
}

function StateProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  // Persist this observable
  persistObservable(store$, {
    local: "store",
    pluginRemote: persistPluginQuery({
      queryClient,
      query: {
        queryKey: () => ["basket"],
        queryFn: async () => {
          const { data } = await axios.get("/api/basket");
          return {
            basket: data,
          };
        },
      },
    }),
  });

  persistObservable(customer$, {
    local: "customer",
  });

  return children;
}
