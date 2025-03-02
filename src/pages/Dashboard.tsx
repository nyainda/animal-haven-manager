
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { Dog, Cat, Bird, Plus, FileText, Home, User, LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Dashboard: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const animalData = [
    { name: 'Dogs', value: 5, color: '#10B981' },
    { name: 'Cats', value: 7, color: '#3B82F6' },
    { name: 'Birds', value: 3, color: '#F59E0B' },
    { name: 'Others', value: 2, color: '#8B5CF6' },
  ];

  const COLORS = animalData.map(item => item.color);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null; // Or a loading spinner
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground shadow-md">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-primary">Animal Haven</h2>
        </div>
        <nav className="mt-6">
          <div className="px-4 py-2 bg-sidebar-accent border-l-4 border-primary">
            <div className="flex items-center">
              <Home className="h-5 w-5 text-primary" />
              <span className="mx-4 font-medium text-primary">Dashboard</span>
            </div>
          </div>
          <div className="px-4 py-2 hover:bg-sidebar-accent cursor-pointer">
            <div className="flex items-center">
              <Dog className="h-5 w-5 text-sidebar-foreground" />
              <span className="mx-4 font-medium">Animals</span>
            </div>
          </div>
          <div className="px-4 py-2 hover:bg-sidebar-accent cursor-pointer">
            <div className="flex items-center">
              <Plus className="h-5 w-5 text-sidebar-foreground" />
              <span className="mx-4 font-medium">Add Animal</span>
            </div>
          </div>
          <div className="px-4 py-2 hover:bg-sidebar-accent cursor-pointer">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-sidebar-foreground" />
              <span className="mx-4 font-medium">Health Reports</span>
            </div>
          </div>
          <div className="px-4 py-2 hover:bg-sidebar-accent cursor-pointer" onClick={() => navigate('/profile')}>
            <div className="flex items-center">
              <User className="h-5 w-5 text-sidebar-foreground" />
              <span className="mx-4 font-medium">Profile</span>
            </div>
          </div>
          <div className="px-4 py-2 hover:bg-sidebar-accent cursor-pointer" onClick={handleLogout}>
            <div className="flex items-center">
              <LogOut className="h-5 w-5 text-sidebar-foreground" />
              <span className="mx-4 font-medium">Logout</span>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        {/* Header */}
        <header className="bg-card shadow-sm">
          <div className="px-8 py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold">Hi, {user?.name || 'User'}!</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full hover:bg-secondary"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
              <input
                type="text"
                placeholder="Search animals..."
                className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="p-6 hover:shadow-md transition-all duration-200">
              <h3 className="font-medium text-muted-foreground">Total Animals</h3>
              <p className="text-3xl font-bold mt-2">17</p>
              <p className="text-green-500 mt-2 text-sm">+2 this month</p>
            </Card>
            <Card className="p-6 hover:shadow-md transition-all duration-200">
              <h3 className="font-medium text-muted-foreground">Species</h3>
              <p className="text-3xl font-bold mt-2">4</p>
              <div className="flex mt-2 space-x-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Dogs</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Cats</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Birds</span>
              </div>
            </Card>
            <Card className="p-6 hover:shadow-md transition-all duration-200">
              <h3 className="font-medium text-muted-foreground">Health Alerts</h3>
              <p className="text-3xl font-bold mt-2 text-amber-500">2</p>
              <p className="text-amber-500 mt-2 text-sm">2 animals need checkups</p>
            </Card>
          </div>

          {/* Charts and Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Species Breakdown</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={animalData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {animalData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Recent Animals</h2>
                <Button variant="outline" size="sm">View All</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Species</th>
                      <th className="px-4 py-2 text-left">Age</th>
                      <th className="px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-muted">
                      <td className="px-4 py-3">Luna</td>
                      <td className="px-4 py-3 flex items-center">
                        <Cat className="h-4 w-4 mr-2" />
                        Cat
                      </td>
                      <td className="px-4 py-3">2 years</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Healthy</span>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-muted">
                      <td className="px-4 py-3">Max</td>
                      <td className="px-4 py-3 flex items-center">
                        <Dog className="h-4 w-4 mr-2" />
                        Dog
                      </td>
                      <td className="px-4 py-3">3 years</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs">Checkup Needed</span>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-muted">
                      <td className="px-4 py-3">Tweetie</td>
                      <td className="px-4 py-3 flex items-center">
                        <Bird className="h-4 w-4 mr-2" />
                        Bird
                      </td>
                      <td className="px-4 py-3">1 year</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Healthy</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
