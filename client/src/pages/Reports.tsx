import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CATEGORY_NAMES } from "../../../shared/defaultActivities";

interface ReportsProps {
  childId: number;
}

export default function Reports({ childId }: ReportsProps) {
  const { data: activities = [] } = trpc.activities.list.useQuery(
    { childId },
    { enabled: !!childId }
  );
  const { data: expenses = [] } = trpc.expenses.list.useQuery(
    { childId },
    { enabled: !!childId }
  );

  const stats = useMemo(() => {
    // Estatísticas por categoria
    const byCategory = {
      positivos: 0,
      especiais: 0,
      negativos: 0,
      graves: 0,
    };

    activities.forEach((activity) => {
      const finalPoints = activity.points * activity.multiplier;
      const cat = activity.category as keyof typeof byCategory;
      if (byCategory[cat] !== undefined) {
        byCategory[cat] += finalPoints;
      }
    });

    // Pontos por dia (últimos 30 dias)
    const thirtyDaysAgo = subMonths(new Date(), 1);
    const dailyPoints: Record<string, number> = {};

    activities.forEach((activity) => {
      const activityDate = new Date(activity.date);
      if (activityDate >= thirtyDaysAgo) {
        const dateKey = format(activityDate, "dd/MM");
        const finalPoints = activity.points * activity.multiplier;
        dailyPoints[dateKey] = (dailyPoints[dateKey] || 0) + finalPoints;
      }
    });

    // Total de gastos
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Total de pontos ganhos
    const totalPoints = activities.reduce(
      (sum, act) => sum + act.points * act.multiplier,
      0
    );

    return {
      byCategory,
      dailyPoints,
      totalExpenses,
      totalPoints,
    };
  }, [activities, expenses]);

  if (!childId) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Selecione uma criança para ver relatórios</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo geral */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Atividades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activities.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pontos Totais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.totalPoints}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pontos Gastos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.totalExpenses}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pontos por categoria */}
      <Card>
        <CardHeader>
          <CardTitle>Pontos por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(stats.byCategory).map(([category, points]) => {
              const total = Math.abs(stats.totalPoints) || 1;
              const percentage = Math.abs((points / total) * 100);
              const isPositive = points >= 0;

              return (
                <div key={category}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">
                      {CATEGORY_NAMES[category as keyof typeof CATEGORY_NAMES]}
                    </span>
                    <span className={`font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                      {points > 0 ? "+" : ""}
                      {points}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        isPositive ? "bg-green-500" : "bg-red-500"
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Evolução diária (últimos 30 dias) */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução Diária (Últimos 30 Dias)</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(stats.dailyPoints).length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Sem dados para o período
            </p>
          ) : (
            <div className="space-y-2">
              {Object.entries(stats.dailyPoints)
                .sort((a, b) => {
                  // Sort by date
                  const [dayA, monthA] = a[0].split("/").map(Number);
                  const [dayB, monthB] = b[0].split("/").map(Number);
                  return monthA === monthB ? dayA - dayB : monthA - monthB;
                })
                .map(([date, points]) => (
                  <div key={date} className="flex items-center gap-4">
                    <div className="w-16 text-sm text-muted-foreground">{date}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-8 rounded ${
                            points >= 0 ? "bg-green-500" : "bg-red-500"
                          }`}
                          style={{
                            width: `${Math.min(Math.abs(points) / 10, 100)}%`,
                            minWidth: "20px",
                          }}
                        />
                        <span
                          className={`font-medium ${
                            points >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {points > 0 ? "+" : ""}
                          {points}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Atividades mais frequentes */}
      <Card>
        <CardHeader>
          <CardTitle>Atividades Mais Frequentes</CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Sem atividades registradas</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(
                activities.reduce((acc, act) => {
                  acc[act.name] = (acc[act.name] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              )
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([name, count]) => (
                  <div key={name} className="flex justify-between items-center p-2 bg-muted rounded">
                    <span>{name}</span>
                    <span className="font-bold">{count}x</span>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
