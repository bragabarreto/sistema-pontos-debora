/**
 * Default activities for the points system
 * These are the base activities that come with the system
 */

export interface DefaultActivity {
  id: string;
  name: string;
  points: number;
  category: 'positivos' | 'especiais' | 'negativos' | 'graves';
}

export const DEFAULT_ACTIVITIES: DefaultActivity[] = [
  // Atividades Positivas (Multiplicador: 1x)
  { id: 'pos-1', name: 'Chegar cedo na escola', points: 1, category: 'positivos' },
  { id: 'pos-2', name: 'Chegar bem cedo na escola', points: 2, category: 'positivos' },
  { id: 'pos-3', name: 'Fazer a tarefa sozinho', points: 2, category: 'positivos' },
  { id: 'pos-4', name: 'Ajudar o irmão a fazer a tarefa', points: 2, category: 'positivos' },
  { id: 'pos-5', name: 'Comer toda a refeição', points: 1, category: 'positivos' },
  { id: 'pos-6', name: 'Comer frutas ou verduras', points: 1, category: 'positivos' },
  { id: 'pos-7', name: 'Dormir cedo', points: 1, category: 'positivos' },
  { id: 'pos-8', name: 'Limpeza e saúde', points: 1, category: 'positivos' },
  { id: 'pos-9', name: 'Organização', points: 1, category: 'positivos' },

  // Atividades Especiais (Multiplicador: 50x)
  { id: 'esp-1', name: 'Ler um livro', points: 1, category: 'especiais' },
  { id: 'esp-2', name: 'Tirar nota 10', points: 1, category: 'especiais' },
  { id: 'esp-3', name: 'Viagem - "se virar"', points: 1, category: 'especiais' },
  { id: 'esp-4', name: 'Comida especial', points: 1, category: 'especiais' },
  { id: 'esp-5', name: 'Coragem', points: 1, category: 'especiais' },
  { id: 'esp-6', name: 'Ações especiais', points: 1, category: 'especiais' },

  // Atividades Negativas (Multiplicador: 1x)
  { id: 'neg-1', name: 'Chegar atrasado na escola', points: -1, category: 'negativos' },
  { id: 'neg-2', name: 'Não fazer a tarefa', points: -2, category: 'negativos' },
  { id: 'neg-3', name: 'Não comer toda a refeição', points: -1, category: 'negativos' },
  { id: 'neg-4', name: 'Brigar com o irmão', points: -1, category: 'negativos' },
  { id: 'neg-5', name: 'Dar trabalho para dormir', points: -1, category: 'negativos' },
  { id: 'neg-6', name: 'Desobedecer os adultos', points: -2, category: 'negativos' },
  { id: 'neg-7', name: 'Falar bobeira', points: -1, category: 'negativos' },
  { id: 'neg-8', name: 'Gritar', points: -1, category: 'negativos' },

  // Atividades Graves (Multiplicador: 100x)
  { id: 'gra-1', name: 'Bater no irmão', points: -1, category: 'graves' },
  { id: 'gra-2', name: 'Falar palavrão', points: -1, category: 'graves' },
  { id: 'gra-3', name: 'Mentir', points: -2, category: 'graves' },
];

export const DEFAULT_MULTIPLIERS = {
  positivos: 1,
  especiais: 50,
  negativos: 1,
  graves: 100,
};

export const CATEGORY_NAMES = {
  positivos: 'Atividades Positivas',
  especiais: 'Atividades Especiais',
  negativos: 'Atividades Negativas',
  graves: 'Atividades Graves',
};

export const CATEGORY_COLORS = {
  positivos: 'bg-green-100 text-green-800 border-green-300',
  especiais: 'bg-blue-100 text-blue-800 border-blue-300',
  negativos: 'bg-orange-100 text-orange-800 border-orange-300',
  graves: 'bg-red-100 text-red-800 border-red-300',
};
