'use client';

import { useState, useEffect } from 'react';

interface EventSettings {
  eventId: string | null;
  eventIdSource: 'blob' | 'env' | null;
  eventName: string;
  eventNameSource: 'blob' | 'default';
}

export default function EventSettingsForm() {
  const [settings, setSettings] = useState<EventSettings | null>(null);
  const [eventId, setEventId] = useState('');
  const [eventName, setEventName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Fetch current settings on mount
  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch('/api/admin/settings');
        const data = await response.json();

        if (response.ok) {
          setSettings(data);
          setEventId(data.eventId || '');
          setEventName(data.eventName || '');
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!eventId.trim()) {
      setSaveResult({
        success: false,
        message: 'EVENT_ID 不可為空',
      });
      return;
    }

    setIsSaving(true);
    setSaveResult(null);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: eventId.trim(),
          eventName: eventName.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSaveResult({
          success: true,
          message: '設定已儲存',
        });
        // Update settings state to reflect new source
        setSettings({
          eventId: eventId.trim(),
          eventIdSource: 'blob',
          eventName: eventName.trim() || '活動報到',
          eventNameSource: eventName.trim() ? 'blob' : 'default',
        });
      } else {
        setSaveResult({
          success: false,
          message: data.error || '儲存失敗',
        });
      }
    } catch (error) {
      setSaveResult({
        success: false,
        message: '網路錯誤，請稍後再試',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getSourceLabel = (source: string | null): string => {
    switch (source) {
      case 'blob':
        return 'Blob Storage';
      case 'env':
        return '環境變數';
      case 'default':
        return '預設值';
      default:
        return '未設定';
    }
  };

  const getSourceColor = (source: string | null): string => {
    switch (source) {
      case 'blob':
        return 'text-green-600 bg-green-50';
      case 'env':
        return 'text-blue-600 bg-blue-50';
      case 'default':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-orange-600 bg-orange-50';
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-semibold text-gray-700 mb-3">活動設定</h2>

      {/* Current Status */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">EVENT_ID 來源：</span>
            <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${getSourceColor(settings?.eventIdSource || null)}`}>
              {getSourceLabel(settings?.eventIdSource || null)}
            </span>
          </div>
          <div>
            <span className="text-gray-500">活動名稱來源：</span>
            <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${getSourceColor(settings?.eventNameSource || null)}`}>
              {getSourceLabel(settings?.eventNameSource || null)}
            </span>
          </div>
        </div>
      </div>

      {/* Event ID Input */}
      <div className="mb-4">
        <label htmlFor="eventId" className="block text-sm font-medium text-gray-700 mb-1">
          EVENT_ID <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="eventId"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          placeholder="例如：117197"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        <p className="mt-1 text-xs text-gray-500">
          此值會用於 QR Code 格式：EVENT_ID:票券後七碼
        </p>
      </div>

      {/* Event Name Input */}
      <div className="mb-4">
        <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 mb-1">
          活動名稱 <span className="text-gray-400">（選填）</span>
        </label>
        <input
          type="text"
          id="eventName"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          placeholder="例如：2024 年度開發者大會"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        <p className="mt-1 text-xs text-gray-500">
          顯示於登入頁和 Dashboard，未設定時顯示「活動報到」
        </p>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className={`
          w-full py-3 rounded-lg font-medium transition-colors
          ${!isSaving
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        {isSaving ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            儲存中...
          </span>
        ) : (
          '儲存設定'
        )}
      </button>

      {/* Save Result */}
      {saveResult && (
        <div
          className={`
            mt-4 p-4 rounded-lg
            ${saveResult.success
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
            }
          `}
        >
          {saveResult.success ? '✓ ' : '✗ '}
          {saveResult.message}
        </div>
      )}
    </div>
  );
}
