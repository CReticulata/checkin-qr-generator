import { getSession } from "@/src/lib/auth";
import { isAdmin } from "@/src/lib/admin";
import { getParticipantCount, hasParticipantsFile } from "@/src/lib/csvLoader";
import AdminUploadForm from "./AdminUploadForm";
import SampleCsvDownload from "./SampleCsvDownload";
import AdminLoginButton from "./AdminLoginButton";
import EventSettingsForm from "./EventSettingsForm";

export default async function AdminPage() {
  const session = await getSession();

  // Show login page if not authenticated
  if (!session?.user?.email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">管理員登入</h1>
          <p className="text-gray-600 mb-6">
            請使用管理員帳號登入以上傳參與者資料
          </p>
          <div className="flex justify-center">
            <AdminLoginButton />
          </div>
          <p className="text-xs text-gray-400 mt-6">僅限已授權的管理員使用</p>
        </div>
      </div>
    );
  }

  const userEmail = session.user.email;
  const isUserAdmin = isAdmin(userEmail);

  if (!isUserAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">⛔</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">無權限存取</h1>
          <p className="text-gray-600 mb-6">
            您沒有權限存取此頁面。此頁面僅限管理員使用。
          </p>
          <p className="text-sm text-gray-500 mb-6">登入帳號：{userEmail}</p>
          <a
            href="/api/auth/signout"
            className="inline-block bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            登出並使用其他帳號
          </a>
        </div>
      </div>
    );
  }

  const hasFile = await hasParticipantsFile();
  const participantCount = hasFile ? await getParticipantCount() : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            管理員控制台
          </h1>
          <p className="text-sm text-gray-500 mb-6">登入帳號：{userEmail}</p>

          {/* Current Status */}
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-gray-700 mb-2">目前狀態</h2>
            {hasFile ? (
              <p className="text-green-600">
                ✓ 已載入 {participantCount} 筆參與者資料
              </p>
            ) : (
              <p className="text-orange-600">⚠ 尚未上傳參與者 CSV 檔案</p>
            )}
          </div>

          {/* Event Settings */}
          <div className="mb-8 border-b pb-8">
            <EventSettingsForm />
          </div>

          {/* Upload Form */}
          <AdminUploadForm />

          {/* CSV Format Instructions */}
          <div className="mt-8 border-t pt-6">
            <h2 className="font-semibold text-gray-700 mb-3">CSV 格式說明</h2>
            <div className="bg-blue-50 rounded-lg p-4 text-sm">
              <p className="mb-2">CSV 檔案必須符合以下格式：</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>第一列為標題列（會被跳過）</li>
                <li>
                  <strong>第 2 欄（索引 1）</strong>：票券編號
                </li>
                <li>
                  <strong>第 5 欄（索引 4）</strong>：電子郵件
                </li>
                <li>每列至少需要 5 個欄位</li>
              </ul>
              <div className="mt-3 bg-white rounded p-2 font-mono text-xs overflow-x-auto">
                Registration ID,Ticket Number,Name,Phone,Email,Date
                <br />
                REG001,TKT-12345,王小明,0912345678,wang@example.com,2024-01-15
              </div>
            </div>
          </div>

          {/* Sample CSV Download */}
          <div className="mt-4">
            <SampleCsvDownload />
          </div>

          {/* Logout */}
          <div className="mt-8 pt-6 border-t">
            <a
              href="/api/auth/signout"
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              登出
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
