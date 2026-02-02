import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { calculateDailyBalances, getCurrentBalance, getTodayBalance, type DailyBalance } from "../../../shared/balance-calculator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DashboardNewProps {
  childId: number;
}

export default function DashboardNew({ childId }: DashboardNewProps) {
  const utils = trpc.useUtils();
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [currentWeekday, setCurrentWeekday] = useState("");
  const [dailyBalances, setDailyBalances] = useState<DailyBalance[]>([]);
  const [showChart, setShowChart] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState("");

  const { data: child } = trpc.children.list.useQuery(undefined, {
    select: (children) => children.find((c) => c.id === childId),
  });
  
  const { data: activities = [], isLoading: activitiesLoading } = trpc.activities.list.useQuery(
    { childId },
    { enabled: !!childId }
  );
  
  const { data: expenses = [], isLoading: expensesLoading } = trpc.expenses.list.useQuery(
    { childId },
    { enabled: !!childId }
  );

  const createExpenseMutation = trpc.expenses.create.useMutation({
    onSuccess: () => {
      utils.expenses.list.invalidate();
      utils.children.list.invalidate();
      utils.activities.list.invalidate();
      setShowExpenseModal(false);
      setExpenseDescription("");
      setExpenseAmount("");
      const today = new Date().toISOString().split("T")[0];
      setExpenseDate(today);
      toast.success("Gasto registrado!");
    },
    onError: () => {
      toast.error("Erro ao registrar gasto");
    },
  });

  const deleteExpenseMutation = trpc.expenses.delete.useMutation({
    onSuccess: () => {
      utils.expenses.list.invalidate();
      utils.children.list.invalidate();
      utils.activities.list.invalidate();
      toast.success("Gasto removido!");
    },
  });

  const deleteActivityMutation = trpc.activities.delete.useMutation({
    onSuccess: () => {
      utils.activities.list.invalidate();
      utils.children.list.invalidate();
      utils.expenses.list.invalidate();
      toast.success("Atividade removida!");
    },
  });

  // Update date and time
  useEffect(() => {
    updateCurrentDateTime();
    const interval = setInterval(updateCurrentDateTime, 1000);
    const today = new Date().toISOString().split("T")[0];
    setExpenseDate(today);
    return () => clearInterval(interval);
  }, []);

  // Calculate daily balances when data changes
  useEffect(() => {
    if (child && !activitiesLoading && !expensesLoading) {
      const balances = calculateDailyBalances(
        activities,
        expenses,
        child.initialBalance || 0,
        child.startDate ? new Date(child.startDate) : null,
        childId
      );
      setDailyBalances(balances);
    }
  }, [child, activities, expenses, activitiesLoading, expensesLoading, childId]);

  const updateCurrentDateTime = () => {
    const now = new Date();
    const fortalezaTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Fortaleza" }));
    
    const weekdays = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    const day = String(fortalezaTime.getDate()).padStart(2, "0");
    const month = String(fortalezaTime.getMonth() + 1).padStart(2, "0");
    const year = fortalezaTime.getFullYear();
    const hours = String(fortalezaTime.getHours()).padStart(2, "0");
    const minutes = String(fortalezaTime.getMinutes()).padStart(2, "0");
    const seconds = String(fortalezaTime.getSeconds()).padStart(2, "0");
    
    setCurrentWeekday(weekdays[fortalezaTime.getDay()]);
    setCurrentDate(`${day}/${month}/${year}`);
    setCurrentTime(`${hours}:${minutes}:${seconds}`);
  };

  const handleAddExpense = () => {
    if (!expenseDescription || !expenseAmount || !expenseDate) {
      toast.error("Preencha todos os campos");
      return;
    }

    const amount = parseInt(expenseAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("O valor deve ser um número positivo");
      return;
    }

    createExpenseMutation.mutate({
      childId,
      description: expenseDescription,
      amount,
      date: new Date(expenseDate),
    });
  };

  if (!child) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Selecione uma criança</p>
      </div>
    );
  }

  const todayBalance = getTodayBalance(dailyBalances);
  const initialBalance = todayBalance?.initialBalance || child.initialBalance || 0;
  const positivePointsToday = todayBalance?.positivePoints || 0;
  const negativePointsToday = todayBalance?.negativePoints || 0;
  const expensesToday = todayBalance?.expenses || 0;
  const currentBalance = getCurrentBalance(dailyBalances);

  const loading = activitiesLoading || expensesLoading;

  return (
    <div className="space-y-6">
      {/* Header com data e hora */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-2">📊 Dashboard - {child.name}</h2>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <p className="text-lg">
              <span className="font-semibold">{currentWeekday}</span> - {currentDate}
            </p>
            <p className="text-sm opacity-90">
              ℹ️ As atribuições imediatas são referentes ao dia em curso.
            </p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2 backdrop-blur-sm">
            <p className="text-xs opacity-90 mb-1">🕐 Horário de Fortaleza - CE</p>
            <p className="text-3xl font-bold font-mono tracking-wider">{currentTime}</p>
          </div>
        </div>
      </div>

      {/* 5 Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Saldo Inicial do Dia */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Saldo Inicial do Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{initialBalance}</p>
          </CardContent>
        </Card>

        {/* Card 2: Pontos Positivos Hoje */}
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Pontos Positivos Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">+{positivePointsToday}</p>
          </CardContent>
        </Card>

        {/* Card 3: Pontos Negativos Hoje */}
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Pontos Negativos Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">-{negativePointsToday}</p>
          </CardContent>
        </Card>

        {/* Card 4: Gastos do Dia */}
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Gastos do Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">-{expensesToday}</p>
          </CardContent>
        </Card>

        {/* Card 5: Saldo Atual */}
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Saldo Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{currentBalance}</p>
          </CardContent>
        </Card>
      </div>

      {/* Atividades Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : activities.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma atividade registrada ainda.</p>
          ) : (
            <div className="space-y-2">
              {activities.slice(0, 10).map((activity) => {
                const finalPoints = activity.points * activity.multiplier;
                return (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-semibold">{activity.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(activity.date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div>
                        <p
                          className={`font-bold ${
                            finalPoints > 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {finalPoints > 0 ? "+" : ""}
                          {finalPoints}
                        </p>
                        <p className="text-xs text-muted-foreground">{activity.category}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteActivityMutation.mutate({ id: activity.id })}
                        disabled={deleteActivityMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gastos */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>💰 Gastos</CardTitle>
            <Button onClick={() => setShowExpenseModal(true)}>+ Adicionar Gasto</Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : expenses.length === 0 ? (
            <p className="text-muted-foreground">Nenhum gasto registrado ainda.</p>
          ) : (
            <div className="space-y-2">
              {expenses.slice(0, 10).map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-semibold">{expense.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(expense.date), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-orange-600">-{expense.amount}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteExpenseMutation.mutate({ id: expense.id })}
                      disabled={deleteExpenseMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Gasto */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <CardHeader>
              <CardTitle>Adicionar Gasto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="expDescription">Descrição</Label>
                <Input
                  id="expDescription"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  placeholder="Ex: Sorvete, Brinquedo, etc."
                />
              </div>
              <div>
                <Label htmlFor="expAmount">Valor (pontos)</Label>
                <Input
                  id="expAmount"
                  type="number"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder="Ex: 10"
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="expDate">Data</Label>
                <Input
                  id="expDate"
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddExpense} className="flex-1">
                  Salvar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowExpenseModal(false);
                    setExpenseDescription("");
                    setExpenseAmount("");
                    const today = new Date().toISOString().split("T")[0];
                    setExpenseDate(today);
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Histórico Diário */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>📊 Histórico Diário de Pontos</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={!showChart ? "default" : "outline"}
                onClick={() => setShowChart(false)}
              >
                📋 Tabela
              </Button>
              <Button
                variant={showChart ? "default" : "outline"}
                onClick={() => setShowChart(true)}
              >
                📈 Gráfico
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!showChart ? (
            /* Tabela */
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="border px-4 py-2 text-left">Data</th>
                    <th className="border px-4 py-2 text-right">Saldo Inicial</th>
                    <th className="border px-4 py-2 text-right">Pontos +</th>
                    <th className="border px-4 py-2 text-right">Pontos -</th>
                    <th className="border px-4 py-2 text-right">Gastos</th>
                    <th className="border px-4 py-2 text-right">Balanço do Dia</th>
                    <th className="border px-4 py-2 text-right">Saldo Final</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyBalances.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="border px-4 py-2 text-center text-muted-foreground">
                        Nenhum histórico disponível
                      </td>
                    </tr>
                  ) : (
                    dailyBalances
                      .slice()
                      .reverse()
                      .map((balance, index) => {
                        const isToday = index === 0;
                        const dailyChange =
                          balance.positivePoints - balance.negativePoints - balance.expenses;
                        return (
                          <tr
                            key={balance.dateString}
                            className={isToday ? "bg-blue-50 font-semibold" : ""}
                          >
                            <td className="border px-4 py-2">
                              {balance.dateString}
                              {isToday && (
                                <span className="ml-2 text-blue-600 text-xs">(Hoje)</span>
                              )}
                            </td>
                            <td className="border px-4 py-2 text-right">
                              {balance.initialBalance}
                            </td>
                            <td className="border px-4 py-2 text-right text-green-600">
                              {balance.positivePoints > 0 ? `+${balance.positivePoints}` : "0"}
                            </td>
                            <td className="border px-4 py-2 text-right text-red-600">
                              {balance.negativePoints > 0 ? `-${balance.negativePoints}` : "0"}
                            </td>
                            <td className="border px-4 py-2 text-right text-orange-600">
                              {balance.expenses > 0 ? `-${balance.expenses}` : "0"}
                            </td>
                            <td
                              className={`border px-4 py-2 text-right font-semibold ${
                                dailyChange > 0
                                  ? "text-green-600"
                                  : dailyChange < 0
                                  ? "text-red-600"
                                  : "text-gray-600"
                              }`}
                            >
                              {dailyChange > 0 ? "+" : ""}
                              {dailyChange}
                            </td>
                            <td className="border px-4 py-2 text-right font-bold">
                              {balance.finalBalance}
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Gráfico Simples */
            <div className="bg-muted p-4 rounded-lg">
              <div className="relative" style={{ height: "400px" }}>
                {dailyBalances.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Nenhum dado disponível para exibir
                  </div>
                ) : (
                  <div className="h-full flex flex-col">
                    <div className="mb-2 text-sm text-muted-foreground">
                      Evolução do Saldo ao Longo do Tempo
                    </div>
                    <div className="flex-1 flex items-end justify-between gap-1 border-b-2 border-l-2 border-gray-400 pb-2 pl-2">
                      {dailyBalances.map((balance) => {
                        const maxBalance = Math.max(
                          ...dailyBalances.map((b) => b.finalBalance),
                          child.initialBalance || 0
                        );
                        const minBalance = Math.min(
                          ...dailyBalances.map((b) => b.finalBalance),
                          0
                        );
                        const range = maxBalance - minBalance || 1;
                        const height = ((balance.finalBalance - minBalance) / range) * 100;

                        return (
                          <div
                            key={balance.dateString}
                            className="flex-1 flex flex-col items-center"
                            title={`${balance.dateString}: ${balance.finalBalance}`}
                          >
                            <div
                              className={`w-full rounded-t ${
                                balance.finalBalance >= (child.initialBalance || 0)
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}
                              style={{ height: `${Math.max(height, 5)}%` }}
                            />
                            <div className="text-xs mt-1 transform -rotate-45 origin-top-left whitespace-nowrap">
                              {balance.dateString.substring(0, 5)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
