import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { tables } from '../lib/supabase'
import { User, Building, Phone, MapPin, Clock, Save, LogOut } from 'lucide-react'

export default function Settings() {
  const { user, logout } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    business_name: '',
    business_phone: '',
    business_address: '',
    business_hours: '',
    default_appointment_duration: 60,
    auto_backup: true,
    backup_interval: 7,
    language: 'ko'
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const { data, error } = await tables.settings()
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116는 데이터가 없을 때
        throw error
      }

      if (data) {
        setSettings(data)
      }
    } catch (error) {
      console.error('설정 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { error } = await tables.settings()
        .upsert([settings], { onConflict: 'user_id' })

      if (error) throw error
      alert('설정이 저장되었습니다.')
    } catch (error) {
      console.error('설정 저장 오류:', error)
      alert('설정 저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">설정</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 사용자 정보 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              사용자 정보
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">이메일</label>
                <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">사용자 ID</label>
                <p className="mt-1 text-sm text-gray-900">{user?.id}</p>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                로그아웃
              </button>
            </div>
          </div>
        </div>

        {/* 비즈니스 정보 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Building className="h-5 w-5 mr-2" />
              비즈니스 정보
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">샵 이름</label>
                <input
                  type="text"
                  value={settings.business_name}
                  onChange={(e) => setSettings({...settings, business_name: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="피부관리샵"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">연락처</label>
                <input
                  type="tel"
                  value={settings.business_phone}
                  onChange={(e) => setSettings({...settings, business_phone: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="010-1234-5678"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">주소</label>
                <textarea
                  value={settings.business_address}
                  onChange={(e) => setSettings({...settings, business_address: e.target.value})}
                  rows={2}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="서울시 강남구..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">영업시간</label>
                <input
                  type="text"
                  value={settings.business_hours}
                  onChange={(e) => setSettings({...settings, business_hours: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="09:00 - 18:00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">기본 예약 시간 (분)</label>
                <input
                  type="number"
                  value={settings.default_appointment_duration}
                  onChange={(e) => setSettings({...settings, default_appointment_duration: parseInt(e.target.value) || 60})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  min="30"
                  max="180"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="auto_backup"
                  checked={settings.auto_backup}
                  onChange={(e) => setSettings({...settings, auto_backup: e.target.checked})}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="auto_backup" className="ml-2 block text-sm text-gray-900">
                  자동 백업 사용
                </label>
              </div>
              
              {settings.auto_backup && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">백업 주기 (일)</label>
                  <input
                    type="number"
                    value={settings.backup_interval}
                    onChange={(e) => setSettings({...settings, backup_interval: parseInt(e.target.value) || 7})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    min="1"
                    max="30"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700">언어</label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({...settings, language: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="ko">한국어</option>
                  <option value="en">English</option>
                </select>
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? '저장 중...' : '설정 저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* 앱 정보 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">앱 정보</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">버전</label>
              <p className="mt-1 text-sm text-gray-900">1.0.0</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">빌드 날짜</label>
              <p className="mt-1 text-sm text-gray-900">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}