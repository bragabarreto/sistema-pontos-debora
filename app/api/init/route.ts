import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { children, customActivities, settings } from '@/lib/schema';

const defaultActivities = {
  positivos: [
    { id: 'pos1', name: 'Chegar cedo à escola', points: 1 },
    { id: 'pos2', name: 'Chegar bem cedo à escola', points: 2 },
    { id: 'pos3', name: 'Fazer a tarefa sozinho', points: 5 },
    { id: 'pos4', name: 'Comer frutas e verduras', points: 1 },
    { id: 'pos5', name: 'Dormir cedo', points: 1 },
    { id: 'pos6', name: 'Limpeza', points: 1 },
    { id: 'pos7', name: 'Organização', points: 2 },
    { id: 'pos8', name: 'Fase especial', points: 10 }
  ],
  especiais: [
    { id: 'esp1', name: 'Ler um livro', points: 1 },
    { id: 'esp2', name: 'Tirar nota 10', points: 1 },
    { id: 'esp3', name: 'Se virar na viagem', points: 1 },
    { id: 'esp4', name: 'Sem frescura', points: 1 }
  ],
  negativos: [
    { id: 'neg1', name: 'Chegar atrasado à escola', points: 1 },
    { id: 'neg2', name: 'Não fazer a tarefa', points: 1 },
    { id: 'neg3', name: 'Não comer toda a refeição', points: 1 },
    { id: 'neg4', name: 'Falar bobeira', points: 1 }
  ],
  graves: [
    { id: 'gra1', name: 'Bater no irmão', points: 1 },
    { id: 'gra2', name: 'Falar palavrão', points: 1 },
    { id: 'gra3', name: 'Mentir', points: 1 }
  ]
};

export async function POST() {
  try {
    // Create children
    const [luiza, miguel] = await db.insert(children).values([
      {
        name: 'Luiza',
        initialBalance: 0,
        totalPoints: 0,
        startDate: new Date(),
      },
      {
        name: 'Miguel',
        initialBalance: 0,
        totalPoints: 0,
        startDate: new Date(),
      }
    ]).returning();

    // Create custom activities for both children
    const activitiesToInsert = [];
    
    for (const child of [luiza, miguel]) {
      for (const [category, items] of Object.entries(defaultActivities)) {
        for (const item of items) {
          activitiesToInsert.push({
            childId: child.id,
            activityId: `${child.name.toLowerCase()}-${item.id}`,
            name: item.name,
            points: item.points,
            category,
          });
        }
      }
    }

    await db.insert(customActivities).values(activitiesToInsert);

    // Create default multipliers (same as original system)
    await db.insert(settings).values({
      key: 'multipliers',
      value: {
        positivos: 10,
        especiais: 100,
        negativos: -10,
        graves: -100
      }
    });

    return NextResponse.json({
      message: 'Database initialized successfully',
      children: [luiza, miguel],
      activities: activitiesToInsert.length,
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json({ error: 'Failed to initialize database', details: error }, { status: 500 });
  }
}
