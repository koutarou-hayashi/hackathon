import { VertexAI } from '@google-cloud/vertexai';

// Vertex AI クライアントの初期化
function initVertexAI() {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT;
  const location = process.env.VERTEX_AI_LOCATION || 'asia-northeast1';
  
  if (!projectId) {
    throw new Error('GOOGLE_CLOUD_PROJECT environment variable is required');
  }

  return new VertexAI({
    project: projectId,
    location: location,
  });
}

// スキルマップの軸・象限設定を生成するプロンプト
function buildSkillMapPrompt(userPrompt: string): string {
  return `
あなたはスキルマップ作成の専門家です。以下のユーザーの要求に基づいて、スキルマップの軸設定と象限ラベルを生成してください。

ユーザーの要求: "${userPrompt}"

以下のJSON形式で回答してください：

{
  "verticalAxis": {
    "positive": "縦軸の正の方向のラベル（例：技術的専門性が高い）",
    "negative": "縦軸の負の方向のラベル（例：技術的専門性が低い）"
  },
  "horizontalAxis": {
    "positive": "横軸の正の方向のラベル（例：ビジネス貢献度が高い）",
    "negative": "横軸の負の方向のラベル（例：ビジネス貢献度が低い）"
  },
  "quadrants": {
    "topRight": ["第1象限のスキル1", "第1象限のスキル2", "第1象限のスキル3", "第1象限のスキル4"],
    "topLeft": ["第2象限のスキル1", "第2象限のスキル2", "第2象限のスキル3", "第2象限のスキル4"],
    "bottomLeft": ["第3象限のスキル1", "第3象限のスキル2", "第3象限のスキル3", "第3象限のスキル4"],
    "bottomRight": ["第4象限のスキル1", "第4象限のスキル2", "第4象限のスキル3", "第4象限のスキル4"]
  }
}

注意事項：
- 各象限には4つの関連するスキルを含めてください
- スキル名は具体的で実用的なものにしてください
- 軸のラベルはユーザーの要求に合致するようにしてください
- JSON形式以外の文字は含めないでください
`;
}

// Vertex AIを使用してスキルマップ設定を生成
export async function generateSkillMapConfig(userPrompt: string) {
  try {
    const vertexAI = initVertexAI();
    const model = process.env.VERTEX_AI_MODEL || 'gemini-1.5-flash';
    
    // Generative Modelの初期化
    const generativeModel = vertexAI.getGenerativeModel({
      model: model,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
        topP: 0.8,
      },
    });

    const prompt = buildSkillMapPrompt(userPrompt);
    const request = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    };

    const streamingResp = await generativeModel.generateContentStream(request);
    const response = await streamingResp.response;
    
    if (!response.candidates || response.candidates.length === 0) {
      throw new Error('No response candidates from Vertex AI');
    }

    const text = response.candidates[0].content.parts[0].text;
    
    if (!text) {
      throw new Error('Empty response from Vertex AI');
    }

    // JSONレスポンスをパース
    try {
      const cleanedText = text.trim().replace(/```json\n?|\n?```/g, '');
      const parsedResponse = JSON.parse(cleanedText);
      return parsedResponse;
    } catch (parseError) {
      console.error('Failed to parse JSON response:', text);
      throw new Error('Invalid JSON response from Vertex AI');
    }

  } catch (error) {
    console.error('Vertex AI API Error:', error);
    throw error;
  }
}
