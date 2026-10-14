-- =============================================================================
-- Migration 001: Create Core Tables (users & announcements)
-- Week 05: Database & ORM — Persistent Memory
-- Source of Truth: ddd.md
-- =============================================================================

-- Table: users (Alumni & Student Records)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    department VARCHAR(150) NOT NULL DEFAULT 'Management Information Systems',
    graduation_year SMALLINT NOT NULL DEFAULT 2028 CHECK (graduation_year >= 1950 AND graduation_year <= 2100),
    is_alumni BOOLEAN NOT NULL DEFAULT FALSE,
    company VARCHAR(150) DEFAULT NULL,
    job_title VARCHAR(150) DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: announcements (University & Alumni Office Bulletins)
CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    category VARCHAR(50) NOT NULL DEFAULT 'General' CHECK (category IN ('General', 'Event', 'Career', 'Academic')),
    author VARCHAR(100) NOT NULL DEFAULT 'Alumni Office',
    publication_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for query optimization
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_dept_year ON users (department, graduation_year);
CREATE INDEX IF NOT EXISTS idx_users_is_alumni ON users (is_alumni);
CREATE INDEX IF NOT EXISTS idx_announcements_category ON announcements (category);
CREATE INDEX IF NOT EXISTS idx_announcements_pubdate ON announcements (publication_date DESC);

-- Trigger function to automatically maintain updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_announcements_updated_at ON announcements;
CREATE TRIGGER trg_announcements_updated_at
    BEFORE UPDATE ON announcements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
