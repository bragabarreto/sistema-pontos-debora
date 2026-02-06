import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { children, customActivities, activities, settings } from '@/lib/schema';
import { eq } from 'drizzle-orm';

/**
 * Import data from backup file
 * Supports both old format (luiza/miguel) and new format (children array)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Support both old format and new format
    let childrenToImport: any[] = [];
    
    // New format: children array
    if (body.children && Array.isArray(body.children)) {
      childrenToImport = body.children;
    }
    
    // Old format: luiza/miguel objects (for backwards compatibility)
    if (body.luiza) {
      childrenToImport.push({ name: body.luiza.name || 'Criança 1', ...body.luiza });
    }
    if (body.miguel) {
      childrenToImport.push({ name: body.miguel.name || 'Criança 2', ...body.miguel });
    }

    const multipliers = body.multipliers || body.settings?.find((s: any) => s.key === 'multipliers')?.value;

    // Get existing children to update them
    const existingChildren = await db.select().from(children);
    
    // Create or update children
    const childrenData = [];
    
    for (let i = 0; i < childrenToImport.length; i++) {
      const childInfo = childrenToImport[i];
      let childRecord;
      
      // Try to match with existing child by position or name
      const existingChild = existingChildren[i] || 
        existingChildren.find(c => c.name.toLowerCase() === childInfo.name?.toLowerCase());
      
      if (existingChild) {
        const [updated] = await db.update(children)
          .set({
            name: childInfo.name || existingChild.name,
            initialBalance: childInfo.initialBalance ?? childInfo.initial_balance ?? existingChild.initialBalance,
            totalPoints: childInfo.totalPoints ?? childInfo.total_points ?? existingChild.totalPoints,
            startDate: childInfo.startDate || childInfo.start_date ? new Date(childInfo.startDate || childInfo.start_date) : existingChild.startDate,
            updatedAt: new Date(),
          })
          .where(eq(children.id, existingChild.id))
          .returning();
        childRecord = updated;
      } else {
        const [created] = await db.insert(children).values({
          name: childInfo.name || `Criança ${i + 1}`,
          initialBalance: childInfo.initialBalance ?? childInfo.initial_balance ?? 0,
          totalPoints: childInfo.totalPoints ?? childInfo.total_points ?? 0,
          startDate: childInfo.startDate || childInfo.start_date ? new Date(childInfo.startDate || childInfo.start_date) : null,
        }).returning();
        childRecord = created;
      }
      
      childrenData.push({ 
        name: childRecord.name, 
        data: childInfo, 
        dbId: childRecord.id 
      });
    }

    // Import custom activities
    let customActivitiesCount = 0;
    
    // From new format (customActivities array in body)
    if (body.customActivities && Array.isArray(body.customActivities)) {
      for (const activity of body.customActivities) {
        try {
          // Find matching child
          const matchingChild = childrenData.find(c => c.dbId === activity.childId || c.dbId === activity.child_id);
          if (matchingChild) {
            await db.insert(customActivities).values({
              childId: matchingChild.dbId,
              activityId: activity.activityId || activity.activity_id || `imported_${Date.now()}_${Math.random()}`,
              name: activity.name,
              points: activity.points,
              category: activity.category,
              orderIndex: activity.orderIndex ?? activity.order_index ?? 0,
            });
            customActivitiesCount++;
          }
        } catch (e) {
          console.log('Skipping duplicate custom activity');
        }
      }
    }
    
    // From old format (customActivities inside child data)
    for (const childData of childrenData) {
      const childInfo = childData.data;
      if (childInfo.customActivities && typeof childInfo.customActivities === 'object') {
        for (const [category, items] of Object.entries(childInfo.customActivities)) {
          const itemsArray = items as any[];
          for (const item of itemsArray) {
            try {
              await db.insert(customActivities).values({
                childId: childData.dbId,
                activityId: item.id || `${childData.name.toLowerCase().replace(/\s+/g, '_')}-${Date.now()}-${Math.random()}`,
                name: item.name,
                points: item.points,
                category,
              });
              customActivitiesCount++;
            } catch (e) {
              console.log('Skipping duplicate custom activity');
            }
          }
        }
      }
    }

    // Import activity history
    let activitiesCount = 0;
    
    // From new format (activities array in body)
    if (body.activities && Array.isArray(body.activities)) {
      for (const activity of body.activities) {
        try {
          const matchingChild = childrenData.find(c => c.dbId === activity.childId || c.dbId === activity.child_id);
          if (matchingChild) {
            await db.insert(activities).values({
              childId: matchingChild.dbId,
              name: activity.name,
              points: activity.points,
              category: activity.category || 'positivos',
              multiplier: activity.multiplier || 1,
              date: activity.date ? new Date(activity.date) : new Date(),
            });
            activitiesCount++;
          }
        } catch (e) {
          console.error('Error importing activity:', e);
        }
      }
    }
    
    // From old format (activities inside child data)
    for (const childData of childrenData) {
      const childInfo = childData.data;
      if (childInfo.activities && Array.isArray(childInfo.activities)) {
        for (const activity of childInfo.activities) {
          try {
            await db.insert(activities).values({
              childId: childData.dbId,
              name: activity.name,
              points: activity.points,
              category: activity.category || 'positivos',
              multiplier: activity.multiplier || 1,
              date: activity.date ? new Date(activity.date) : new Date(),
            });
            activitiesCount++;
          } catch (e) {
            console.error('Error importing activity:', e);
          }
        }
      }
    }

    // Import multipliers
    if (multipliers) {
      const existingSettings = await db.select().from(settings).where(eq(settings.key, 'multipliers'));
      
      if (existingSettings.length > 0) {
        await db.update(settings)
          .set({
            value: multipliers,
            updatedAt: new Date(),
          })
          .where(eq(settings.key, 'multipliers'));
      } else {
        await db.insert(settings).values({
          key: 'multipliers',
          value: multipliers,
        });
      }
    }

    return NextResponse.json({
      message: 'Dados importados com sucesso',
      children: childrenData.length,
      customActivities: customActivitiesCount,
      activities: activitiesCount,
      multipliersImported: !!multipliers,
    });
  } catch (error) {
    console.error('Error importing data:', error);
    return NextResponse.json({ 
      error: 'Falha ao importar dados', 
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
