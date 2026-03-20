-- Add customizable quick-add presets to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS quick_add_presets_ml integer[] DEFAULT '{100,250,500}';
