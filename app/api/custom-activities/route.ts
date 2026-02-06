import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customActivities } from '@/lib/schema';
import { eq, asc } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const childId = searchParams.get('childId');

    if (childId) {
      // Get activities only for the specific child
      const childCustomActivities = await db.select()
        .from(customActivities)
        .where(eq(customActivities.childId, parseInt(childId)))
        .orderBy(asc(customActivities.orderIndex));
      return NextResponse.json(childCustomActivities);
    }

    const allCustomActivities = await db.select().from(customActivities).orderBy(asc(customActivities.orderIndex));
    return NextResponse.json(allCustomActivities);
  } catch (error) {
    console.error('Error fetching custom activities:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { childId, activityId, name, points, category } = body;

    // Validate required fields
    if (!childId || !activityId || !name || points === undefined || !category) {
      return NextResponse.json({ 
        error: 'Campos obrigatórios ausentes: childId, activityId, name, points e category são necessários' 
      }, { status: 400 });
    }

    // Validate data types
    const parsedChildId = parseInt(childId);
    const parsedPoints = parseInt(points);

    if (isNaN(parsedChildId) || isNaN(parsedPoints)) {
      return NextResponse.json({ 
        error: 'Tipos de dados inválidos: childId e points devem ser números' 
      }, { status: 400 });
    }

    // Get the max orderIndex for this child and category
    const existingActivities = await db.select()
      .from(customActivities)
      .where(eq(customActivities.childId, parsedChildId));
    
    const categoryActivities = existingActivities.filter(a => a.category === category);
    const maxOrder = categoryActivities.length > 0 
      ? Math.max(...categoryActivities.map(a => a.orderIndex || 0))
      : -1;

    // Create activity only for the specific child (independent lists)
    const newCustomActivity = await db.insert(customActivities).values({
      childId: parsedChildId,
      activityId: `child${parsedChildId}_${activityId}`,
      name,
      points: parsedPoints,
      category,
      orderIndex: maxOrder + 1,
    }).returning();

    return NextResponse.json(newCustomActivity[0], { status: 201 });
  } catch (error) {
    console.error('Error creating custom activity:', error);
    return NextResponse.json({ 
      error: 'Falha ao criar atividade personalizada',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
