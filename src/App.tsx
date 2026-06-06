import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ServicesPage from './pages/ServicesPage'
import PortfolioPage from './pages/PortfolioPage'
import ContactPage from './pages/ContactPage'
import { Toaster } from './components/ui/toaster'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminPage from './pages/AdminPage'
import RequireAdminAuth from './components/auth/RequireAdminAuth'
import PortalAuthPage from './pages/PortalAuthPage'
import PortalPage from './pages/PortalPage'
import RequireUserAuth from './components/auth/RequireUserAuth'
import AgentChat from './components/AgentChatComponent'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route
            element={
              <div className="min-h-screen">
                <Header darkMode={darkMode} setDarkMode={setDarkMode} />
                <main>
                  <Outlet />
                </main>
                <Footer />
                <Toaster />
                <AgentChat />
              </div>
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route element={<RequireAdminAuth />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
          <Route path="/portal/auth" element={<PortalAuthPage />} />
          <Route element={<RequireUserAuth />}>
            <Route path="/portal" element={<PortalPage />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  )
}

export default App