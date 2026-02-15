"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const muiTheme = createTheme({
  palette: {
    primary: { main: "#18222e" },
    secondary: { main: "#243a5c" },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>
    </QueryClientProvider>
  );
}
