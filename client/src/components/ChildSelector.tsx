import { Button } from "@/components/ui/button";
import type { Child } from "../../../drizzle/schema";

interface ChildSelectorProps {
  children: Child[];
  selectedChildId: number | null;
  onSelectChild: (childId: number) => void;
}

export function ChildSelector({ children, selectedChildId, onSelectChild }: ChildSelectorProps) {
  if (children.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-yellow-800">
          Nenhuma criança cadastrada. Vá para Configurações para adicionar uma criança.
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-3 mb-6 flex-wrap">
      {children.map((child) => (
        <Button
          key={child.id}
          onClick={() => onSelectChild(child.id)}
          variant={selectedChildId === child.id ? "default" : "outline"}
          size="lg"
          className="min-w-[120px]"
        >
          {child.name}
        </Button>
      ))}
    </div>
  );
}
