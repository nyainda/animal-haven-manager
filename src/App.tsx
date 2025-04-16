import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/sonner"; // Use sonner only
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import { Analytics } from "@vercel/analytics/react";
import Animals from "./pages/Animals";
import AnimalForm from "./components/AnimalForm";
import { ActivityForm } from './pages/animal/ActivityForm';
import AnimalDetails from "./pages/AnimalDetails";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ActivityManagement } from "./pages/animal/AnimalActivities";
import AnimalBreedings from "./pages/animal/AnimalBreedings";
import AnimalHealth from "./pages/animal/AnimalHealth";
import AnimalNotes from "./pages/animal/AnimalNotes";
import AnimalNoteForm from "./pages/animal/AnimalNoteForm";
import AnimalProductions from "./pages/animal/AnimalProductions";
import AnimalProductionForm from "./pages/animal/AnimalProductionForm";
import AnimalSuppliers from "./pages/animal/AnimalSuppliers";
import AnimalSupplierForm from "./pages/animal/AnimalSupplierForm";
import NoteForm from "./components/forms/NoteForm";
import FeedingForm from "./components/forms/FeedingForm";
import TaskForm from "./components/forms/TaskForm";
import AnimalTasks from './pages/animal/AnimalTasks';
import AnimalTaskForm from './pages/animal/AnimalTaskForm';
import { HealthRecordForm } from "./pages/animal/HealthRecordForm";
import {AnimalTransactions} from "./pages/animal/AnimalTransactions"; 
import Sidebar from './components/dashboard/Sidebar';
import { cn } from './lib/utils';
import TransactionForm from "./pages/animal/TransactionForm"; 

// Wrapper component for ActivityManagement
const ActivityManagementWrapper = () => {
  const { id } = useParams<{ id: string }>();
  if (!id) {
    return <div>Error: Animal ID not found</div>;
  }
  return <ActivityManagement animalId={id} />;
};

// Wrapper component for HealthRecordForm
const HealthRecordFormWrapper = () => {
  const { id } = useParams<{ id: string }>();
  if (!id) {
    return <div>Error: Animal ID not found</div>;
  }
  return <HealthRecordForm animalId={id} />;
};

// Wrapper component for AnimalTransactions
const AnimalTransactionsWrapper = () => {
  const { id } = useParams<{ id: string }>();
  if (!id) {
    return <div>Error: Animal ID not found</div>;
  }
  return <AnimalTransactions animalId={id} />;
};

// Wrapper component for TransactionForm
const TransactionFormWrapper = () => {
  const { id, transactionId } = useParams<{ id: string; transactionId?: string }>();
  if (!id) {
    return <div>Error: Animal ID not found</div>;
  }
 //return <TransactionForm animalId={id} transactionId={transactionId} />;
};

const queryClient = new QueryClient();

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768); // Adjust breakpoint as needed
    };

    handleResize(); // Check initial width
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Analytics />
        <BrowserRouter>
          <ThemeProvider>
            <AuthProvider>
              <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
                {/* Sidebar */}
                {isSidebarOpen && <Sidebar />}

                {/* Main Content */}
                <main
                  className={cn(
                    "flex-1 p-6 transition-all duration-300",
                    isSidebarOpen ? "ml-64" : "ml-0",
                  )}
                >
                  {/* Mobile Sidebar Toggle (Optional) */}
                  <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="md:hidden mb-4 p-2 bg-gray-200 dark:bg-gray-800 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700"
                  >
                    {isSidebarOpen ? "Close" : "Open"} Menu
                  </button>

                  {/* Routes */}
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />

                    {/* Animal Routes */}
                    <Route path="/animals" element={<Animals />} />
                    <Route path="/animals/new" element={<AnimalForm />} />
                    <Route path="/animals/:id" element={<AnimalDetails />} />
                    <Route path="/animals/:id/edit" element={<AnimalForm />} />

                    <Route path="/animals/:id/tasks" element={<AnimalTasks />} />
                    <Route path="/animals/:id/tasks/new" element={<AnimalTaskForm />} />
                    <Route path="/animals/:id/tasks/:taskId/edit" element={<AnimalTaskForm />} />

                    {/* Animal Activities */}
                    <Route path="/animals/:id/activities" element={<ActivityManagementWrapper />} />
                    <Route path="/animals/:animalId/activities/new" element={<ActivityForm />} />
                    <Route path="/animals/:animalId/activities/:activityId/edit" element={<ActivityForm />} />

                    {/* Animal Breedings */}
                    <Route path="/animals/:id/breedings" element={<AnimalBreedings />} />
                    <Route path="/animals/:id/breedings/new" element={<AnimalBreedings />} />
                    <Route path="/animals/:id/breedings/:breedingId" element={<AnimalBreedings />} />
                    <Route path="/animals/:id/breedings/:breedingId/edit" element={<AnimalBreedings />} />

                    {/* Animal Health */}
                    <Route path="/animals/:id/health" element={<AnimalHealth />} />
                    <Route path="/animals/:id/health/new" element={<HealthRecordFormWrapper />} />
                    <Route path="/animals/:id/health/:healthId" element={<AnimalHealth />} />
                    <Route path="/animals/:id/health/:healthId/edit" element={<HealthRecordFormWrapper />} />

                    {/* Animal Notes */}
                    <Route path="/animals/:id/notes" element={<AnimalNotes />} />
                    <Route path="/animals/:id/notes/new" element={<AnimalNoteForm />} />
                    <Route path="/animals/:id/notes/:noteId" element={<AnimalNotes />} />
                    <Route path="/animals/:id/notes/:noteId/edit" element={<AnimalNoteForm />} />

                    {/* Animal Production */}
                    <Route path="/animals/:id/production" element={<AnimalProductions />} />
                    <Route path="/animals/:id/production/new" element={<AnimalProductionForm />} />
                    <Route path="/animals/:id/production/:productionId/edit" element={<AnimalProductionForm />} />

                    {/* Animal Supplier Routes */}
                    <Route path="/animals/:id/suppliers" element={<AnimalSuppliers />} />
                    <Route path="/animals/:id/suppliers/new" element={<AnimalSupplierForm />} />
                    <Route path="/animals/:id/suppliers/:supplierId" element={<AnimalSuppliers />} />
                    <Route path="/animals/:id/suppliers/:supplierId/edit" element={<AnimalSupplierForm />} />

                    {/* Animal Transaction Routes */}
                    <Route path="/animals/:id/transactions" element={<AnimalTransactionsWrapper />} />
                    <Route path="/animals/:id/transactions/new" element={<TransactionForm />} />
                    <Route path="/animals/:id/transactions/:transactionId/edit" element={<TransactionForm />} />

                    {/* Form Routes */}
                    <Route path="/forms/note" element={<NoteForm />} />
                    <Route path="/forms/feeding" element={<FeedingForm />} />
                    <Route path="/forms/task" element={<TaskForm />} />
                    <Route path="/animals/:id/forms/note" element={<NoteForm />} />
                    <Route path="/animals/:id/forms/feeding" element={<FeedingForm />} />
                    <Route path="/animals/:id/forms/task" element={<TaskForm />} />

                    {/* Catch-all Route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </AuthProvider>
          </ThemeProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;