"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SkillMapCanvas from "./components/skill-map-canvas"
import SkillLabelManager from "./components/skill-label-manager"

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

export default function SkillMapTool() {
  const [mapConfig, setMapConfig] = useState<MapConfig>({
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
  })

  const [skillLabels, setSkillLabels] = useState<SkillLabel[]>([])
  const [activeTab, setActiveTab] = useState("map")

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
        <h1 className="text-3xl font-bold text-center mb-8">スキルマップ作成ツール</h1>

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