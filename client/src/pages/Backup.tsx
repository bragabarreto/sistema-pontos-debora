import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Download, Upload } from "lucide-react";

export default function Backup() {
  const utils = trpc.useUtils();
  const [importFile, setImportFile] = useState<File | null>(null);

  const { data: children = [] } = trpc.children.list.useQuery();
  const { data: parentData } = trpc.parentData.get.useQuery();

  // Collect all data for export
  const handleExport = async () => {
    try {
      const allActivities: any[] = [];
      const allCustomActivities: any[] = [];
      const allExpenses: any[] = [];

      // Fetch data for each child
      for (const child of children) {
        const activities = await utils.client.activities.list.query({ childId: child.id });
        const customActivities = await utils.client.customActivities.list.query({ childId: child.id });
        const expenses = await utils.client.expenses.list.query({ childId: child.id });

        allActivities.push(...activities);
        allCustomActivities.push(...customActivities);
        allExpenses.push(...expenses);
      }

      const multipliers = await utils.client.settings.get.query({ key: "multipliers" });

      const backupData = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        parentData,
        children,
        activities: allActivities,
        customActivities: allCustomActivities,
        expenses: allExpenses,
        settings: {
          multipliers,
        },
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-pontos-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Backup exportado com sucesso!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Erro ao exportar dados");
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error("Selecione um arquivo para importar");
      return;
    }

    try {
      const text = await importFile.text();
      const backupData = JSON.parse(text);

      // Validate backup structure
      if (!backupData.version || !backupData.children) {
        toast.error("Arquivo de backup inválido");
        return;
      }

      toast.info("Importação em desenvolvimento. Esta funcionalidade será implementada em breve.");
      
      // TODO: Implement import logic
      // This would require creating new procedures to bulk insert data
      // while maintaining data integrity and avoiding duplicates

    } catch (error) {
      console.error("Import error:", error);
      toast.error("Erro ao importar dados");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Exportar Dados</CardTitle>
          <p className="text-sm text-muted-foreground">
            Baixe todos os seus dados em formato JSON para backup
          </p>
        </CardHeader>
        <CardContent>
          <Button onClick={handleExport} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Exportar Todos os Dados
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Importar Dados</CardTitle>
          <p className="text-sm text-muted-foreground">
            Restaure dados de um backup anterior
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="importFile">Selecione o arquivo de backup</Label>
            <Input
              id="importFile"
              type="file"
              accept=".json"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
            />
          </div>
          <Button onClick={handleImport} disabled={!importFile} className="w-full">
            <Upload className="mr-2 h-4 w-4" />
            Importar Dados
          </Button>
          <p className="text-xs text-muted-foreground">
            ⚠️ Atenção: A importação irá adicionar os dados do backup aos dados existentes.
            Faça um backup antes de importar.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Crianças cadastradas:</span>
            <span className="font-medium">{children.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Responsável:</span>
            <span className="font-medium">{parentData?.name || "Não configurado"}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
