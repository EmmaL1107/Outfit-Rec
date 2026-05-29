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
    await settingsDB.set('weatherApiKey', settings.weatherApiKey);
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
    <div className="page settings-page">
      <div className="page-header">
        <h1>设置</h1>
      </div>

      <div className="settings-section">
        <h3>天气数据源</h3>
        <div className="form-group">
          <label>和风天气 API Key</label>
          <input
            type="text"
            value={settings.weatherApiKey}
            onChange={(e) => setSettings((s) => ({ ...s, weatherApiKey: e.target.value.trim() }))}
            placeholder="输入和风天气 API Key（可选）"
          />
          <p className="form-hint">
            填写后使用中国气象局数据，与国内天气 App 数据一致；不填则使用 Open-Meteo（全球模型，中国地区可能不准确）
          </p>
          <p className="form-hint">
            免费获取：前往 <a href="https://dev.qweather.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>dev.qweather.com</a> 注册，创建项目即可获得 Key（免费版每天 1000 次调用）
          </p>
        </div>
      </div>

      <div className="settings-section">
        <h3>定位设置</h3>

        <div className="location-toggle">
          <div className="location-toggle-label">
            <span>
              <IconLocate size={16} color="var(--primary)" style={{ marginRight: 6, verticalAlign: 'middle' }} />
              自动定位
            </span>
            <span>开启后将自动检测您的位置获取天气</span>
          </div>
          <button
            className={`toggle-switch ${autoLocation ? 'active' : ''}`}
            onClick={toggleAutoLocation}
          />
        </div>

        {!autoLocation && (
          <div className="form-group">
            <label>
              <IconLocation size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              城市名称
            </label>
            <input
              type="text"
              value={isAutoCity(settings.city) ? '' : settings.city}
              onChange={(e) => setSettings((s) => ({ ...s, city: e.target.value }))}
              placeholder={settings.weatherApiKey ? '输入城市名称（中文/英文均可）' : '输入城市名称（英文，如 Shanghai）'}
            />
            <p className="form-hint">
              {settings.weatherApiKey
                ? '使用和风天气时支持中文城市名（如 北京、上海）'
                : '未配置和风天气 Key 时，需输入英文城市名'}
            </p>
          </div>
        )}
      </div>

      <div className="settings-section">
        <h3>关于</h3>
        <div className="about-info">
          <p>智能服装搭配管理软件 v1.0</p>
          <p>根据天气、日程自动生成风格统一的穿搭方案</p>
          <p>所有数据存储在本地，无需联网即可使用衣橱管理功能</p>
        </div>
      </div>

      <button className="btn btn-primary btn-block" onClick={handleSave}>
        {saved ? <><IconCheck size={18} color="#fff" /> 已保存</> : '保存设置'}
      </button>
    </div>
  );
}
