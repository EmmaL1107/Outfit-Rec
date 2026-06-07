import { useState, useEffect } from 'react';
import type { AppSettings } from '../types';
import { settingsDB } from '../store/db';
import { IconCheck, IconLocate, IconLocation } from '../components/Icons';

const AUTO_DETECT_VALUES = ['auto', 'Beijing', ''];

function isAutoCity(city: string): boolean {
  return AUTO_DETECT_VALUES.includes(city);
}

export default function Settings() {
  const [settings, setSettings] = useState<AppSettings>({
    city: 'auto',
    weatherApiKey: '',
  });
  const [saved, setSaved] = useState(false);
  const [autoLocation, setAutoLocation] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const s = await settingsDB.getAllSettings();
    setSettings(s);
    setAutoLocation(isAutoCity(s.city));
  }

  async function handleSave() {
    const cityToSave = autoLocation ? 'auto' : settings.city;
    await settingsDB.set('city', cityToSave);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function toggleAutoLocation() {
    const next = !autoLocation;
    setAutoLocation(next);
    if (next) {
      setSettings((s) => ({ ...s, city: 'auto' }));
    }
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* HEADER */}
      <section className="max-w-lg mx-auto px-5 pt-10 pb-6">
        <div>
          <p className="text-[11px] tracking-[0.3em] text-gray-500 mb-1.5">MY</p>
          <h1 className="text-[28px] font-bold text-black tracking-tight">SETTINGS</h1>
        </div>
        <p className="text-[13px] text-gray-500 mt-1">偏好与设置</p>
      </section>

      {/* WEATHER SETTINGS */}
      <section className="max-w-lg mx-auto px-5">
        <div className="border border-[var(--color-border)] rounded-lg p-5">
          <h2 className="text-[13px] font-semibold text-black mb-5">天气设置</h2>

          <div className="flex items-center justify-between py-3.5 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <IconLocate size={18} className="text-gray-400" />
              <div>
                <div className="text-[13px] font-medium text-black">自动定位</div>
                <div className="text-[11px] text-gray-400 mt-0.5">开启后将自动检测您的位置获取天气</div>
              </div>
            </div>
            <button
              className={`w-11 h-6 rounded-full transition-colors relative ${autoLocation ? 'bg-black' : 'bg-gray-200'}`}
              onClick={toggleAutoLocation}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${autoLocation ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>

          {!autoLocation && (
            <div className="pt-5">
              <label className="flex items-center gap-2 text-[12px] font-medium text-gray-700 mb-2">
                <IconLocation size={13} />
                城市名称
              </label>
              <input
                type="text"
                value={isAutoCity(settings.city) ? '' : settings.city}
                onChange={(e) => setSettings((s) => ({ ...s, city: e.target.value }))}
                placeholder="输入城市名称（中文/英文均可，如 北京、Shanghai）"
                className="w-full px-3 py-2.5 bg-gray-50 border border-[var(--color-border)] rounded-lg text-[13px] text-black focus:outline-none focus:border-black focus:bg-white"
              />
              <p className="text-[11px] text-gray-400 mt-2">关闭自动定位后，需手动输入城市名称</p>
            </div>
          )}
        </div>

        {/* ABOUT */}
        <div className="mt-4 border border-[var(--color-border)] rounded-lg p-5">
          <h2 className="text-[13px] font-semibold text-black mb-3">关于</h2>
          <div className="space-y-1.5">
            <p className="text-[13px] text-gray-700">智能服装搭配管理 v1.0</p>
            <p className="text-[12px] text-gray-500">根据天气、日程自动生成风格统一的穿搭方案</p>
            <p className="text-[12px] text-gray-500">所有数据存储在本地，无需联网即可使用衣橱管理功能</p>
          </div>
        </div>

        {/* SAVE */}
        <button
          className="w-full mt-4 px-4 py-3 bg-black text-white text-[13px] font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          onClick={handleSave}
        >
          {saved ? <><IconCheck size={16} /> 已保存</> : '保存设置'}
        </button>
      </section>
    </div>
  );
}
