"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import type { MapConfig, SkillLabel } from "../page"

interface SkillMapCanvasProps {
  config: MapConfig
  skillLabels: SkillLabel[]
  onUpdateSkillLabel: (id: string, updates: Partial<SkillLabel>) => void
}

export default function SkillMapCanvas({ config, skillLabels, onUpdateSkillLabel }: SkillMapCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleDragEnd = (id: string, event: any, info: any) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = (info.point.x - rect.left) / rect.width
    const y = (info.point.y - rect.top) / rect.height

    onUpdateSkillLabel(id, { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) })
  }

  return (
    <Card className="w-full h-[800px] relative overflow-hidden">
      <div ref={canvasRef} className="w-full h-full relative bg-white">
        {/* 軸のラベル */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-sm font-medium text-gray-600">
          {config.verticalAxis.positive}
        </div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm font-medium text-gray-600">
          {config.verticalAxis.negative}
        </div>
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 -rotate-90 text-sm font-medium text-gray-600">
          {config.horizontalAxis.negative}
        </div>
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 rotate-90 text-sm font-medium text-gray-600">
          {config.horizontalAxis.positive}
        </div>

        {/* 中央の軸線 */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 transform -translate-x-1/2"></div>
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300 transform -translate-y-1/2"></div>

        {/* 象限の4分割線 */}
        <div className="absolute left-1/4 top-0 bottom-0 w-px bg-gray-200"></div>
        <div className="absolute left-3/4 top-0 bottom-0 w-px bg-gray-200"></div>
        <div className="absolute top-1/4 left-0 right-0 h-px bg-gray-200"></div>
        <div className="absolute top-3/4 left-0 right-0 h-px bg-gray-200"></div>

        {/* 象限のセクションラベル */}
        {/* 第一象限 (topRight) */}
        {config.quadrants.topRight.map((label, index) => {
          let leftPos, topPos;
          switch (index) {
            case 0: // 右上
              leftPos = "87.5%";
              topPos = "12.5%";
              break;
            case 1: // 左上
              leftPos = "62.5%";
              topPos = "12.5%";
              break;
            case 2: // 左下
              leftPos = "62.5%";
              topPos = "37.5%";
              break;
            case 3: // 右下
              leftPos = "87.5%";
              topPos = "37.5%";
              break;
            default:
              leftPos = "50%";
              topPos = "50%";
          }
          return (
            <div
              key={`tr-${index}`}
              className="absolute text-xs text-gray-500 font-medium"
              style={{
                left: leftPos,
                top: topPos,
                transform: "translate(-50%, -50%)",
              }}
            >
              {label}
            </div>
          );
        })}

        {/* 第二象限 (topLeft) */}
        {config.quadrants.topLeft.map((label, index) => {
          let leftPos, topPos;
          switch (index) {
            case 0: // 右上
              leftPos = "37.5%";
              topPos = "12.5%";
              break;
            case 1: // 左上
              leftPos = "12.5%";
              topPos = "12.5%";
              break;
            case 2: // 左下
              leftPos = "12.5%";
              topPos = "37.5%";
              break;
            case 3: // 右下
              leftPos = "37.5%";
              topPos = "37.5%";
              break;
            default:
              leftPos = "50%";
              topPos = "50%";
          }
          return (
            <div
              key={`tl-${index}`}
              className="absolute text-xs text-gray-500 font-medium"
              style={{
                left: leftPos,
                top: topPos,
                transform: "translate(-50%, -50%)",
              }}
            >
              {label}
            </div>
          );
        })}

        {/* 第三象限 (bottomLeft) */}
        {config.quadrants.bottomLeft.map((label, index) => {
          let leftPos, topPos;
          switch (index) {
            case 0: // 右上
              leftPos = "37.5%";
              topPos = "62.5%";
              break;
            case 1: // 左上
              leftPos = "12.5%";
              topPos = "62.5%";
              break;
            case 2: // 左下
              leftPos = "12.5%";
              topPos = "87.5%";
              break;
            case 3: // 右下
              leftPos = "37.5%";
              topPos = "87.5%";
              break;
            default:
              leftPos = "50%";
              topPos = "50%";
          }
          return (
            <div
              key={`bl-${index}`}
              className="absolute text-xs text-gray-500 font-medium"
              style={{
                left: leftPos,
                top: topPos,
                transform: "translate(-50%, -50%)",
              }}
            >
              {label}
            </div>
          );
        })}

        {/* 第四象限 (bottomRight) */}
        {config.quadrants.bottomRight.map((label, index) => {
          let leftPos, topPos;
          switch (index) {
            case 0: // 右上
              leftPos = "87.5%";
              topPos = "62.5%";
              break;
            case 1: // 左上
              leftPos = "62.5%";
              topPos = "62.5%";
              break;
            case 2: // 左下
              leftPos = "62.5%";
              topPos = "87.5%";
              break;
            case 3: // 右下
              leftPos = "87.5%";
              topPos = "87.5%";
              break;
            default:
              leftPos = "50%";
              topPos = "50%";
          }
          return (
            <div
              key={`br-${index}`}
              className="absolute text-xs text-gray-500 font-medium"
              style={{
                left: leftPos,
                top: topPos,
                transform: "translate(-50%, -50%)",
              }}
            >
              {label}
            </div>
          );
        })}

        {/* スキルラベル */}
        {skillLabels.map((label) => (
          <motion.div
            key={label.id}
            drag
            dragMomentum={false}
            onDragEnd={(event, info) => handleDragEnd(label.id, event, info)}
            className="absolute cursor-move select-none"
            style={{
              left: `${label.x * 100}%`,
              top: `${label.y * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
            whileDrag={{ scale: 1.1, zIndex: 1000 }}
          >
            <div
              className="px-3 py-1 rounded-full text-white text-sm font-medium shadow-lg border-2 border-white"
              style={{ backgroundColor: label.color }}
            >
              {label.text}
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  )
}