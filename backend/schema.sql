-- CollegeCompass Database Schema

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS colleges (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  state VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  established INTEGER,
  rating DECIMAL(3,1),
  fees_min INTEGER,
  fees_max INTEGER,
  website VARCHAR(255),
  description TEXT,
  image_url VARCHAR(255),
  nirf_rank INTEGER,
  accreditation VARCHAR(100),
  total_students INTEGER
);

CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  college_id INTEGER REFERENCES colleges(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  level VARCHAR(50) NOT NULL,
  duration INTEGER,
  annual_fee INTEGER
);

CREATE TABLE IF NOT EXISTS placements (
  id SERIAL PRIMARY KEY,
  college_id INTEGER REFERENCES colleges(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  avg_package DECIMAL(10,2),
  highest_package DECIMAL(10,2),
  placement_pct DECIMAL(5,2),
  top_recruiters TEXT[]
);

CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  college_id INTEGER REFERENCES colleges(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  reviewer_name VARCHAR(255) DEFAULT 'Anonymous',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  pros TEXT,
  cons TEXT,
  batch_year INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  college_id INTEGER REFERENCES colleges(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  author_name VARCHAR(255) DEFAULT 'Anonymous',
  title VARCHAR(500) NOT NULL,
  body TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS answers (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  author_name VARCHAR(255) DEFAULT 'Anonymous',
  body TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS saved_colleges (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  college_id INTEGER REFERENCES colleges(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, college_id)
);

CREATE TABLE IF NOT EXISTS saved_comparisons (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  college_ids INTEGER[] NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
