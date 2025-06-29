"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Plus } from "lucide-react"
import type { SkillLabel } from "../page"

interface SkillLabelManagerProps {
  skillLabels: SkillLabel[]
  onAddLabel: (label: Omit<SkillLabel, "id">) => void
  onUpdateLabel: (id: string, updates: Partial<SkillLabel>) => void
  onDeleteLabel: (id: string) => void
}

const PRESET_COLORS = [
  "#3B82F6",
  "#EF4444",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
  "#F97316",
  "#6366F1",
  "#14B8A6",
  "#F43F5E",
]

export default function SkillLabelManager({
  skillLabels,
  onAddLabel,
  onUpdateLabel,
  onDeleteLabel,
}: SkillLabelManagerProps) {
  const [newLabelText, setNewLabelText] = useState("")
  const [newLabelColor, setNewLabelColor] = useState(PRESET_COLORS[0])

  const handleAddLabel = () => {
    if (newLabelText.trim()) {
      onAddLabel({
        text: newLabelText.trim(),
        color: newLabelColor,
        x: 0.5,
        y: 0.5,
      })
      setNewLabelText("")
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>新しいスキルラベルを追加</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="label-text">ラベルテキスト</Label>
            <Input
              id="label-text"
              value={newLabelText}
              onChange={(e) => setNewLabelText(e.target.value)}
              placeholder="例: React, TypeScript, デザイン思考"
              onKeyPress={(e) => e.key === "Enter" && handleAddLabel()}
            />
          </div>

          <div>
            <Label>ラベルの色</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full border-2 ${
                    newLabelColor === color ? "border-gray-800" : "border-gray-300"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setNewLabelColor(color)}
                />
              ))}
            </div>
            <Input
              type="color"
              value={newLabelColor}
              onChange={(e) => setNewLabelColor(e.target.value)}
              className="w-20 h-10 mt-2"
            />
          </div>

          <Button onClick={handleAddLabel} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            ラベルを追加
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>既存のスキルラベル ({skillLabels.length}個)</CardTitle>
        </CardHeader>
        <CardContent>
          {skillLabels.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              まだスキルラベルがありません。
              <br />
              上記のフォームから追加してください。
            </p>
          ) : (
            <div className="space-y-3">
              {skillLabels.map((label) => (
                <div key={label.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-6 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: label.color }} />
                  <Input
                    value={label.text}
                    onChange={(e) => onUpdateLabel(label.id, { text: e.target.value })}
                    className="flex-1"
                  />
                  <div className="flex items-center gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        className={`w-6 h-6 rounded-full border ${
                          label.color === color ? "border-gray-800" : "border-gray-300"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => onUpdateLabel(label.id, { color })}
                      />
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onDeleteLabel(label.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}