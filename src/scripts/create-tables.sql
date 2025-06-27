-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skill maps table with JSONB approach
CREATE TABLE skill_maps (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL DEFAULT 'マイスキルマップ',
  config JSONB NOT NULL DEFAULT '{}',
  skill_labels JSONB NOT NULL DEFAULT '[]',
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_skill_maps_user_id ON skill_maps(user_id);
CREATE INDEX idx_skill_maps_config ON skill_maps USING GIN(config);
CREATE INDEX idx_skill_maps_skill_labels ON skill_maps USING GIN(skill_labels);

-- RLS (Row Level Security) policies
ALTER TABLE skill_maps ENABLE ROW LEVEL SECURITY;

-- Users can only see their own skill maps
CREATE POLICY "Users can view own skill maps" ON skill_maps
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own skill maps
CREATE POLICY "Users can insert own skill maps" ON skill_maps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own skill maps
CREATE POLICY "Users can update own skill maps" ON skill_maps
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own skill maps
CREATE POLICY "Users can delete own skill maps" ON skill_maps
  FOR DELETE USING (auth.uid() = user_id);
