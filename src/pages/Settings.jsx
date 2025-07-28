import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { User, Mail, Building, Moon, Sun } from 'lucide-react'

export default function Settings() {
  const { user, logout } = useAuth()
  const [darkMode, setDarkMode] = useState(false)

  const handleLogout = async () => {
    await logout()
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    // 실제 다크모드 구현은 여기에 추가
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">설정</h1>
        <p className="text-gray-600">계정 및 앱 설정을 관리하세요.</p>
      </div>

      {/* 사용자 정보 */}
      <div className="card p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <User className="h-5 w-5 mr-2" />
          사용자 정보
        </h2>
        <div className="space-y-4">
          <div className="flex items-center">
            <Mail className="h-4 w-4 text-gray-400 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">이메일</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Building className="h-4 w-4 text-gray-400 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">지점</p>
              <p className="text-sm text-gray-500">기본 지점</p>
            </div>
          </div>
        </div>
      </div>

      {/* 앱 설정 */}
      <div className="card p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">앱 설정</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {darkMode ? (
                <Moon className="h-4 w-4 text-gray-400 mr-3" />
              ) : (
                <Sun className="h-4 w-4 text-gray-400 mr-3" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">다크 모드</p>
                <p className="text-sm text-gray-500">어두운 테마로 전환</p>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                darkMode ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 계정 관리 */}
      <div className="card p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">계정 관리</h2>
        <div className="space-y-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* 앱 정보 */}
      <div className="card p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">앱 정보</h2>
        <div className="space-y-2 text-sm text-gray-500">
          <p>버전: 1.0.0</p>
          <p>피부관리샵 고객관리 시스템</p>
          <p>© 2024 All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}