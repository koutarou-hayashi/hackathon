import { supabase } from "./supabase"
import type { MapConfig, SkillLabel } from "./database.types"

export class SkillMapService {
  // スキルマップを保存
  static async saveSkillMap(userId: string, title: string, config: MapConfig, skillLabels: SkillLabel[]) {
    const { data, error } = await supabase
      .from("skill_maps")
      .insert({
        user_id: userId,
        title,
        config,
        skill_labels: skillLabels,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // スキルマップを更新
  static async updateSkillMap(
    id: string,
    updates: {
      title?: string
      config?: MapConfig
      skill_labels?: SkillLabel[]
    },
  ) {
    const { data, error } = await supabase
      .from("skill_maps")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // ユーザーのスキルマップ一覧を取得
  static async getUserSkillMaps(userId: string) {
    const { data, error } = await supabase
      .from("skill_maps")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })

    if (error) throw error
    return data
  }

  // 特定のスキルマップを取得
  static async getSkillMap(id: string) {
    const { data, error } = await supabase.from("skill_maps").select("*").eq("id", id).single()

    if (error) throw error
    return data
  }

  // スキルマップを削除
  static async deleteSkillMap(id: string) {
    const { error } = await supabase.from("skill_maps").delete().eq("id", id)

    if (error) throw error
  }
}