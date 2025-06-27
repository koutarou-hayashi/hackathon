export interface Database {
    public: {
      Tables: {
        users: {
          Row: {
            id: string
            email: string
            name: string | null
            created_at: string
            updated_at: string
          }
          Insert: {
            id?: string
            email: string
            name?: string | null
            created_at?: string
            updated_at?: string
          }
          Update: {
            id?: string
            email?: string
            name?: string | null
            created_at?: string
            updated_at?: string
          }
        }
        skill_maps: {
          Row: {
            id: string
            user_id: string
            title: string
            config: MapConfig
            skill_labels: SkillLabel[]
            is_public: boolean
            created_at: string
            updated_at: string
          }
          Insert: {
            id?: string
            user_id: string
            title?: string
            config: MapConfig
            skill_labels?: SkillLabel[]
            is_public?: boolean
            created_at?: string
            updated_at?: string
          }
          Update: {
            id?: string
            user_id?: string
            title?: string
            config?: MapConfig
            skill_labels?: SkillLabel[]
            is_public?: boolean
            created_at?: string
            updated_at?: string
          }
        }
      }
    }
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
  
  export interface SkillLabel {
    id: string
    text: string
    color: string
    x: number
    y: number
  }
  