-- Initial database setup (runs only on first container creation)

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types if needed
DO $$ BEGIN
    CREATE TYPE lottery_status AS ENUM ('pending', 'active', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Set up initial database configuration
ALTER DATABASE lotr SET timezone TO 'UTC';

-- Create indexes for better performance (Prisma will handle most of these)
-- Additional custom indexes can be added here

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE lotr TO lotr;
GRANT ALL ON SCHEMA public TO lotr;

-- Initial performance settings
ALTER DATABASE lotr SET random_page_cost = 1.1;
ALTER DATABASE lotr SET effective_cache_size = '256MB';
ALTER DATABASE lotr SET shared_buffers = '128MB';