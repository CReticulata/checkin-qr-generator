import { NextResponse } from 'next/server';
import { getEventName } from '@/src/lib/eventSettings';

/**
 * GET /api/event
 * Get event name for public display (no authentication required)
 */
export async function GET() {
  try {
    const eventName = await getEventName();

    return NextResponse.json({
      success: true,
      eventName,
    });

  } catch (error) {
    console.error('[Event API] Error:', error);
    // Return default value on error
    return NextResponse.json({
      success: true,
      eventName: '活動報到',
    });
  }
}
