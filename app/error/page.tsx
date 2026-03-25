"use client";

import { signOut } from "next-auth/react";

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            找不到報名資料
          </h1>
          <p className="text-gray-700 mb-4">系統中找不到您的報名資訊。</p>
        </div>

        {/* Explanation */}
        <div className="bg-orange-50 border border-orange-200 rounded-md p-4 mb-6">
          <h2 className="font-semibold text-orange-900 mb-2">可能的原因：</h2>
          <ul className="text-sm text-orange-800 space-y-1 list-disc list-inside">
            <li>您使用的 Google 帳號與報名時填寫的電子郵件不同</li>
            <li>您的報名資料尚未處理完成</li>
            <li>報名時的電子郵件地址可能有誤</li>
            <li>您的票券可能已被取消或轉讓</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Try Different Account */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full bg-blue-600 text-white rounded-lg px-6 py-3 font-medium hover:bg-blue-700 transition-colors"
          >
            使用其他帳號登入
          </button>

          {/* Contact Support */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              需要協助？請聯繫 GDG Tainan IG：
            </p>
            <a
              href="https://www.instagram.com/gdg.tainan/"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              gdg.tainan
            </a>
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2 text-sm">
            接下來該怎麼做：
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>1. 檢查您的報名確認信</li>
            <li>2. 確認報名時使用的電子郵件地址</li>
            <li>3. 使用該電子郵件地址重新登入</li>
            <li>4. 如問題持續，請聯繫活動客服</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
