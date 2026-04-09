-- Supabase SQL Schema for Genesis Prediction Market

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    icon VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address VARCHAR(255) UNIQUE,
    username VARCHAR(255) UNIQUE,
    avatar_url TEXT,
    balance DECIMAL(18, 6) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Sources
CREATE TABLE sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url TEXT NOT NULL,
    platform VARCHAR(50) NOT NULL, -- 'tiktok', 'youtube', 'twitter', 'api'
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Markets
CREATE TABLE markets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES users(id),
    category_id UUID REFERENCES categories(id),
    source_id UUID REFERENCES sources(id),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'resolved', 'cancelled'
    volume DECIMAL(18, 6) DEFAULT 0.0,
    liquidity DECIMAL(18, 6) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. AI Scores
CREATE TABLE ai_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    market_id UUID REFERENCES markets(id) ON DELETE CASCADE,
    confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
    sentiment_score INTEGER CHECK (sentiment_score >= 0 AND sentiment_score <= 100),
    analysis_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Outcomes
CREATE TABLE outcomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    market_id UUID REFERENCES markets(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    current_price DECIMAL(5, 4) DEFAULT 0.5, -- e.0. 0.5000 for 50%
    total_shares DECIMAL(18, 6) DEFAULT 0.0,
    is_winner BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Trades
CREATE TABLE trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    market_id UUID REFERENCES markets(id),
    outcome_id UUID REFERENCES outcomes(id),
    type VARCHAR(10) NOT NULL, -- 'buy' or 'sell'
    amount DECIMAL(18, 6) NOT NULL,
    price DECIMAL(5, 4) NOT NULL,
    shares DECIMAL(18, 6) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Comments
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    market_id UUID REFERENCES markets(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES comments(id), -- For nested replies
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Likes
CREATE TABLE likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    market_id UUID REFERENCES markets(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, market_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Create basic policies (Example: public read access for markets)
CREATE POLICY "Public markets are viewable by everyone." ON markets FOR SELECT USING (true);
CREATE POLICY "Public outcomes are viewable by everyone." ON outcomes FOR SELECT USING (true);
CREATE POLICY "Public categories are viewable by everyone." ON categories FOR SELECT USING (true);

-- Realtime publication
-- Enable realtime for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE markets;
ALTER PUBLICATION supabase_realtime ADD TABLE outcomes;
ALTER PUBLICATION supabase_realtime ADD TABLE trades;
