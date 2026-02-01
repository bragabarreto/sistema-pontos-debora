import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import { useState } from "react";
import { ChildSelector } from "./components/ChildSelector";
import Dashboard from "./pages/Dashboard";
import Activities from "./pages/Activities";
import Settings from "./pages/Settings";
import Expenses from "./pages/Expenses";
import CustomActivities from "./pages/CustomActivities";
import Reports from "./pages/Reports";
import Backup from "./pages/Backup";
import { trpc } from "./lib/trpc";

function MainApp() {
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const { data: children = [], isLoading } = trpc.children.list.useQuery();

  // Auto-select first child
  if (!selectedChildId && children.length > 0) {
    setSelectedChildId(children[0].id);
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">🏆 Sistema de Pontuação</h1>
          <p className="text-muted-foreground">Incentivando bons comportamentos!</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : (
          <>
            <ChildSelector
              children={children}
              selectedChildId={selectedChildId}
              onSelectChild={setSelectedChildId}
            />

            <Switch>
              <Route path="/">
                {selectedChildId ? (
                  <Dashboard childId={selectedChildId} />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Adicione uma criança nas Configurações</p>
                  </div>
                )}
              </Route>
              <Route path="/activities">
                {selectedChildId ? (
                  <Activities childId={selectedChildId} />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Adicione uma criança nas Configurações</p>
                  </div>
                )}
              </Route>
              <Route path="/reports">
                {selectedChildId ? (
                  <Reports childId={selectedChildId} />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Adicione uma criança nas Configurações</p>
                  </div>
                )}
              </Route>
              <Route path="/expenses">
                {selectedChildId ? (
                  <Expenses childId={selectedChildId} />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Adicione uma criança nas Configurações</p>
                  </div>
                )}
              </Route>
              <Route path="/custom-activities">
                {selectedChildId ? (
                  <CustomActivities childId={selectedChildId} />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Adicione uma criança nas Configurações</p>
                  </div>
                )}
              </Route>
              <Route path="/settings" component={Settings} />
              <Route path="/backup" component={Backup} />
              <Route path="/404" component={NotFound} />
              <Route component={NotFound} />
            </Switch>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/:rest*" component={MainApp} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
