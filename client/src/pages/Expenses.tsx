import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";

interface ExpensesProps {
  childId: number;
}

export default function Expenses({ childId }: ExpensesProps) {
  const utils = trpc.useUtils();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date>(new Date());

  const { data: expenses = [] } = trpc.expenses.list.useQuery(
    { childId },
    { enabled: !!childId }
  );

  const createExpenseMutation = trpc.expenses.create.useMutation({
    onSuccess: () => {
      utils.expenses.list.invalidate();
      utils.children.list.invalidate();
      setDescription("");
      setAmount("");
      setDate(new Date());
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
      toast.success("Gasto removido!");
    },
  });

  const handleCreateExpense = () => {
    if (!description || !amount) {
      toast.error("Preencha todos os campos");
      return;
    }
    createExpenseMutation.mutate({
      childId,
      description,
      amount: parseInt(amount),
      date,
    });
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  if (!childId) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Selecione uma criança para gerenciar gastos</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <Card>
        <CardHeader>
          <CardTitle>Total de Pontos Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-red-600">{totalExpenses}</div>
        </CardContent>
      </Card>

      {/* Registrar novo gasto */}
      <Card>
        <CardHeader>
          <CardTitle>Registrar Novo Gasto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Brinquedo, Doce, etc."
            />
          </div>
          <div>
            <Label htmlFor="amount">Quantidade de Pontos</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <Label>Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, "dd/MM/yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button onClick={handleCreateExpense} disabled={createExpenseMutation.isPending}>
            Registrar Gasto
          </Button>
        </CardContent>
      </Card>

      {/* Histórico de gastos */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhum gasto registrado</p>
          ) : (
            <div className="space-y-2">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">{expense.description}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(expense.date), "dd/MM/yyyy")}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold text-red-600">-{expense.amount}</div>
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
    </div>
  );
}
