import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { DEFAULT_MULTIPLIERS } from "../../../shared/defaultActivities";

export default function Settings() {
  const utils = trpc.useUtils();
  const { data: children = [] } = trpc.children.list.useQuery();
  const { data: parentData } = trpc.parentData.get.useQuery();
  const { data: multipliers } = trpc.settings.get.useQuery({ key: "multipliers" });

  // Parent data form
  const [parentName, setParentName] = useState("");
  const [parentGender, setParentGender] = useState("");
  const [appStartDate, setAppStartDate] = useState("");

  // Child form
  const [childName, setChildName] = useState("");
  const [initialBalance, setInitialBalance] = useState("0");
  const [childStartDate, setChildStartDate] = useState("");

  // Multipliers form
  const [localMultipliers, setLocalMultipliers] = useState(DEFAULT_MULTIPLIERS);

  useEffect(() => {
    if (parentData) {
      setParentName(parentData.name);
      setParentGender(parentData.gender || "");
      setAppStartDate(parentData.appStartDate ? new Date(parentData.appStartDate).toISOString().split("T")[0] : "");
    }
  }, [parentData]);

  useEffect(() => {
    if (multipliers) {
      setLocalMultipliers(multipliers);
    }
  }, [multipliers]);

  const saveParentMutation = trpc.parentData.upsert.useMutation({
    onSuccess: () => {
      utils.parentData.get.invalidate();
      toast.success("Dados salvos com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao salvar dados");
    },
  });

  const createChildMutation = trpc.children.create.useMutation({
    onSuccess: () => {
      utils.children.list.invalidate();
      setChildName("");
      setInitialBalance("0");
      setChildStartDate("");
      toast.success("Criança adicionada!");
    },
    onError: () => {
      toast.error("Erro ao adicionar criança");
    },
  });

  const deleteChildMutation = trpc.children.delete.useMutation({
    onSuccess: () => {
      utils.children.list.invalidate();
      toast.success("Criança removida!");
    },
  });

  const saveMultipliersMutation = trpc.settings.set.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success("Multiplicadores salvos!");
    },
  });

  const handleSaveParent = () => {
    if (!parentName || !appStartDate) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    saveParentMutation.mutate({
      name: parentName,
      gender: parentGender,
      appStartDate: new Date(appStartDate),
    });
  };

  const handleCreateChild = () => {
    if (!childName) {
      toast.error("Digite o nome da criança");
      return;
    }
    createChildMutation.mutate({
      name: childName,
      initialBalance: parseInt(initialBalance) || 0,
      startDate: childStartDate ? new Date(childStartDate) : undefined,
    });
  };

  const handleSaveMultipliers = () => {
    saveMultipliersMutation.mutate({
      key: "multipliers",
      value: localMultipliers,
    });
  };

  return (
    <div className="space-y-6">
      {/* Dados do Responsável */}
      <Card>
        <CardHeader>
          <CardTitle>Dados do Responsável</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="parentName">Nome do Pai/Mãe *</Label>
            <Input
              id="parentName"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder="Digite seu nome"
            />
          </div>
          <div>
            <Label htmlFor="parentGender">Sexo</Label>
            <Select value={parentGender} onValueChange={setParentGender}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="feminino">Feminino</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="appStartDate">Data de Início do App *</Label>
            <Input
              id="appStartDate"
              type="date"
              value={appStartDate}
              onChange={(e) => setAppStartDate(e.target.value)}
            />
          </div>
          <Button onClick={handleSaveParent} disabled={saveParentMutation.isPending}>
            Salvar Dados
          </Button>
        </CardContent>
      </Card>

      {/* Gerenciar Crianças */}
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Crianças</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Lista de crianças */}
          {children.length > 0 && (
            <div className="space-y-2 mb-4">
              {children.map((child) => (
                <div key={child.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">{child.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Saldo inicial: {child.initialBalance} pontos
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteChildMutation.mutate({ id: child.id })}
                    disabled={deleteChildMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Adicionar nova criança */}
          <div className="border-t pt-4 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Nova Criança
            </h3>
            <div>
              <Label htmlFor="childName">Nome da Criança *</Label>
              <Input
                id="childName"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="Digite o nome"
              />
            </div>
            <div>
              <Label htmlFor="initialBalance">Saldo Inicial (pontos)</Label>
              <Input
                id="initialBalance"
                type="number"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="childStartDate">Data de Início</Label>
              <Input
                id="childStartDate"
                type="date"
                value={childStartDate}
                onChange={(e) => setChildStartDate(e.target.value)}
              />
            </div>
            <Button onClick={handleCreateChild} disabled={createChildMutation.isPending}>
              Adicionar Criança
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Multiplicadores */}
      <Card>
        <CardHeader>
          <CardTitle>Multiplicadores de Pontos</CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure o peso de cada categoria de atividade
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="multPositivos">Atividades Positivas</Label>
            <Input
              id="multPositivos"
              type="number"
              value={localMultipliers.positivos}
              onChange={(e) =>
                setLocalMultipliers({ ...localMultipliers, positivos: parseInt(e.target.value) || 1 })
              }
            />
          </div>
          <div>
            <Label htmlFor="multEspeciais">Atividades Especiais</Label>
            <Input
              id="multEspeciais"
              type="number"
              value={localMultipliers.especiais}
              onChange={(e) =>
                setLocalMultipliers({ ...localMultipliers, especiais: parseInt(e.target.value) || 1 })
              }
            />
          </div>
          <div>
            <Label htmlFor="multNegativos">Atividades Negativas</Label>
            <Input
              id="multNegativos"
              type="number"
              value={localMultipliers.negativos}
              onChange={(e) =>
                setLocalMultipliers({ ...localMultipliers, negativos: parseInt(e.target.value) || 1 })
              }
            />
          </div>
          <div>
            <Label htmlFor="multGraves">Atividades Graves</Label>
            <Input
              id="multGraves"
              type="number"
              value={localMultipliers.graves}
              onChange={(e) =>
                setLocalMultipliers({ ...localMultipliers, graves: parseInt(e.target.value) || 1 })
              }
            />
          </div>
          <Button onClick={handleSaveMultipliers} disabled={saveMultipliersMutation.isPending}>
            Salvar Multiplicadores
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
