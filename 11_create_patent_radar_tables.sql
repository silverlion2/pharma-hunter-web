-- 11_create_patent_radar_tables.sql
-- Migration to support live Patent Radar dashboard

CREATE TABLE IF NOT EXISTS patent_cliff_timeline (
    id SERIAL PRIMARY KEY,
    mnc VARCHAR(255) NOT NULL,
    asset VARCHAR(255) NOT NULL,
    year INTEGER NOT NULL,
    revenue_at_risk NUMERIC(10, 2) NOT NULL,
    therapeutic_area VARCHAR(255) NOT NULL,
    successor_status TEXT NOT NULL,
    severity VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cnipa_scout_signals (
    id SERIAL PRIMARY KEY,
    signal_date VARCHAR(50) NOT NULL,
    company VARCHAR(255) NOT NULL,
    signal_type VARCHAR(100) NOT NULL,
    patent_title TEXT NOT NULL,
    cnipa_number VARCHAR(100) NOT NULL,
    jurisdictions_filed TEXT[] NOT NULL,
    therapeutic_area VARCHAR(255) NOT NULL,
    implications TEXT NOT NULL,
    severity VARCHAR(50) NOT NULL,
    related_mnc_interest TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
