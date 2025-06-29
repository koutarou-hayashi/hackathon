import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    // TODO: 後でAI APIに置き換え時にpromptを使用
    console.log("Received prompt:", prompt)
    // 現在は固定値を返す（後でAI APIに置き換え可能）
    const generatedConfig = {
      verticalAxis: {
        positive: "縦軸上",
        negative: "縦軸下",
      },
      horizontalAxis: {
        positive: "横軸右",
        negative: "横軸左",
      },
      quadrants: {
        topRight: ["第一右上", "第一左上", "第一左下", "第一右下"],
        topLeft: ["第二右上", "第二左上", "第二左下", "第二右下"],
        bottomLeft: ["第三右上", "第三左上", "第三左下", "第三右下"],
        bottomRight: ["第四右上", "第四左上", "第四左下", "第四右下"],
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