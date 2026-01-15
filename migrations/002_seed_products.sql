-- Seed data: 10 Trending Products for 2025-2026
-- Pre-populate affiliate programs and products based on market research

-- Insert Affiliate Programs
INSERT INTO affiliate_programs (name, base_url, default_commission_rate, cookie_duration, active) VALUES
('Amazon Associates', 'https://affiliate-program.amazon.com/', 0.04, 24, 1),
('ShareASale', 'https://www.shareasale.com/', 0.10, 720, 1),
('CJ Affiliate', 'https://www.cj.com/', 0.10, 720, 1),
('Rakuten Advertising', 'https://rakutenadvertising.com/', 0.08, 720, 1),
('TikTok Shop Affiliate', 'https://seller.tiktok.com/', 0.20, 720, 1),
('Naturecan', 'https://www.naturecan.com/', 0.20, 720, 1),
('Athletic Greens', 'https://athleticgreens.com/', 0.30, 720, 1),
('Onnit', 'https://www.onnit.com/', 0.12, 720, 1);

-- Insert 10 Trending Products
INSERT INTO products (name, category, description, price_range, target_audience, trending_score, notes) VALUES
(
    'Smart Rings (Oura Ring)',
    'Wearable Health Technology',
    'Advanced sleep and activity tracking ring with 733% search growth. Features include sleep quality monitoring, heart rate tracking, and recovery insights.',
    '$300-400',
    'Age 25-45, health-conscious professionals, fitness enthusiasts, biohackers, income $60k+',
    95,
    'Top emerging tech category for 2025-2026. Monthly search volume: 55,000+. Available through Oura Partner Program (commission by application) and Amazon Associates (4%).'
),
(
    'Snail Mucin Skincare Serums (COSRX, Beauty of Joseon)',
    'Beauty & Skincare',
    'Viral K-beauty product for achieving glass skin look. COSRX snail mucin essence is the top-selling product with 97% snail secretion filtrate for plump, hydrated skin.',
    '$20-30',
    'Age 18-35, primarily female, K-beauty enthusiasts, skincare routines, natural ingredients',
    100,
    'TikTok viral sensation. Global market projected 7% CAGR 2025-2033. Monthly search volume: 60,000+. Amazon Associates 10% (Luxury Beauty), Coréelle 10-14%.'
),
(
    'Massage Guns (Theragun, Hyperice)',
    'Fitness & Recovery',
    'Professional-grade percussion therapy devices for muscle recovery, pain relief, and post-workout relaxation. Popular among fitness enthusiasts and office workers.',
    '$100-200',
    'Age 25-50, fitness enthusiasts, CrossFit, running, bodybuilding, desk workers with tension, income $40k+',
    85,
    'Featured in Amazon best sellers. Monthly search volume: 135,000+. Amazon Associates 4%, CJ Affiliate/ShareASale 10-15%.'
),
(
    'Insulated Water Bottles (Stanley Quencher, Owala FreeSip)',
    'Home & Kitchen',
    'Viral social media products. Stanley Quencher is Amazon top seller for 2+ years. Owala FreeSip is 2025''s trending alternative with leak-proof design.',
    '$30-45',
    'Age 18-45, primarily female (Stanley), younger demographic (Owala), hydration-focused, aesthetic lifestyle',
    90,
    'Keeps ice frozen 24+ hours. Monthly search volume: 200,000+ combined. Amazon Associates 4.5% (Kitchen) + 7% Amazon Haul bonus = 11.5% total.'
),
(
    'Health Supplements (Creatine, Magnesium, Collagen)',
    'Health & Wellness',
    'Top-selling supplements with recurring purchase behavior. Includes creatine monohydrate for performance, magnesium for sleep/stress, and collagen for anti-aging.',
    '$30-50',
    'Age 25-55, health-conscious consumers, gym training, cognitive health, sleep optimization, anti-aging, income $40k+',
    88,
    'ADHD supplements show 270% search growth. Monthly search volume: 100,000+ combined. Naturecan 20% + $100/mo products, Athletic Greens 30%, Onnit 12-15%, Amazon 4%.'
),
(
    'Wireless Earbuds (AirPods Alternatives)',
    'Consumer Electronics',
    'Apple AirPods consistently Amazon top seller. Growing demand for affordable alternatives with ANC, long battery life (60+ hours), and waterproofing.',
    '$100-200',
    'Age 18-45, broad demographic appeal, music listeners, podcast enthusiasts, commuters, fitness',
    80,
    'Tech category represents 32% of Amazon top 100 best sellers. Monthly search volume: 300,000+. Amazon Associates 4% (Electronics).'
),
(
    'Bakuchiol Serum',
    'Beauty & Skincare',
    'Natural retinol alternative with 733% 5-year search growth. Gentler on sensitive skin while providing anti-aging benefits without irritation.',
    '$30-40',
    'Age 30-55, primarily female, anti-aging focus, natural/clean beauty, sensitive skin solutions, income $50k+',
    82,
    'Featured in beauty trend reports for 2025. Monthly search volume: 40,000+. Amazon Associates 10% (Luxury Beauty), ShareASale 10-18%.'
),
(
    'Air Fryers & Kitchen Gadgets',
    'Home & Kitchen',
    'Consistent Amazon best seller. Health-conscious cooking with time-saving convenience. Recipe content drives continuous interest and purchases.',
    '$80-120',
    'Age 25-55, families, working professionals, healthy cooking, meal prep enthusiasts',
    78,
    'Crispy results without oil. Monthly search volume: 250,000+ (air fryer). Amazon Associates 4.5% (Kitchen), ShareASale/CJ 5-10%.'
),
(
    'Activewear (Leggings, Shorts)',
    'Fashion & Apparel',
    'Athleisure trend continues strong. Trending styles: foldover, flare, butt-lifting leggings. TikTok "Amazon finds" viral product category.',
    '$40-60',
    'Age 18-45, primarily female, fitness enthusiasts, yoga, gym workouts, athleisure fashion, active lifestyle',
    75,
    'Gym culture and fitness content drives demand. Monthly search volume: 500,000+ (leggings). Amazon Associates 4% (Apparel), ShareASale/CJ 8-15%.'
),
(
    'Home Projectors',
    'Electronics / Home Entertainment',
    '945% search growth for "movie projector". Affordable options entering market create theater experience at home. 100-inch screen for under $300.',
    '$300-500',
    'Age 25-45, homeowners, movie enthusiasts, gaming, home improvement, tech gadgets, income $50k+',
    72,
    'Home entertainment upgrade trend. Monthly search volume: 80,000+. Amazon Associates 4% (Electronics), CJ/ShareASale 5-8%.'
);
