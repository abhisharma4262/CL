import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import WorkbenchPage from "@/pages/WorkbenchPage";
import ApplicationDetailPage from "@/pages/ApplicationDetailPage";

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <Header />
          <div className="page-content">
            <Routes>
              <Route path="/" element={<WorkbenchPage />} />
              <Route path="/application/:id" element={<ApplicationDetailPage />} />
            </Routes>
          </div>
        </div>
      </div>
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  );
}

export default App;
