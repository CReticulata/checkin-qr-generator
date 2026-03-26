"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [eventName, setEventName] = useState("活動報到");
  const [isLoadingEventName, setIsLoadingEventName] = useState(true);

  useEffect(() => {
    async function fetchEventName() {
      try {
        const response = await fetch("/api/event");
        const data = await response.json();
        if (data.eventName) {
          setEventName(data.eventName);
        }
      } catch (error) {
        console.error("Failed to fetch event name:", error);
      } finally {
        setIsLoadingEventName(false);
      }
    }
    fetchEventName();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isLoadingEventName ? (
              <span className="inline-block w-48 h-8 bg-gray-200 rounded animate-pulse"></span>
            ) : (
              eventName
            )}
          </h1>
          <p className="text-gray-600">
            生成您的入場 QR Code
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">
              {error === "OAuthSignin" && "連接 Google 時發生錯誤，請重試。"}
              {error === "OAuthCallback" && "驗證過程中發生錯誤，請重試。"}
              {error === "OAuthCreateAccount" && "建立帳號時發生錯誤，請重試。"}
              {error === "EmailCreateAccount" && "建立帳號時發生錯誤，請重試。"}
              {error === "Callback" && "驗證錯誤，請重試。"}
              {error === "OAuthAccountNotLinked" && "此帳號已使用其他憑證註冊。"}
              {error === "EmailSignin" && "請檢查您的電子郵件以取得登入連結。"}
              {error === "CredentialsSignin" && "登入失敗，請檢查您的憑證。"}
              {error === "SessionRequired" && "請登入以存取此頁面。"}
              {!["OAuthSignin", "OAuthCallback", "OAuthCreateAccount", "EmailCreateAccount", "Callback", "OAuthAccountNotLinked", "EmailSignin", "CredentialsSignin", "SessionRequired"].includes(error) && "驗證錯誤，請重試。"}
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h2 className="font-semibold text-blue-900 mb-2">使用說明：</h2>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>點擊下方按鈕使用 Google 登入</li>
            <li>使用您報名時填寫的電子郵件地址</li>
            <li>系統將自動產生您的 QR Code</li>
            <li>在活動入口處出示 QR Code</li>
          </ol>
        </div>

        {/* Login button */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 rounded-lg px-6 py-3 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          使用 Google 登入
        </button>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-500">
          登入即表示您同意使用已註冊的電子郵件地址
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-gray-600">載入中...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
