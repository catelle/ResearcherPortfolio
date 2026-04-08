import { ThemeProvider } from "next-themes";
import { RouterProvider } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import { ThemeAccentSync } from "./components/ThemeAccentSync";
import { DataProvider } from "./context/DataContext";
import { router } from "./routes";

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        <DataProvider>
          <ThemeAccentSync />
          <RouterProvider router={router} />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
