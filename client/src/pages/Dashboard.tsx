import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface DashboardProps {
  childId: number;
}

export default function Dashboard({ childId }: DashboardProps) {
  const utils = trpc.useUtils();
  const { data: child } = trpc.children.list.useQuery(undefined, {
    select: (children) => children.find((c) => c.id === childId),
  });
  const { data: activities = [] } = trpc.activities.list.useQuery(
    { childId, limit: 10 },
    { enabled: !!childId }
  );
  const { data: expenses = [] } = trpc.expenses.list.useQuery(
    { childId },
    { enabled: !!childId }
  );
  const { data: multipliers } = trpc.settings.get.useQuery({ key: "multipliers" });

  const deleteActivityMutation = trpc.activities.delete.useMutation({
    onSuccess: () => {
      utils.activities.list.invalidate();
      utils.children.list.invalidate();
      toast.success("Atividade removida com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao remover atividade");
    },
  });

  if (!child) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Selecione uma criança para ver o dashboard</p>
      </div>
    );
  }

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const pointsEarned = child.totalPoints - child.initialBalance;
  const availablePoints = child.totalPoints - totalExpenses;

  const currentDate = new Date();
  const formattedDate = format(currentDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="space-y-6">
      {/* Header com data */}
      <div className="text-center">
        <h2 className="text-2xl font-bold capitalize">{formattedDate}</h2>
      </div>

      {/* Cards de pontos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saldo Inicial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{child.initialBalance}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pontos Ganhos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{pointsEarned}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Disponível
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{availablePoints}</div>
          </CardContent>
        </Card>
      </div>

      {/* Atividades recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma atividade registrada ainda
            </p>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => {
                const finalPoints = activity.points * activity.multiplier;
                return (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{activity.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(activity.date), "dd/MM/yyyy HH:mm")} • {activity.category}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className={`text-lg font-bold ${
                          finalPoints > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {finalPoints > 0 ? "+" : ""}
                        {finalPoints}
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
    </div>
  );
}
