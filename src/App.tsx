import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route } from "react-router-dom"

import AdminPanel from "./pages/AdminPanel"
import NotFound from "./pages/NotFound"
import LandingPage from "./components/landing/LandingPage"
import { CompetitionLayout } from "./components/competition/CompetitionLayout"


const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <Routes>
            {/* LANDING PAGE */}
            <Route path="/" element={<LandingPage />} />

            {/* COMPETITION INTERFACE */}
            <Route path="/competition" element={<CompetitionLayout />} />

            {/* ADMIN */}
            <Route path="/admin" element={<AdminPanel />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  )
}
