-- Sample Blog Posts for Testing
-- This script populates the blog_posts table with comprehensive sample content
-- Run this in your Supabase SQL Editor
--
-- This script will:
-- - Create 20+ diverse blog posts with varied content
-- - Include both published and draft posts
-- - Mix posts with and without associated projects
-- - Use realistic dates spread across different time periods
-- - Automatically use available student users and projects

-- Insert sample blog posts
INSERT INTO blog_posts (
  title,
  content,
  excerpt,
  author_id,
  project_id,
  status,
  slug,
  published_at,
  created_at,
  updated_at
)
SELECT 
  -- Post 1: Taiwan Project - Published
  'Understanding Traditional Soy Sauce Production in Taiwan' as title,
  '<p>During my field research in Taiwan, I had the opportunity to visit Wan Ja Shan, one of the oldest soy sauce manufacturers in the country. The experience was eye-opening, revealing how traditional methods have been preserved alongside modern innovations.</p><p>The fermentation process, which takes months, requires careful attention to temperature, humidity, and timing. Workers who have been with the company for decades shared their knowledge, passed down through generations.</p><p>What struck me most was the balance between maintaining traditional quality and meeting modern market demands. This project has taught me valuable lessons about sustainable business practices in traditional industries.</p><p>The factory tour revealed a fascinating blend of old and new. While some processes remain unchanged for centuries, modern quality control and packaging have been integrated seamlessly. This balance is what makes Wan Ja Shan successful in both domestic and international markets.</p>' as content,
  'A deep dive into traditional soy sauce production methods and how they intersect with modern business strategy.' as excerpt,
  (SELECT id FROM profiles WHERE role = 'student' LIMIT 1) as author_id,
  (SELECT id FROM projects WHERE name LIKE '%Wan Ja Shan%' OR name LIKE '%Taiwan%' LIMIT 1) as project_id,
  'published' as status,
  'understanding-traditional-soy-sauce-production-taiwan' as slug,
  NOW() - INTERVAL '5 days' as published_at,
  NOW() - INTERVAL '6 days' as created_at,
  NOW() - INTERVAL '5 days' as updated_at

UNION ALL

SELECT 
  -- Post 2: Kenya Project - Published
  'Scaling Social Commerce: Lessons from Nairobi Markets' as title,
  '<p>Wowzi has transformed how small businesses in Kenya reach their customers. Through our research, we discovered that social commerce platforms are not just about technology—they''re about understanding local market dynamics.</p><p>In Nairobi, we observed how vendors use WhatsApp groups, Facebook Marketplace, and Instagram to sell products. The key insight: trust is built through personal relationships, not just platform features.</p><p>Our recommendations focus on hybrid models that combine digital convenience with the personal touch that Kenyan consumers value. This approach could be replicated across other African markets.</p><p>One vendor we interviewed explained how she uses multiple platforms simultaneously. WhatsApp for close customers, Facebook for broader reach, and Instagram for showcasing products. This multi-platform strategy is common and effective.</p>' as content,
  'Exploring how social commerce platforms can scale while maintaining the personal connections that drive sales in Kenyan markets.' as excerpt,
  (SELECT id FROM profiles WHERE role = 'student' LIMIT 1) as author_id,
  (SELECT id FROM projects WHERE name LIKE '%Wowzi%' OR name LIKE '%Kenya%' LIMIT 1) as project_id,
  'published' as status,
  'scaling-social-commerce-lessons-nairobi-markets' as slug,
  NOW() - INTERVAL '3 days' as published_at,
  NOW() - INTERVAL '4 days' as created_at,
  NOW() - INTERVAL '3 days' as updated_at

UNION ALL

SELECT 
  -- Post 3: Kenya Cooperatives - Published
  'Building Trust in East African Cooperatives' as title,
  '<p>Cooperatives play a crucial role in rural development across East Africa. Our field work in Kenya revealed both the potential and challenges of cooperative models.</p><p>Successful cooperatives share common characteristics: transparent governance, clear benefit distribution, and strong leadership. We documented best practices from several thriving cooperatives that could serve as models for others.</p><p>The biggest challenge remains trust—both between members and with external partners. Technology can help, but it must be introduced carefully to avoid disrupting existing social structures.</p><p>We found that cooperatives with regular meetings, clear financial reporting, and democratic decision-making processes tend to be most successful. These practices build trust over time and create a sense of ownership among members.</p>' as content,
  'Best practices for establishing and maintaining effective cooperatives in East African communities.' as excerpt,
  (SELECT id FROM profiles WHERE role = 'student' LIMIT 1) as author_id,
  (SELECT id FROM projects WHERE name LIKE '%Cooperatives%' OR name LIKE '%Kenya%' LIMIT 1) as project_id,
  'published' as status,
  'building-trust-east-african-cooperatives' as slug,
  NOW() - INTERVAL '1 day' as published_at,
  NOW() - INTERVAL '2 days' as created_at,
  NOW() - INTERVAL '1 day' as updated_at

UNION ALL

SELECT 
  -- Post 4: Carbon Sequestration - Published
  'Community-Driven Climate Solutions in Kenya' as title,
  '<p>Our carbon sequestration database project has revealed the power of community knowledge. Local farmers in Kenya have been practicing carbon-positive agriculture for generations, often without formal recognition.</p><p>By documenting these practices and creating a searchable database, we''re helping to scale solutions that work. The database includes traditional techniques like agroforestry, crop rotation, and soil management.</p><p>What makes this project unique is its community-driven approach. Farmers contribute their knowledge, and in return, they gain access to best practices from other regions. It''s a model of knowledge sharing that benefits everyone.</p><p>The database now contains over 200 documented practices from farmers across Kenya. Each entry includes details about implementation, expected outcomes, and local adaptations. This resource is becoming invaluable for both researchers and practitioners.</p>' as content,
  'How a community-driven database is helping scale carbon sequestration practices across Kenyan farming communities.' as excerpt,
  (SELECT id FROM profiles WHERE role = 'student' LIMIT 1) as author_id,
  (SELECT id FROM projects WHERE name LIKE '%Carbon%' OR name LIKE '%Kenya%' LIMIT 1) as project_id,
  'published' as status,
  'community-driven-climate-solutions-kenya' as slug,
  NOW() - INTERVAL '7 days' as published_at,
  NOW() - INTERVAL '8 days' as created_at,
  NOW() - INTERVAL '7 days' as updated_at

UNION ALL

SELECT 
  -- Post 5: Ecuador Packaging - Published
  'Sustainable Packaging Innovation for Chicha Ice Cream' as title,
  '<p>Ashangas faced a unique challenge: creating sustainable packaging for chicha ice cream that maintains product quality while reducing environmental impact. Traditional packaging materials weren''t suitable for the product''s specific needs.</p><p>Through extensive testing, we developed a biodegradable packaging solution made from local materials. The key was finding the right balance between barrier properties and compostability.</p><p>This project demonstrates how sustainability and business viability can go hand in hand. The new packaging not only reduces environmental impact but also appeals to environmentally conscious consumers.</p><p>Testing involved multiple iterations. We had to ensure the packaging could maintain freezer temperatures, prevent freezer burn, and decompose properly when disposed. The final solution uses a combination of plant-based materials that are both effective and sustainable.</p>' as content,
  'Developing biodegradable packaging solutions for traditional Ecuadorian ice cream products.' as excerpt,
  (SELECT id FROM profiles WHERE role = 'student' LIMIT 1) as author_id,
  (SELECT id FROM projects WHERE name LIKE '%Ashangas%' OR name LIKE '%Ecuador%' LIMIT 1) as project_id,
  'published' as status,
  'sustainable-packaging-innovation-chicha-ice-cream' as slug,
  NOW() - INTERVAL '2 days' as published_at,
  NOW() - INTERVAL '3 days' as created_at,
  NOW() - INTERVAL '2 days' as updated_at

UNION ALL

SELECT 
  -- Post 6: Ecuador Nutrition - Published
  'Enhancing Nutrition in Traditional Foods' as title,
  '<p>SMART Scoops is working to improve the nutritional profile of chicha ice cream without compromising its traditional taste. This requires understanding both the science of nutrition and the cultural significance of the product.</p><p>We''ve experimented with adding protein, fiber, and essential vitamins while maintaining the authentic flavor that consumers love. The challenge is making these improvements invisible to the consumer experience.</p><p>Early taste tests have been promising. Consumers can''t tell the difference, but the nutritional data shows significant improvements. This could be a model for enhancing other traditional foods.</p><p>The key was working with local nutritionists and food scientists who understood both the technical requirements and cultural context. Their expertise helped us navigate the delicate balance between improvement and preservation.</p>' as content,
  'Balancing nutritional enhancement with traditional taste in Ecuadorian ice cream products.' as excerpt,
  (SELECT id FROM profiles WHERE role = 'student' LIMIT 1) as author_id,
  (SELECT id FROM projects WHERE name LIKE '%SMART Scoops%' OR name LIKE '%Ecuador%' LIMIT 1) as project_id,
  'published' as status,
  'enhancing-nutrition-traditional-foods' as slug,
  NOW() - INTERVAL '4 days' as published_at,
  NOW() - INTERVAL '5 days' as created_at,
  NOW() - INTERVAL '4 days' as updated_at

UNION ALL

SELECT 
  -- Post 7: Draft post
  'Field Notes: First Week in Nairobi' as title,
  '<p>My first week in Nairobi has been overwhelming in the best way. The markets are vibrant, the people are welcoming, and I''m learning so much about how business actually works here.</p><p>Observations so far:</p><ul><li>Cash is still king, but mobile money is everywhere</li><li>Personal relationships matter more than I expected</li><li>Vendors are incredibly resourceful</li></ul><p>More thoughts to come as I continue my research...</p>' as content,
  'Initial observations from my first week of field research in Nairobi markets.' as excerpt,
  (SELECT id FROM profiles WHERE role = 'student' LIMIT 1) as author_id,
  (SELECT id FROM projects WHERE name LIKE '%Kenya%' LIMIT 1) as project_id,
  'draft' as status,
  'field-notes-first-week-nairobi' as slug,
  NULL as published_at,
  NOW() - INTERVAL '1 day' as created_at,
  NOW() - INTERVAL '1 day' as updated_at

UNION ALL

SELECT 
  -- Post 8: Reflection post - No project
  'What I Learned About Cross-Cultural Business' as title,
  '<p>This semester has fundamentally changed how I think about business. Working on projects across three continents has taught me that business models don''t translate directly—they need to be adapted to local contexts.</p><p>The most important lesson: listen first, propose second. Too often, we come in with solutions before understanding the problem from the local perspective.</p><p>I''m grateful for the opportunity to work with communities directly and learn from their expertise. This experience will shape my career in ways I can''t yet fully articulate.</p><p>Each project has taught me something different. In Taiwan, I learned about preserving tradition while innovating. In Kenya, I learned about building trust in communities. In Ecuador, I learned about balancing sustainability with business needs. These lessons are invaluable.</p>' as content,
  'Personal reflections on cross-cultural business practices and the importance of local knowledge.' as excerpt,
  (SELECT id FROM profiles WHERE role = 'student' LIMIT 1) as author_id,
  NULL as project_id,
  'published' as status,
  'what-i-learned-about-cross-cultural-business' as slug,
  NOW() - INTERVAL '6 days' as published_at,
  NOW() - INTERVAL '7 days' as created_at,
  NOW() - INTERVAL '6 days' as updated_at

UNION ALL

SELECT 
  -- Post 9: Technology in Agriculture - Published
  'Digital Tools for Smallholder Farmers' as title,
  '<p>Mobile technology is revolutionizing agriculture in developing countries. During our research, we''ve seen how simple apps can help farmers access market prices, weather forecasts, and agricultural advice.</p><p>The challenge isn''t the technology itself—it''s making it accessible and useful for farmers who may have limited digital literacy. We''ve been working on user-friendly interfaces that work on basic smartphones.</p><p>Early adopters are seeing real benefits: better prices for their crops, reduced losses from weather events, and access to expert advice. The key is keeping it simple and relevant.</p><p>One farmer we worked with increased his income by 30% simply by using a price comparison app. He could now check prices at different markets before deciding where to sell. This kind of practical benefit drives adoption.</p>' as content,
  'How mobile technology is helping smallholder farmers improve their livelihoods and access better markets.' as excerpt,
  (SELECT id FROM profiles WHERE role = 'student' LIMIT 1) as author_id,
  (SELECT id FROM projects LIMIT 1) as project_id,
  'published' as status,
  'digital-tools-smallholder-farmers' as slug,
  NOW() - INTERVAL '10 days' as published_at,
  NOW() - INTERVAL '11 days' as created_at,
  NOW() - INTERVAL '10 days' as updated_at

UNION ALL

SELECT 
  -- Post 10: Women in Business - Published
  'Empowering Women Entrepreneurs in Rural Communities' as title,
  '<p>Women entrepreneurs face unique challenges in rural communities, but they also bring unique strengths. Our research has focused on understanding these dynamics and supporting women-led businesses.</p><p>Access to capital remains a major barrier, but we''ve found that microfinance and community savings groups can be effective solutions. The key is building trust and providing ongoing support.</p><p>Women entrepreneurs often excel at building community relationships and understanding local needs. These skills are invaluable but often undervalued in traditional business metrics.</p><p>We''ve documented several success stories of women who started small businesses and grew them into thriving enterprises. Their stories show the importance of mentorship, access to networks, and flexible financing options.</p>' as content,
  'Exploring the challenges and opportunities for women entrepreneurs in rural communities and how to better support them.' as excerpt,
  (SELECT id FROM profiles WHERE role = 'student' LIMIT 1) as author_id,
  (SELECT id FROM projects LIMIT 1) as project_id,
  'published' as status,
  'empowering-women-entrepreneurs-rural-communities' as slug,
  NOW() - INTERVAL '8 days' as published_at,
  NOW() - INTERVAL '9 days' as created_at,
  NOW() - INTERVAL '8 days' as updated_at

UNION ALL

SELECT 
  -- Post 11: Supply Chain - Published
  'Building Resilient Supply Chains in Emerging Markets' as title,
  '<p>Supply chain disruptions have highlighted the importance of building resilient systems. In emerging markets, this challenge is even greater due to infrastructure limitations and economic volatility.</p><p>We''ve been studying how small businesses can build more resilient supply chains without massive investments. The answer often lies in diversification and local partnerships.</p><p>Local sourcing, multiple suppliers, and flexible logistics arrangements can make a huge difference. These strategies don''t require large capital investments but do require relationship building.</p><p>One business we worked with survived a major supply disruption because they had developed relationships with three different suppliers. When one couldn''t deliver, the others stepped in. This kind of resilience is built over time through trust and mutual benefit.</p>' as content,
  'Strategies for building resilient supply chains that can withstand disruptions in emerging market contexts.' as excerpt,
  (SELECT id FROM profiles WHERE role = 'student' LIMIT 1) as author_id,
  NULL as project_id,
  'published' as status,
  'building-resilient-supply-chains-emerging-markets' as slug,
  NOW() - INTERVAL '12 days' as published_at,
  NOW() - INTERVAL '13 days' as created_at,
  NOW() - INTERVAL '12 days' as updated_at

UNION ALL

SELECT 
  -- Post 12: Draft - Research Methodology
  'Methodology: Conducting Field Research Abroad' as title,
  '<p>I''ve been reflecting on our research methodology and how we adapted it for different cultural contexts. Some approaches that work well in one place don''t translate to another.</p><p>Key learnings:</p><ul><li>Always work with local partners</li><li>Be flexible with your timeline</li><li>Build relationships before asking for data</li><li>Respect local customs and practices</li></ul><p>This is still a work in progress, but I wanted to document these early thoughts.</p>' as content,
  'Reflections on adapting research methodologies for cross-cultural field work.' as excerpt,
  (SELECT id FROM profiles WHERE role = 'student' LIMIT 1) as author_id,
  NULL as project_id,
  'draft' as status,
  'methodology-conducting-field-research-abroad' as slug,
  NULL as published_at,
  NOW() - INTERVAL '2 days' as created_at,
  NOW() - INTERVAL '2 days' as updated_at

UNION ALL

SELECT 
  -- Post 13: Microfinance - Published
  'The Role of Microfinance in Economic Development' as title,
  '<p>Microfinance has been both praised and criticized, but our research shows that its impact depends heavily on implementation. When done well, it can be transformative for small businesses.</p><p>The most successful microfinance programs combine access to capital with business training and ongoing support. It''s not just about the money—it''s about building capacity.</p><p>We''ve seen businesses grow from subsistence operations to thriving enterprises with the right combination of financing and support. The key is understanding local context and adapting programs accordingly.</p><p>Interest rates are often a point of contention, but we found that when combined with proper support, even higher rates can be sustainable if they enable business growth. The focus should be on outcomes, not just rates.</p>' as content,
  'Examining how microfinance can effectively support economic development when properly implemented with business support.' as excerpt,
  (SELECT id FROM profiles WHERE role = 'student' LIMIT 1) as author_id,
  (SELECT id FROM projects LIMIT 1) as project_id,
  'published' as status,
  'role-microfinance-economic-development' as slug,
  NOW() - INTERVAL '14 days' as published_at,
  NOW() - INTERVAL '15 days' as created_at,
  NOW() - INTERVAL '14 days' as updated_at

UNION ALL

SELECT 
  -- Post 14: Food Security - Published
  'Innovative Approaches to Food Security' as title,
  '<p>Food security remains a critical challenge in many regions. Our research has focused on innovative approaches that combine traditional knowledge with modern techniques.</p><p>One promising area is urban agriculture. In cities across Africa and Asia, we''ve seen how small-scale urban farming can improve food access while creating economic opportunities.</p><p>Another key area is reducing food waste. In many developing countries, significant food is lost between harvest and consumption. Simple interventions can make a big difference.</p><p>We''ve documented several successful programs that combine multiple approaches: improved storage, better transportation, and direct farmer-to-consumer connections. These integrated solutions show the most promise.</p>' as content,
  'Exploring innovative solutions to food security challenges in developing regions.' as excerpt,
  (SELECT id FROM profiles WHERE role = 'student' LIMIT 1) as author_id,
  NULL as project_id,
  'published' as status,
  'innovative-approaches-food-security' as slug,
  NOW() - INTERVAL '9 days' as published_at,
  NOW() - INTERVAL '10 days' as created_at,
  NOW() - INTERVAL '9 days' as updated_at

UNION ALL

SELECT 
  -- Post 15: Draft - Personal Reflection
  'Personal Growth Through Field Work' as title,
  '<p>This experience has been transformative for me personally. I came into this program thinking I knew a lot about business and development, but I''ve learned how much I still have to learn.</p><p>The most humbling moments have been when local partners corrected my assumptions or showed me perspectives I hadn''t considered. These moments of learning are what make this work so valuable.</p><p>I''m still processing everything I''ve learned and experienced. This post is more of a personal journal entry than a formal blog post, but I wanted to capture these thoughts while they''re fresh.</p>' as content,
  'Personal reflections on growth and learning through field research experiences.' as excerpt,
  (SELECT id FROM profiles WHERE role = 'student' LIMIT 1) as author_id,
  NULL as project_id,
  'draft' as status,
  'personal-growth-through-field-work' as slug,
  NULL as published_at,
  NOW() - INTERVAL '3 days' as created_at,
  NOW() - INTERVAL '3 days' as updated_at

UNION ALL

SELECT 
  -- Post 16: E-commerce - Published
  'E-commerce Adoption in Rural Markets' as title,
  '<p>E-commerce is growing rapidly in urban areas, but rural adoption has been slower. We''ve been studying what drives or prevents e-commerce adoption in rural communities.</p><p>Infrastructure is one barrier, but not the only one. Trust, payment methods, and delivery logistics all play crucial roles. We''ve found that hybrid models work best.</p><p>Successful rural e-commerce often combines online ordering with local pickup points or cash-on-delivery options. This reduces barriers while maintaining convenience.</p><p>One platform we studied increased rural adoption by 200% simply by adding local pickup points and cash payment options. These seemingly small changes made a huge difference in accessibility.</p>' as content,
  'Understanding the factors that influence e-commerce adoption in rural markets and strategies to increase participation.' as excerpt,
  (SELECT id FROM profiles WHERE role = 'student' LIMIT 1) as author_id,
  (SELECT id FROM projects LIMIT 1) as project_id,
  'published' as status,
  'ecommerce-adoption-rural-markets' as slug,
  NOW() - INTERVAL '11 days' as published_at,
  NOW() - INTERVAL '12 days' as created_at,
  NOW() - INTERVAL '11 days' as updated_at

UNION ALL

SELECT 
  -- Post 17: Education - Published
  'Education Technology in Low-Resource Settings' as title,
  '<p>Educational technology has great potential, but implementation in low-resource settings requires careful consideration. We''ve been studying what works and what doesn''t.</p><p>Simple, offline-capable solutions often outperform complex online platforms. The key is understanding local constraints and designing accordingly.</p><p>Teacher training is crucial. Technology alone doesn''t improve education—it needs to be integrated thoughtfully with pedagogy and supported by trained educators.</p><p>We''ve seen programs succeed with basic tablets loaded with educational content, even without internet connectivity. These solutions are more sustainable and effective than complex online platforms that require constant connectivity.</p>' as content,
  'Exploring effective approaches to educational technology in low-resource educational settings.' as excerpt,
  (SELECT id FROM profiles WHERE role = 'student' LIMIT 1) as author_id,
  NULL as project_id,
  'published' as status,
  'education-technology-low-resource-settings' as slug,
  NOW() - INTERVAL '13 days' as published_at,
  NOW() - INTERVAL '14 days' as created_at,
  NOW() - INTERVAL '13 days' as updated_at

UNION ALL

SELECT 
  -- Post 18: Healthcare - Published
  'Mobile Health Solutions for Remote Communities' as title,
  '<p>Mobile health (mHealth) solutions have the potential to improve healthcare access in remote communities. Our research has focused on understanding what makes these solutions effective.</p><p>Successful mHealth programs combine technology with community health workers. The technology enables better data collection and communication, while health workers provide the human connection.</p><p>Simple solutions often work best. SMS-based reminders, basic diagnostic tools, and telemedicine consultations can make a significant difference without requiring complex infrastructure.</p><p>One program we studied reduced maternal mortality by 40% simply by implementing SMS reminders for prenatal care appointments. This low-tech solution had a high impact because it addressed a real need.</p>' as content,
  'Examining how mobile health solutions can improve healthcare access and outcomes in remote communities.' as excerpt,
  (SELECT id FROM profiles WHERE role = 'student' LIMIT 1) as author_id,
  (SELECT id FROM projects LIMIT 1) as project_id,
  'published' as status,
  'mobile-health-solutions-remote-communities' as slug,
  NOW() - INTERVAL '15 days' as published_at,
  NOW() - INTERVAL '16 days' as created_at,
  NOW() - INTERVAL '15 days' as updated_at

UNION ALL

SELECT 
  -- Post 19: Draft - Case Study
  'Case Study: Successful Cooperative Model' as title,
  '<p>I''m working on a detailed case study of a cooperative that has been particularly successful. They''ve managed to grow while maintaining democratic governance and equitable benefit distribution.</p><p>Key factors I''ve identified so far:</p><ul><li>Strong leadership that rotates regularly</li><li>Transparent financial reporting</li><li>Regular member meetings</li><li>Clear conflict resolution processes</li></ul><p>I need to do more analysis before this is ready to publish, but the initial findings are promising. This could be a model for other cooperatives.</p>' as content,
  'An in-progress case study of a successful cooperative model with lessons for replication.' as excerpt,
  (SELECT id FROM profiles WHERE role = 'student' LIMIT 1) as author_id,
  (SELECT id FROM projects WHERE name LIKE '%Cooperatives%' LIMIT 1) as project_id,
  'draft' as status,
  'case-study-successful-cooperative-model' as slug,
  NULL as published_at,
  NOW() - INTERVAL '4 days' as created_at,
  NOW() - INTERVAL '4 days' as updated_at

UNION ALL

SELECT 
  -- Post 20: Renewable Energy - Published
  'Solar Power Solutions for Off-Grid Communities' as title,
  '<p>Solar power is becoming increasingly viable for off-grid communities, but implementation challenges remain. We''ve been studying what makes solar projects successful in rural areas.</p><p>Community ownership models tend to be more sustainable than individual installations. When communities invest together, they''re more likely to maintain and protect the systems.</p><p>Training local technicians is crucial. Without local capacity for maintenance and repair, solar systems can fail quickly. We''ve seen programs succeed by investing in local training.</p><p>One community we worked with now generates enough solar power to run a small business center and charge mobile devices. This has created new economic opportunities while improving quality of life.</p>' as content,
  'Exploring how solar power solutions can be effectively implemented in off-grid communities to create sustainable energy access.' as excerpt,
  (SELECT id FROM profiles WHERE role = 'student' LIMIT 1) as author_id,
  NULL as project_id,
  'published' as status,
  'solar-power-solutions-off-grid-communities' as slug,
  NOW() - INTERVAL '16 days' as published_at,
  NOW() - INTERVAL '17 days' as created_at,
  NOW() - INTERVAL '16 days' as updated_at

ON CONFLICT (slug) DO NOTHING;

-- Verify the posts were created
SELECT 
  bp.title,
  bp.status,
  p.name as project_name,
  pr.username as author,
  bp.published_at
FROM blog_posts bp
LEFT JOIN projects p ON bp.project_id = p.id
LEFT JOIN profiles pr ON bp.author_id = pr.id
ORDER BY bp.created_at DESC;
