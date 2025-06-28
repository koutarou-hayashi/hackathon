"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../../../lib/supabase"

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("認証コールバックエラー:", error)
          router.push("/signin?error=auth_failed")
          return
        }

        if (data.session) {
          // 認証成功
          router.push("/")
        } else {
          // セッションがない場合はサインインページに戻る
          router.push("/signin")
        }
      } catch (error) {
        console.error("認証処理エラー:", error)
        router.push("/signin?error=callback_failed")
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">認証処理中...</p>
      </div>
    </div>
  )
}