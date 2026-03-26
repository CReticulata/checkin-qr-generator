import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { put, list, del } from "@vercel/blob";
import { parse } from "csv-parse/sync";
import { authOptions } from "../../auth/[...nextauth]/route";
import { isAdmin } from "@/src/lib/admin";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "請先登入" }, { status: 401 });
    }

    // Check admin permission
    if (!isAdmin(session.user.email)) {
      return NextResponse.json({ error: "您沒有管理員權限" }, { status: 403 });
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "請選擇檔案" }, { status: 400 });
    }

    // Validate file type
    if (!file.name.endsWith(".csv")) {
      return NextResponse.json(
        { error: "僅接受 CSV 檔案格式" },
        { status: 400 },
      );
    }

    // Read file content
    const fileContent = await file.text();

    if (!fileContent.trim()) {
      return NextResponse.json({ error: "CSV 檔案不可為空" }, { status: 400 });
    }

    // Validate CSV format
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

    // Check column count (need at least 5 columns for email at index 4)
    const dataRows = records.slice(1); // Skip header
    let validCount = 0;

    for (const row of dataRows) {
      if (row.length >= 5) {
        const email = row[4]?.trim();
        const ticketNumber = row[1]?.trim();
        if (email && ticketNumber) {
          validCount++;
        }
      }
    }

    if (validCount === 0) {
      return NextResponse.json(
        { error: "CSV 格式錯誤：欄位數不足或沒有有效的參與者記錄" },
        { status: 400 },
      );
    }

    // Check if Blob token is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("[Upload CSV] BLOB_READ_WRITE_TOKEN is not configured");
      return NextResponse.json(
        { error: "伺服器設定錯誤：未設定 Blob Storage Token" },
        { status: 500 },
      );
    }

    // Delete old participant CSV files first
    const { blobs: existingBlobs } = await list();
    const oldCsvBlobs = existingBlobs.filter(
      (b) =>
        b.pathname.startsWith("participants-") && b.pathname.endsWith(".csv"),
    );
    for (const oldBlob of oldCsvBlobs) {
      await del(oldBlob.url);
    }

    // Upload with timestamped filename to bypass CDN cache
    const timestamp = Date.now();
    const blob = await put(`participants-${timestamp}.csv`, fileContent, {
      access: "private",
      contentType: "text/csv",
      addRandomSuffix: false,
    });

    return NextResponse.json({
      success: true,
      message: `成功上傳 ${validCount} 筆參與者資料`,
      participantCount: validCount,
      url: blob.url,
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
