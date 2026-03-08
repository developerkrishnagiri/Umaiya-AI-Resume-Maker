-- ============================================================
-- AI Career Platform - Full Database Schema
-- Flyway Migration V1
-- ============================================================

-- Users
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(30),
    avatar_url TEXT,
    headline VARCHAR(255),
    location VARCHAR(100),
    role VARCHAR(20) NOT NULL DEFAULT 'JOBSEEKER',
    plan_type VARCHAR(20) NOT NULL DEFAULT 'FREE',
    email_verified BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    provider VARCHAR(20) DEFAULT 'local',
    provider_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Password Reset / Email Verification Tokens
CREATE TABLE password_reset_tokens (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resumes
CREATE TABLE resumes (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'Untitled Resume',
    template_id VARCHAR(50) DEFAULT 'professional',
    is_draft BOOLEAN DEFAULT TRUE,
    target_job_title VARCHAR(100),
    target_industry VARCHAR(100),
    full_name VARCHAR(200),
    email VARCHAR(255),
    phone VARCHAR(30),
    location VARCHAR(100),
    website VARCHAR(255),
    linkedin VARCHAR(255),
    github VARCHAR(255),
    summary TEXT,
    section_order JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_resumes_user ON resumes(user_id);

-- Experience
CREATE TABLE experiences (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    resume_id VARCHAR(36) NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    company VARCHAR(255),
    title VARCHAR(255),
    location VARCHAR(100),
    start_date VARCHAR(20),
    end_date VARCHAR(20),
    current BOOLEAN DEFAULT FALSE,
    industry VARCHAR(100),
    description TEXT,
    bullets JSONB,
    display_order INTEGER DEFAULT 0
);

-- Education
CREATE TABLE educations (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    resume_id VARCHAR(36) NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    institution VARCHAR(255),
    degree VARCHAR(255),
    field_of_study VARCHAR(255),
    start_date VARCHAR(20),
    end_date VARCHAR(20),
    current BOOLEAN DEFAULT FALSE,
    gpa DECIMAL(4,2),
    location VARCHAR(100),
    description TEXT,
    display_order INTEGER DEFAULT 0
);

-- Skills
CREATE TABLE skills (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    resume_id VARCHAR(36) NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    level VARCHAR(20),
    display_order INTEGER DEFAULT 0
);

-- Projects
CREATE TABLE projects (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    resume_id VARCHAR(36) NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    name VARCHAR(255),
    role VARCHAR(100),
    start_date VARCHAR(20),
    end_date VARCHAR(20),
    url VARCHAR(255),
    repo_url VARCHAR(255),
    description TEXT,
    technologies JSONB,
    display_order INTEGER DEFAULT 0
);

-- Certifications
CREATE TABLE certifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    resume_id VARCHAR(36) NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    name VARCHAR(255),
    issuer VARCHAR(255),
    issue_date VARCHAR(20),
    expiry_date VARCHAR(20),
    credential_id VARCHAR(255),
    credential_url VARCHAR(255),
    display_order INTEGER DEFAULT 0
);

-- Languages
CREATE TABLE languages (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    resume_id VARCHAR(36) NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    proficiency VARCHAR(20),
    display_order INTEGER DEFAULT 0
);

-- Jobs
CREATE TABLE jobs (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    recruiter_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(100),
    remote BOOLEAN DEFAULT FALSE,
    job_type VARCHAR(20) DEFAULT 'FULL_TIME',
    industry VARCHAR(100),
    experience_level VARCHAR(20),
    salary_min DECIMAL(15,2),
    salary_max DECIMAL(15,2),
    salary_currency VARCHAR(5) DEFAULT 'USD',
    salary_period VARCHAR(10) DEFAULT 'ANNUAL',
    description TEXT NOT NULL,
    requirements JSONB,
    benefits JSONB,
    keywords JSONB,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    application_deadline VARCHAR(20),
    application_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_recruiter ON jobs(recruiter_id);
CREATE INDEX idx_jobs_created ON jobs(created_at DESC);

-- Full-text search index
CREATE INDEX idx_jobs_fts ON jobs USING gin(to_tsvector('english', title || ' ' || company || ' ' || description));

-- Applications
CREATE TABLE applications (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id VARCHAR(36) NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    resume_id VARCHAR(36) REFERENCES resumes(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'APPLIED',
    cover_letter TEXT,
    match_score DECIMAL(5,2),
    rank_position INTEGER,
    recruiter_notes TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, job_id)
);

CREATE INDEX idx_applications_user ON applications(user_id);
CREATE INDEX idx_applications_job ON applications(job_id);

-- ATS Scores
CREATE TABLE ats_scores (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    resume_id VARCHAR(36) NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    job_id VARCHAR(36) REFERENCES jobs(id) ON DELETE SET NULL,
    overall_score DECIMAL(5,2),
    keyword_score DECIMAL(5,2),
    section_score DECIMAL(5,2),
    formatting_score DECIMAL(5,2),
    readability_score DECIMAL(5,2),
    experience_score DECIMAL(5,2),
    job_description TEXT,
    matched_keywords JSONB,
    missing_keywords JSONB,
    suggestions JSONB,
    formatting_warnings JSONB,
    scan_type VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ats_resume ON ats_scores(resume_id);

-- Saved Jobs
CREATE TABLE saved_jobs (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id VARCHAR(36) NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, job_id)
);

-- Subscriptions
CREATE TABLE subscriptions (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan VARCHAR(20) DEFAULT 'FREE',
    status VARCHAR(20) DEFAULT 'ACTIVE',
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    razorpay_subscription_id VARCHAR(255),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    canceled_at TIMESTAMP,
    auto_renew BOOLEAN DEFAULT TRUE,
    billing_cycle VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments
CREATE TABLE payments (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(5) DEFAULT 'USD',
    gateway VARCHAR(20),
    transaction_id VARCHAR(255),
    gateway_payment_id VARCHAR(255),
    gateway_order_id VARCHAR(255),
    gateway_signature VARCHAR(500),
    status VARCHAR(20) DEFAULT 'PENDING',
    payment_type VARCHAR(20),
    plan VARCHAR(20),
    billing_cycle VARCHAR(10),
    invoice_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Interview Sessions
CREATE TABLE interview_sessions (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id VARCHAR(36) REFERENCES jobs(id) ON DELETE SET NULL,
    category VARCHAR(50),
    difficulty VARCHAR(10),
    overall_score DECIMAL(4,2),
    questions_and_answers JSONB,
    status VARCHAR(20) DEFAULT 'IN_PROGRESS',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_interview_user ON interview_sessions(user_id);

-- ─── SEED DATA ──────────────────────────────────────────────────────────────

-- Default Admin user (password: Admin@1234!)
INSERT INTO users (id, email, password, first_name, last_name, role, plan_type, email_verified, active)
VALUES (
    gen_random_uuid()::text,
    'admin@aicareer.com',
    '$2a$12$pEAkF.VZwSCcREX3tL7bS.bBmWX3bRDPGl.LRuNt9Q77UHmQaHkOy',
    'Admin', 'User', 'ADMIN', 'ENTERPRISE', TRUE, TRUE
) ON CONFLICT DO NOTHING;

-- Sample Jobs
INSERT INTO users (id, email, password, first_name, last_name, role, plan_type, email_verified, active)
VALUES (
    'recruiter-demo-001',
    'recruiter@techcorp.com',
    '$2a$12$pEAkF.VZwSCcREX3tL7bS.bBmWX3bRDPGl.LRuNt9Q77UHmQaHkOy',
    'Sarah', 'Johnson', 'RECRUITER', 'ENTERPRISE', TRUE, TRUE
) ON CONFLICT DO NOTHING;

INSERT INTO jobs (id, recruiter_id, title, company, location, remote, job_type, industry, experience_level, salary_min, salary_max, description, keywords, status)
VALUES
('job-001', 'recruiter-demo-001', 'Senior Java Developer', 'TechCorp Inc.', 'New York, NY', TRUE, 'FULL_TIME', 'Technology', 'SENIOR', 120000, 160000,
 'We are seeking a Senior Java Developer to join our growing engineering team. You will design and build scalable microservices, lead code reviews, and mentor junior developers.',
 '["Java", "Spring Boot", "Microservices", "PostgreSQL", "Docker", "Kubernetes", "REST API", "Agile"]', 'ACTIVE'),
('job-002', 'recruiter-demo-001', 'React Frontend Engineer', 'StartupXYZ', 'San Francisco, CA', FALSE, 'FULL_TIME', 'Technology', 'MID', 90000, 130000,
 'Join our product team as a React Frontend Engineer. Build beautiful, responsive user interfaces for our AI-powered SaaS platform.',
 '["React", "TypeScript", "TailwindCSS", "REST API", "Git", "Agile", "UI/UX"]', 'ACTIVE'),
('job-003', 'recruiter-demo-001', 'Full Stack Developer', 'InnovateLab', 'Austin, TX', TRUE, 'FULL_TIME', 'Technology', 'MID', 100000, 140000,
 'Full Stack Developer needed to work on our next-gen web platform. Must be proficient in React and Node.js or Java Spring Boot.',
 '["React", "Node.js", "Java", "PostgreSQL", "AWS", "Docker", "CI/CD"]', 'ACTIVE'),
('job-004', 'recruiter-demo-001', 'Data Scientist', 'DataDriven Co.', 'Remote', TRUE, 'REMOTE', 'Data Science', 'SENIOR', 130000, 180000,
 'We''re looking for a Data Scientist to develop ML models and data pipelines to help our clients gain actionable business insights.',
 '["Python", "Machine Learning", "TensorFlow", "PyTorch", "SQL", "Spark", "AWS SageMaker"]', 'ACTIVE'),
('job-005', 'recruiter-demo-001', 'DevOps Engineer', 'CloudFirst', 'Seattle, WA', TRUE, 'FULL_TIME', 'Technology', 'MID', 110000, 150000,
 'DevOps Engineer to build and maintain our cloud infrastructure, CI/CD pipelines, and monitoring systems.',
 '["AWS", "Kubernetes", "Docker", "Terraform", "Jenkins", "Python", "Linux", "CI/CD"]', 'ACTIVE');
