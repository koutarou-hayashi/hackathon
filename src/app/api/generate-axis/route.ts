import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    // 現在は固定値を返す（後でAI APIに置き換え可能）
    const generatedConfig = {
      verticalAxis: {
        positive: "高い重要度",
        negative: "低い重要度",
      },
      horizontalAxis: {
        positive: "高い習熟度",
        negative: "低い習熟度",
      },
      quadrants: {
        topRight: ["維持・強化", "専門性発揮", "指導・共有", "リーダーシップ"],
        topLeft: ["優先学習", "集中投資", "短期習得", "基礎固め"],
        bottomRight: ["現状維持", "効率化", "自動化検討", "他者移譲"],
        bottomLeft: ["学習検討", "将来準備", "情報収集", "機会待ち"],
      },
    }

    // 少し遅延を追加してAPI呼び出しっぽくする
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      data: generatedConfig,
      message: "軸・象限設定を生成しました",
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ success: false, message: "軸・象限設定の生成に失敗しました" }, { status: 500 })
  }
}