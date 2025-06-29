import { NextResponse } from "next/server"
import { generateSkillMapConfig } from "@/lib/vertex-ai"

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "プロンプトを入力してください" },
        { status: 400 }
      )
    }

    // Vertex AIを使用してスキルマップ設定を生成
    const generatedConfig = await generateSkillMapConfig(prompt)

    return NextResponse.json({
      success: true,
      data: generatedConfig,
      message: "軸・象限設定を生成しました",
    })
  } catch (error) {
    console.error("API Error:", error)
    
    // エラーの詳細をログに出力
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }

    return NextResponse.json(
      { 
        success: false, 
        message: "軸・象限設定の生成に失敗しました。しばらくしてから再度お試しください。" 
      }, 
      { status: 500 }
    )
  }
}