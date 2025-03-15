import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Animals from "./pages/Animals";
import AnimalForm from "./components/AnimalForm";
import AnimalDetails from "./pages/AnimalDetails";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import AnimalActivities from "./pages/animal/AnimalActivities";
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
import TransactionForm from "./components/forms/TransactionForm";
import AnimalTasks from './pages/animal/AnimalTasks';
import AnimalTaskForm from './pages/animal/AnimalTaskForm';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
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
              <Route path="/animals/:id/activities" element={<AnimalActivities />} />
              <Route path="/animals/:id/activities/new" element={<AnimalActivities />} />
              
              {/* Animal Breedings */}
              <Route path="/animals/:id/breedings" element={<AnimalBreedings />} />
              <Route path="/animals/:id/breedings/new" element={<AnimalBreedings />} />
              <Route path="/animals/:id/breedings/:breedingId" element={<AnimalBreedings />} />
              <Route path="/animals/:id/breedings/:breedingId/edit" element={<AnimalBreedings />} />
              
              {/* Animal Health */}
              <Route path="/animals/:id/health" element={<AnimalHealth />} />
              <Route path="/animals/:id/health/new" element={<AnimalHealth />} />
              <Route path="/animals/:id/health/:healthId" element={<AnimalHealth />} />
              <Route path="/animals/:id/health/:healthId/edit" element={<AnimalHealth />} />
              
              {/* Animal Notes */}
              <Route path="/animals/:id/notes" element={<AnimalNotes />} />
              <Route path="/animals/:id/notes/new" element={<AnimalNoteForm />} />
              <Route path="/animals/:id/notes/:noteId" element={<AnimalNotes />} />
              <Route path="/animals/:id/notes/:noteId/edit" element={<AnimalNoteForm />} />
              
              {/* Animal Production */}
              {/* Animal Production */}
              <Route path="/animals/:id/production" element={<AnimalProductions />} />
<Route path="/animals/:id/production/new" element={<AnimalProductionForm />} />
<Route path="/animals/:id/production/:productionId/edit" element={<AnimalProductionForm />} />
              
              {/* Animal Supplier Routes */}
              <Route path="/animals/:id/suppliers" element={<AnimalSuppliers />} />
              <Route path="/animals/:id/suppliers/new" element={<AnimalSupplierForm />} />
              <Route path="/animals/:id/suppliers/:supplierId" element={<AnimalSuppliers />} />
              <Route path="/animals/:id/suppliers/:supplierId/edit" element={<AnimalSupplierForm />} />
              
              {/* New Form Routes */}
              <Route path="/forms/note" element={<NoteForm />} />
              <Route path="/forms/feeding" element={<FeedingForm />} />
              <Route path="/forms/task" element={<TaskForm />} />
              <Route path="/forms/transaction" element={<TransactionForm />} />
              <Route path="/animals/:id/forms/note" element={<NoteForm />} />
              <Route path="/animals/:id/forms/feeding" element={<FeedingForm />} />
              <Route path="/animals/:id/forms/task" element={<TaskForm />} />
              <Route path="/animals/:id/forms/transaction" element={<TransactionForm />} />
              
              {/* Catch-all Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;