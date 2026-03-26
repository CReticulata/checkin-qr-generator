import { redirect } from "next/navigation";
import { getSession, getEmailFromSession } from "@/src/lib/auth";
import { getTicketNumber } from "@/src/lib/csvLoader";
import { generateQRCode } from "@/src/lib/qrGenerator";
import { getEventName } from "@/src/lib/eventSettings";
import LogoutButton from "./LogoutButton";

export default async function DashboardPage() {
  // Get server-side session
  const session = await getSession();

  // Redirect to login if not authenticated
  if (!session) {
    redirect("/?error=SessionRequired");
  }

  // Extract and normalize email from session
  const email = getEmailFromSession(session);

  if (!email) {
    redirect("/?error=SessionRequired");
  }

  // Look up participant registration
  const ticketNumber = await getTicketNumber(email);

  // Redirect to error page if not registered
  if (!ticketNumber) {
    redirect("/error");
  }

  // Get event name
  const eventName = await getEventName();

  // Generate QR code
  let qrCodeDataUrl: string;
  try {
    qrCodeDataUrl = await generateQRCode(ticketNumber);
  } catch (error) {
    console.error("[Dashboard] Error generating QR code:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">錯誤</h1>
          <p className="text-gray-700">
            無法產生 QR Code，請稍後再試或聯繫客服人員。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-sm text-blue-600 font-medium mb-1">{eventName}</p>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                您的活動 QR Code
              </h1>
              <p className="text-gray-600">
                請在活動入口處出示此 QR Code
              </p>
            </div>
            <LogoutButton />
          </div>

          {/* User Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-blue-800 font-medium">電子郵件</p>
                <p className="text-blue-900">{email}</p>
              </div>
              <div>
                <p className="text-sm text-blue-800 font-medium">票券編號</p>
                <p className="text-blue-900 font-mono">{ticketNumber}</p>
              </div>
            </div>
          </div>

          {/* QR Code Display */}
          <div className="flex flex-col items-center">
            <div className="bg-white p-6 rounded-lg border-4 border-gray-200 shadow-inner mb-4">
              <img
                src={qrCodeDataUrl}
                alt="活動報到 QR Code"
                className="w-64 h-64 md:w-80 md:h-80"
              />
            </div>

            {/* Instructions */}
            <div className="text-center">
              <p className="text-gray-700 mb-2">
                請截圖保存或將此頁面加入書籤
              </p>
              <p className="text-sm text-gray-500">
                此 QR Code 為您專屬的報到憑證
              </p>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            重要事項
          </h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>請提前 15 分鐘抵達活動現場</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>請準備好您的 QR Code 以便掃描</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>如有任何問題，請聯繫活動主辦單位</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>請勿將您的 QR Code 分享給他人</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
