import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { DEFAULT_ACTIVITIES, CATEGORY_NAMES, CATEGORY_COLORS } from "../../../shared/defaultActivities";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Trash2 } from "lucide-react";

interface ActivitiesProps {
  childId: number;
}

export default function Activities({ childId }: ActivitiesProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const utils = trpc.useUtils();

  const { data: multipliers } = trpc.settings.get.useQuery({ key: "multipliers" });
  const { data: customActivities = [] } = trpc.customActivities.list.useQuery(
    { childId },
    { enabled: !!childId }
  );
  const { data: recentActivities = [] } = trpc.activities.list.useQuery(
    { childId, limit: 20 },
    { enabled: !!childId }
  );

  const createActivityMutation = trpc.activities.create.useMutation({
    onSuccess: () => {
      utils.activities.list.invalidate();
      utils.children.list.invalidate();
      toast.success("Atividade registrada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao registrar atividade");
    },
  });

  const deleteActivityMutation = trpc.activities.delete.useMutation({
    onSuccess: () => {
      utils.activities.list.invalidate();
      utils.children.list.invalidate();
      toast.success("Atividade removida!");
    },
  });

  const defaultMultipliers = {
    positivos: 1,
    especiais: 50,
    negativos: 1,
    graves: 100,
  };

  const activeMultipliers = multipliers || defaultMultipliers;

  // Combinar atividades padrão com personalizadas
  const allActivitiesByCategory = useMemo(() => {
    const combined: Record<string, any[]> = {
      positivos: [],
      especiais: [],
      negativos: [],
      graves: [],
    };

    // Adicionar atividades padrão
    DEFAULT_ACTIVITIES.forEach((act) => {
      combined[act.category].push({ ...act, isDefault: true });
    });

    // Adicionar atividades personalizadas
    customActivities.forEach((act) => {
      combined[act.category].push({
        id: act.activityId,
        name: act.name,
        points: act.points,
        category: act.category,
        isDefault: false,
      });
    });

    return combined;
  }, [customActivities]);

  const handleRegisterActivity = (activity: any) => {
    const multiplier = activeMultipliers[activity.category as keyof typeof activeMultipliers];
    createActivityMutation.mutate({
      childId,
      name: activity.name,
      points: activity.points,
      category: activity.category,
      date: selectedDate,
      multiplier,
    });
  };

  if (!childId) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Selecione uma criança para registrar atividades</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Seletor de data */}
      <Card>
        <CardHeader>
          <CardTitle>Selecionar Data</CardTitle>
        </CardHeader>
        <CardContent>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, "dd/MM/yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <p className="text-sm text-muted-foreground mt-2">
            As atividades serão registradas para: {format(selectedDate, "dd/MM/yyyy")}
          </p>
        </CardContent>
      </Card>

      {/* Atividades por categoria */}
      {Object.entries(allActivitiesByCategory).map(([category, activities]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{CATEGORY_NAMES[category as keyof typeof CATEGORY_NAMES]}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Multiplicador: {activeMultipliers[category as keyof typeof activeMultipliers]}x
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activities.map((activity) => {
                const finalPoints =
                  activity.points * activeMultipliers[category as keyof typeof activeMultipliers];
                return (
                  <Button
                    key={activity.id}
                    variant="outline"
                    className={`h-auto py-4 px-4 justify-between ${CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]}`}
                    onClick={() => handleRegisterActivity(activity)}
                    disabled={createActivityMutation.isPending}
                  >
                    <span className="text-left">{activity.name}</span>
                    <span className="font-bold ml-2">
                      {finalPoints > 0 ? "+" : ""}
                      {finalPoints}
                    </span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Registros recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Registros Recentes (últimos 20)</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivities.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhum registro ainda</p>
          ) : (
            <div className="space-y-2">
              {recentActivities.map((activity) => {
                const finalPoints = activity.points * activity.multiplier;
                return (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{activity.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(activity.date), "dd/MM/yyyy HH:mm")}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className={`font-bold ${
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
