import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, Edit2, Plus, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import { CATEGORY_NAMES } from "../../../shared/defaultActivities";
import { nanoid } from "nanoid";

interface CustomActivitiesProps {
  childId: number;
}

export default function CustomActivities({ childId }: CustomActivitiesProps) {
  const utils = trpc.useUtils();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [name, setName] = useState("");
  const [points, setPoints] = useState("");
  const [category, setCategory] = useState<string>("positivos");

  const { data: customActivities = [] } = trpc.customActivities.list.useQuery(
    { childId },
    { enabled: !!childId }
  );

  const createMutation = trpc.customActivities.create.useMutation({
    onSuccess: () => {
      utils.customActivities.list.invalidate();
      resetForm();
      toast.success("Atividade criada!");
    },
  });

  const updateMutation = trpc.customActivities.update.useMutation({
    onSuccess: () => {
      utils.customActivities.list.invalidate();
      resetForm();
      toast.success("Atividade atualizada!");
    },
  });

  const deleteMutation = trpc.customActivities.delete.useMutation({
    onSuccess: () => {
      utils.customActivities.list.invalidate();
      toast.success("Atividade removida!");
    },
  });

  const resetForm = () => {
    setName("");
    setPoints("");
    setCategory("positivos");
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!name || !points) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        name,
        points: parseInt(points),
      });
    } else {
      const activitiesInCategory = customActivities.filter((a) => a.category === category);
      const maxOrder = activitiesInCategory.length > 0
        ? Math.max(...activitiesInCategory.map((a) => a.orderIndex))
        : -1;

      createMutation.mutate({
        childId,
        activityId: nanoid(),
        name,
        points: parseInt(points),
        category,
        orderIndex: maxOrder + 1,
      });
    }
  };

  const handleEdit = (activity: any) => {
    setEditingId(activity.id);
    setName(activity.name);
    setPoints(activity.points.toString());
    setCategory(activity.category);
    setIsAdding(true);
  };

  const handleMoveUp = (activity: any) => {
    const sameCategory = customActivities.filter((a) => a.category === activity.category);
    const currentIndex = sameCategory.findIndex((a) => a.id === activity.id);
    
    if (currentIndex > 0) {
      const prevActivity = sameCategory[currentIndex - 1];
      updateMutation.mutate({
        id: activity.id,
        orderIndex: prevActivity.orderIndex,
      });
      updateMutation.mutate({
        id: prevActivity.id,
        orderIndex: activity.orderIndex,
      });
    }
  };

  const handleMoveDown = (activity: any) => {
    const sameCategory = customActivities.filter((a) => a.category === activity.category);
    const currentIndex = sameCategory.findIndex((a) => a.id === activity.id);
    
    if (currentIndex < sameCategory.length - 1) {
      const nextActivity = sameCategory[currentIndex + 1];
      updateMutation.mutate({
        id: activity.id,
        orderIndex: nextActivity.orderIndex,
      });
      updateMutation.mutate({
        id: nextActivity.id,
        orderIndex: activity.orderIndex,
      });
    }
  };

  if (!childId) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Selecione uma criança</p>
      </div>
    );
  }

  const activitiesByCategory = {
    positivos: customActivities.filter((a) => a.category === "positivos"),
    especiais: customActivities.filter((a) => a.category === "especiais"),
    negativos: customActivities.filter((a) => a.category === "negativos"),
    graves: customActivities.filter((a) => a.category === "graves"),
  };

  return (
    <div className="space-y-6">
      {/* Botão adicionar */}
      {!isAdding && (
        <Button onClick={() => setIsAdding(true)} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Nova Atividade
        </Button>
      )}

      {/* Formulário */}
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Editar Atividade" : "Nova Atividade"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nome da Atividade</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Fazer lição de casa"
              />
            </div>
            <div>
              <Label htmlFor="points">Pontos Base</Label>
              <Input
                id="points"
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                placeholder="0"
              />
            </div>
            {!editingId && (
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_NAMES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
                Salvar
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista por categoria */}
      {Object.entries(activitiesByCategory).map(([cat, activities]) => (
        <Card key={cat}>
          <CardHeader>
            <CardTitle>{CATEGORY_NAMES[cat as keyof typeof CATEGORY_NAMES]}</CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Nenhuma atividade personalizada</p>
            ) : (
              <div className="space-y-2">
                {activities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-2 p-3 bg-muted rounded-lg"
                  >
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">{activity.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {activity.points} pontos base
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveUp(activity)}
                        disabled={index === 0 || updateMutation.isPending}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveDown(activity)}
                        disabled={index === activities.length - 1 || updateMutation.isPending}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(activity)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate({ id: activity.id })}
                        disabled={deleteMutation.isPending}
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
      ))}
    </div>
  );
}
