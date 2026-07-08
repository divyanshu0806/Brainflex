-- BrainFlex Database Schema
-- Run this in Supabase SQL Editor to create all tables

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) UNIQUE NOT NULL,
  phone       VARCHAR(20),
  password_hash VARCHAR(255),
  google_id   VARCHAR(100) UNIQUE,
  avatar_url  TEXT,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- Exams table (UPSC, SSC, IBPS etc.)
CREATE TABLE IF NOT EXISTS exams (
  id    SERIAL PRIMARY KEY,
  name  VARCHAR(100) NOT NULL,
  slug  VARCHAR(100) UNIQUE NOT NULL
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id            SERIAL PRIMARY KEY,
  exam_id       INTEGER REFERENCES exams(id) ON DELETE CASCADE,
  topic         VARCHAR(100) NOT NULL,
  difficulty    VARCHAR(10) CHECK (difficulty IN ('Easy', 'Medium', 'Hard')) NOT NULL,
  question_text TEXT NOT NULL,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Options table (4 options per question)
CREATE TABLE IF NOT EXISTS options (
  id          SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct  BOOLEAN DEFAULT FALSE
);

-- AI Explanations (pre-generated or cached per option)
CREATE TABLE IF NOT EXISTS ai_explanations (
  id          SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  option_id   INTEGER REFERENCES options(id) ON DELETE CASCADE,
  explanation TEXT NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE(question_id, option_id)
);

-- User attempts (each time a user answers a question)
CREATE TABLE IF NOT EXISTS user_attempts (
  id                 SERIAL PRIMARY KEY,
  user_id            INTEGER REFERENCES users(id) ON DELETE CASCADE,
  question_id        INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  selected_option_id INTEGER REFERENCES options(id),
  is_correct         BOOLEAN NOT NULL,
  time_taken_secs    INTEGER,
  attempted_at       TIMESTAMP DEFAULT NOW()
);

-- Mock test sessions
CREATE TABLE IF NOT EXISTS test_sessions (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
  exam_id     INTEGER REFERENCES exams(id),
  title       VARCHAR(200) NOT NULL,
  score       INTEGER,
  total_qs    INTEGER,
  duration_secs INTEGER,
  completed_at TIMESTAMP DEFAULT NOW()
);

-- Streaks table
CREATE TABLE IF NOT EXISTS streaks (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  current_streak   INTEGER DEFAULT 0,
  longest_streak   INTEGER DEFAULT 0,
  last_active_date DATE DEFAULT CURRENT_DATE
);

-- Seed exams
INSERT INTO exams (name, slug) VALUES
  ('UPSC CSE', 'upsc'),
  ('SSC CGL',  'ssc'),
  ('IBPS PO',  'ibps'),
  ('General',  'general')
ON CONFLICT (slug) DO NOTHING;
