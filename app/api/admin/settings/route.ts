import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { isAdmin } from '@/src/lib/admin';
import { getEventSettingsWithSource, saveEventSettings } from '@/src/lib/eventSettings';

/**
 * GET /api/admin/settings
 * Get current event settings with source information
 */
export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '請先登入' },
        { status: 401 }
      );
    }

    // Check admin permission
    if (!isAdmin(session.user.email)) {
      return NextResponse.json(
        { error: '您沒有管理員權限' },
        { status: 403 }
      );
    }

    const settings = await getEventSettingsWithSource();

    return NextResponse.json({
      success: true,
      ...settings,
    });

  } catch (error) {
    console.error('[Admin Settings] GET Error:', error);
    return NextResponse.json(
      { error: '讀取設定失敗' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/settings
 * Update event settings
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '請先登入' },
        { status: 401 }
      );
    }

    // Check admin permission
    if (!isAdmin(session.user.email)) {
      return NextResponse.json(
        { error: '您沒有管理員權限' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { eventId, eventName } = body;

    // Validate eventId (required)
    if (!eventId || typeof eventId !== 'string' || !eventId.trim()) {
      return NextResponse.json(
        { error: 'EVENT_ID 不可為空' },
        { status: 400 }
      );
    }

    // Save settings
    await saveEventSettings(eventId.trim(), eventName?.trim() || '');

    return NextResponse.json({
      success: true,
      message: '設定已儲存',
      eventId: eventId.trim(),
      eventName: eventName?.trim() || '',
    });

  } catch (error) {
    console.error('[Admin Settings] POST Error:', error);
    const errorMessage = error instanceof Error ? error.message : '未知錯誤';
    return NextResponse.json(
      { error: `儲存設定失敗：${errorMessage}` },
      { status: 500 }
    );
  }
}
