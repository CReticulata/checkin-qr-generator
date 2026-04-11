import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { parse } from "csv-parse/sync";
import { authOptions } from "../../auth/[...nextauth]/route";
import { isAdmin } from "@/src/lib/admin";
import { supabase } from "@/src/lib/supabase";

interface ParticipantRow {
  email: string;
  ticket_number: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "請先登入" }, { status: 401 });
    }

    if (!isAdmin(session.user.email)) {
      return NextResponse.json({ error: "您沒有管理員權限" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "請選擇檔案" }, { status: 400 });
    }

    if (!file.name.endsWith(".csv")) {
      return NextResponse.json(
        { error: "僅接受 CSV 檔案格式" },
        { status: 400 },
      );
    }

    const fileContent = await file.text();

    if (!fileContent.trim()) {
      return NextResponse.json({ error: "CSV 檔案不可為空" }, { status: 400 });
    }

    let records: string[][];
    try {
      records = parse(fileContent, {
        skip_empty_lines: true,
        relax_column_count: true,
      }) as string[][];
    } catch {
      return NextResponse.json(
        { error: "CSV 格式錯誤：無法解析檔案" },
        { status: 400 },
      );
    }

    if (records.length === 0) {
      return NextResponse.json({ error: "CSV 檔案不可為空" }, { status: 400 });
    }

    const dataRows = records.slice(1);
    const rows: ParticipantRow[] = [];
    const seen = new Set<string>();

    for (const row of dataRows) {
      if (row.length < 5) continue;
      const email = row[4]?.trim().toLowerCase();
      const ticketNumber = row[1]?.trim();
      if (!email || !ticketNumber) continue;
      if (seen.has(email)) {
        console.warn(`[Upload CSV] Duplicate email skipped: ${email}`);
        continue;
      }
      seen.add(email);
      rows.push({ email, ticket_number: ticketNumber });
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "CSV 格式錯誤：欄位數不足或沒有有效的參與者記錄" },
        { status: 400 },
      );
    }

    const { error: deleteError } = await supabase
      .from("participants")
      .delete()
      .neq("email", "");

    if (deleteError) {
      console.error("[Upload CSV] Delete error:", deleteError);
      return NextResponse.json(
        { error: `儲存失敗：${deleteError.message}` },
        { status: 500 },
      );
    }

    const { error: insertError } = await supabase
      .from("participants")
      .insert(rows);

    if (insertError) {
      console.error("[Upload CSV] Insert error:", insertError);
      return NextResponse.json(
        { error: `儲存失敗：${insertError.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `成功上傳 ${rows.length} 筆參與者資料`,
      participantCount: rows.length,
    });
  } catch (error) {
    console.error("[Upload CSV] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "未知錯誤";
    return NextResponse.json(
      { error: `儲存失敗：${errorMessage}` },
      { status: 500 },
    );
  }
}
