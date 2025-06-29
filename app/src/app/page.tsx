"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Sparkles, LogOut } from "lucide-react"
import SkillMapCanvas from "./components/skill-map-canvas"
import SkillLabelManager from "./components/skill-label-manager"
import AuthGuard from "./components/auth-guard"
import { signOut, useSession } from "next-auth/react"

export interface SkillLabel {
  id: string
  text: string
  color: string
  x: number
  y: number
}

export interface MapConfig {
  verticalAxis: {
    positive: string
    negative: string
  }
  horizontalAxis: {
    positive: string
    negative: string
  }
  quadrants: {
    topRight: string[]
    topLeft: string[]
    bottomRight: string[]
    bottomLeft: string[]
  }
}

function SkillMapTool() {
  const { data: session } = useSession()
  const [mapConfig, setMapConfig] = useState<MapConfig>({
    verticalAxis: {
      positive: "",
      negative: "",
    },
    horizontalAxis: {
      positive: "",
      negative: "",
    },
    quadrants: {
      topRight: ["", "", "", ""],
      topLeft: ["", "", "", ""],
      bottomLeft: ["", "", "", ""],
      bottomRight: ["", "", "", ""],
    },
  })

  const [skillLabels, setSkillLabels] = useState<SkillLabel[]>([])
  const [activeTab, setActiveTab] = useState("map")
  const [generatePrompt, setGeneratePrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/signin" })
  }

  const updateAxisLabel = (axis: "vertical" | "horizontal", direction: "positive" | "negative", value: string) => {
    setMapConfig((prev) => ({
      ...prev,
      [`${axis}Axis`]: {
        ...prev[`${axis}Axis`],
        [direction]: value,
      },
    }))
  }

  const updateQuadrantLabels = (quadrant: keyof MapConfig["quadrants"], labels: string[]) => {
    setMapConfig((prev) => ({
      ...prev,
      quadrants: {
        ...prev.quadrants,
        [quadrant]: labels,
      },
    }))
  }

  const generateAxisConfig = async () => {
    if (!generatePrompt.trim()) {
      alert("プロンプトを入力してください")
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-axis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: generatePrompt,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setMapConfig(result.data)
        alert(result.message)
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error("Error generating axis config:", error)
      alert("軸・象限設定の生成中にエラーが発生しました")
    } finally {
      setIsGenerating(false)
    }
  }

  const addSkillLabel = (label: Omit<SkillLabel, "id">) => {
    const newLabel: SkillLabel = {
      ...label,
      id: Date.now().toString(),
    }
    setSkillLabels((prev) => [...prev, newLabel])
  }

  const updateSkillLabel = (id: string, updates: Partial<SkillLabel>) => {
    setSkillLabels((prev) => prev.map((label) => (label.id === id ? { ...label, ...updates } : label)))
  }

  const deleteSkillLabel = (id: string) => {
    setSkillLabels((prev) => prev.filter((label) => label.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">スキルマップ作成ツール</h1>
            {session?.user && <p className="text-gray-600 mt-1">ようこそ、{session.user.name}さん</p>}
          </div>
          <div className="flex items-center gap-4">
            {session?.user?.image && (
              <img
                src={session.user.image || "/placeholder.svg"}
                alt="プロフィール画像"
                className="w-8 h-8 rounded-full"
              />
            )}
            <Button onClick={handleSignOut} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              サインアウト
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="map">スキルマップ</TabsTrigger>
            <TabsTrigger value="config">軸・象限設定</TabsTrigger>
            <TabsTrigger value="labels">ラベル管理</TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="mt-6">
            <SkillMapCanvas config={mapConfig} skillLabels={skillLabels} onUpdateSkillLabel={updateSkillLabel} />
          </TabsContent>

          <TabsContent value="config" className="mt-6">
            <div className="space-y-6">
              {/* AI生成セクション */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    AI軸・象限生成
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="generate-prompt">どのようなスキルマップを作成したいか説明してください</Label>
                    <Input
                      id="generate-prompt"
                      value={generatePrompt}
                      onChange={(e) => setGeneratePrompt(e.target.value)}
                      placeholder="例: エンジニアのスキルマップを作成したい、マーケティングスキルの評価軸が欲しい"
                      className="mt-2"
                    />
                  </div>
                  <Button
                    onClick={generateAxisConfig}
                    disabled={isGenerating || !generatePrompt.trim()}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        軸・象限を自動生成
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* 手動設定セクション */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>軸の設定</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="vertical-positive">縦軸（上）</Label>
                      <Input
                        id="vertical-positive"
                        value={mapConfig.verticalAxis.positive}
                        onChange={(e) => updateAxisLabel("vertical", "positive", e.target.value)}
                        placeholder="例: 高い重要度"
                      />
                    </div>
                    <div>
                      <Label htmlFor="vertical-negative">縦軸（下）</Label>
                      <Input
                        id="vertical-negative"
                        value={mapConfig.verticalAxis.negative}
                        onChange={(e) => updateAxisLabel("vertical", "negative", e.target.value)}
                        placeholder="例: 低い重要度"
                      />
                    </div>
                    <div>
                      <Label htmlFor="horizontal-positive">横軸（右）</Label>
                      <Input
                        id="horizontal-positive"
                        value={mapConfig.horizontalAxis.positive}
                        onChange={(e) => updateAxisLabel("horizontal", "positive", e.target.value)}
                        placeholder="例: 高い習熟度"
                      />
                    </div>
                    <div>
                      <Label htmlFor="horizontal-negative">横軸（左）</Label>
                      <Input
                        id="horizontal-negative"
                        value={mapConfig.horizontalAxis.negative}
                        onChange={(e) => updateAxisLabel("horizontal", "negative", e.target.value)}
                        placeholder="例: 低い習熟度"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>象限の4分割設定</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(mapConfig.quadrants).map(([key, labels]) => (
                        <div key={key} className="space-y-2">
                          <Label className="text-sm font-medium">
                            {key === "topRight" && "右上象限"}
                            {key === "topLeft" && "左上象限"}
                            {key === "bottomRight" && "右下象限"}
                            {key === "bottomLeft" && "左下象限"}
                          </Label>
                          {labels.map((label, index) => (
                            <Input
                              key={index}
                              value={label}
                              onChange={(e) => {
                                const newLabels = [...labels]
                                newLabels[index] = e.target.value
                                updateQuadrantLabels(key as keyof MapConfig["quadrants"], newLabels)
                              }}
                              placeholder={`セクション ${index + 1}`}
                              className="text-xs"
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="labels" className="mt-6">
            <SkillLabelManager
              skillLabels={skillLabels}
              onAddLabel={addSkillLabel}
              onUpdateLabel={updateSkillLabel}
              onDeleteLabel={deleteSkillLabel}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <AuthGuard>
      <SkillMapTool />
    </AuthGuard>
  )
}
