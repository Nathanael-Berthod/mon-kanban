-- ============================================================
-- Migration à exécuter dans Supabase > SQL Editor
-- ============================================================

-- 1. Colonne assigned_to sur les tâches
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL;

-- 2. Colonne name sur les tableaux
ALTER TABLE boards ADD COLUMN IF NOT EXISTS name text DEFAULT 'Mon tableau';

-- 3. Table sous-tâches
CREATE TABLE IF NOT EXISTS subtasks (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id    uuid REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  title      text NOT NULL,
  completed  boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "subtasks_all" ON subtasks;
CREATE POLICY "subtasks_all" ON subtasks FOR ALL USING (auth.role() = 'authenticated');

-- 4. Table commentaires
CREATE TABLE IF NOT EXISTS comments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id    uuid REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  user_id    uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content    text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "comments_all" ON comments;
CREATE POLICY "comments_all" ON comments FOR ALL USING (auth.role() = 'authenticated');

-- 5. Activer Realtime sur les tâches
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
