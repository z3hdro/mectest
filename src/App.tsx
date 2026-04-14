import * as React from 'react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {RootNavigator} from "@/navigation";
import {Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, useFonts} from "@expo-google-fonts/manrope";

const queryClient = new QueryClient();

export function App() {
  let [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <RootNavigator />
    </QueryClientProvider>
  );
}
