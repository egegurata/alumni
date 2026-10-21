-- =============================================================================
-- Migration 002: Create Relational Tables (job_postings & applications)
-- Week 06: Relational Data & Advanced Routing — Job Postings & Applications
-- Source of Truth: ddd.md
-- Delete Rule Decision: ON DELETE CASCADE (see ddd.md for justification)
-- =============================================================================

-- Table: job_postings (One-to-Many: One User has many Job Postings)
CREATE TABLE IF NOT EXISTS job_postings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    company VARCHAR(150) NOT NULL,
    location VARCHAR(150) NOT NULL DEFAULT 'Istanbul (Hybrid)',
    job_type VARCHAR(50) NOT NULL DEFAULT 'Full-time' CHECK (job_type IN ('Full-time', 'Part-time', 'Contract', 'Internship', 'Remote')),
    description TEXT NOT NULL DEFAULT '',
    requirements TEXT NOT NULL DEFAULT '',
    salary VARCHAR(100) DEFAULT NULL,
    contact_email VARCHAR(255) NOT NULL DEFAULT 'careers@alumni.edu',
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Closed', 'Draft')),
    application_deadline DATE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: applications (Many-to-Many Join Table: Users <-> Job Postings)
CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_posting_id INTEGER NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'interview', 'accepted', 'rejected', 'withdrawn', 'Pending', 'Reviewed', 'Accepted', 'Rejected', 'Withdrawn')),
    cover_note TEXT NOT NULL DEFAULT '',
    resume_url VARCHAR(500) DEFAULT NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_job_application UNIQUE (user_id, job_posting_id)
);

-- Indexes for relational lookups and filtering
CREATE INDEX IF NOT EXISTS idx_job_postings_user_id ON job_postings (user_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings (status);
CREATE INDEX IF NOT EXISTS idx_job_postings_type ON job_postings (job_type);
CREATE INDEX IF NOT EXISTS idx_job_postings_company ON job_postings (company);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications (user_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_posting_id ON applications (job_posting_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications (status);

-- Triggers for updated_at maintenance
DROP TRIGGER IF EXISTS trg_job_postings_updated_at ON job_postings;
CREATE TRIGGER trg_job_postings_updated_at
    BEFORE UPDATE ON job_postings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_applications_updated_at ON applications;
CREATE TRIGGER trg_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
