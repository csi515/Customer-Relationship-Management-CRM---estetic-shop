-- Supabase CRM 시스템 테스트 데이터 삽입 스크립트 (수정된 버전)
-- 이 스크립트를 Supabase Dashboard의 SQL Editor에서 실행하세요

-- 1. 테스트 고객 데이터 삽입
INSERT INTO customers (name, phone, birth_date, skin_type, memo, point) VALUES 
('김미영', '010-1234-5678', '1990-05-15', 'combination', '첫 번째 고객, 복합성 피부', 0),
('이수진', '010-2345-6789', '1988-12-03', 'dry', '건성 피부 고객, 보습 관리 필요', 500),
('박지영', '010-3456-7890', '1992-08-22', 'oily', '지성 피부, 모공 관리 중점', 1000),
('최민수', '010-4567-8901', '1985-03-10', 'sensitive', '민감성 피부, 알레르기 주의', 200),
('정하나', '010-5678-9012', '1995-11-28', 'normal', '정상 피부, 기본 관리만 필요', 300);

-- 2. 테스트 상품 데이터 삽입
INSERT INTO products (name, price, type, count, status, description) VALUES 
('기본 페이셜', 50000, 'single', NULL, 'active', '기본적인 얼굴 관리, 클렌징 + 마사지 + 마스크'),
('프리미엄 페이셜', 80000, 'single', NULL, 'active', '고급 얼굴 관리, 추가 에센스와 특수 마스크 포함'),
('기본 패키지 (5회)', 200000, 'voucher', 5, 'active', '기본 페이셜 5회 이용 가능한 패키지'),
('프리미엄 패키지 (5회)', 350000, 'voucher', 5, 'active', '프리미엄 페이셜 5회 이용 가능한 패키지'),
('아쿠아필링', 120000, 'single', NULL, 'active', '수분 공급과 각질 제거를 동시에'),
('LED 관리', 60000, 'single', NULL, 'active', 'LED 조명을 이용한 피부 재생 관리'),
('마이크로니들링', 150000, 'single', NULL, 'active', '미세한 바늘을 이용한 피부 재생 치료'),
('VIP 패키지 (10회)', 600000, 'voucher', 10, 'active', '모든 서비스 자유 선택 가능한 VIP 패키지');

-- 3. 테스트 예약 데이터 삽입
INSERT INTO appointments (customer_id, product_id, datetime, memo, status) VALUES 
((SELECT id FROM customers WHERE name = '김미영' LIMIT 1),
 (SELECT id FROM products WHERE name = '기본 페이셜' LIMIT 1),
 NOW() + INTERVAL '2 days', '첫 방문 고객, 피부 상태 상담 필요', 'scheduled'),

((SELECT id FROM customers WHERE name = '이수진' LIMIT 1),
 (SELECT id FROM products WHERE name = '프리미엄 페이셜' LIMIT 1),
 NOW() + INTERVAL '1 day', '정기 고객, 건성 피부 특별 관리', 'scheduled'),

((SELECT id FROM customers WHERE name = '박지영' LIMIT 1),
 (SELECT id FROM products WHERE name = '아쿠아필링' LIMIT 1),
 NOW() - INTERVAL '3 days', '지성 피부 관리 완료', 'completed'),

((SELECT id FROM customers WHERE name = '최민수' LIMIT 1),
 (SELECT id FROM products WHERE name = 'LED 관리' LIMIT 1),
 NOW() - INTERVAL '1 week', '민감성 피부 안전 관리 완료', 'completed');

-- 4. 테스트 구매 내역 데이터 삽입
INSERT INTO purchases (customer_id, product_id, quantity, purchase_date) VALUES 
((SELECT id FROM customers WHERE name = '김미영' LIMIT 1),
 (SELECT id FROM products WHERE name = '기본 패키지 (5회)' LIMIT 1),
 1, NOW() - INTERVAL '1 week'),

((SELECT id FROM customers WHERE name = '이수진' LIMIT 1),
 (SELECT id FROM products WHERE name = '프리미엄 패키지 (5회)' LIMIT 1),
 1, NOW() - INTERVAL '2 weeks'),

((SELECT id FROM customers WHERE name = '정하나' LIMIT 1),
 (SELECT id FROM products WHERE name = 'VIP 패키지 (10회)' LIMIT 1),
 1, NOW() - INTERVAL '1 month');

-- 5. 테스트 재무 데이터 삽입
INSERT INTO finance (date, type, title, amount, memo) VALUES 
-- 수입 데이터
(CURRENT_DATE - INTERVAL '1 day', 'income', '기본 페이셜 매출', 50000, '김미영 고객'),
(CURRENT_DATE - INTERVAL '2 days', 'income', '프리미엄 패키지 매출', 350000, '이수진 고객'),
(CURRENT_DATE - INTERVAL '3 days', 'income', '아쿠아필링 매출', 120000, '박지영 고객'),
(CURRENT_DATE - INTERVAL '1 week', 'income', 'VIP 패키지 매출', 600000, '정하나 고객'),

-- 지출 데이터
(CURRENT_DATE - INTERVAL '1 day', 'expense', '화장품 재고 구매', 150000, '에센스, 마스크 등'),
(CURRENT_DATE - INTERVAL '3 days', 'expense', '장비 유지보수', 50000, 'LED 장비 점검'),
(CURRENT_DATE - INTERVAL '1 week', 'expense', '월세', 800000, '샵 월세'),
(CURRENT_DATE - INTERVAL '1 week', 'expense', '전기세', 120000, '월 전기세');

-- 6. 테스트 설정 데이터 삽입
INSERT INTO settings (business_name, business_phone, business_address, business_hours, default_appointment_duration, language) VALUES 
('예우스킨 에스테틱', 
 '02-1234-5678', 
 '서울시 강남구 테헤란로 123, 4층', 
 '평일 10:00-20:00, 토요일 10:00-18:00, 일요일 휴무', 
 60, 
 'ko');

-- 7. 데이터 확인
SELECT 'Test data insertion completed!' as status;

-- 8. 삽입된 데이터 확인
SELECT 'Customers:' as table_name, COUNT(*) as count FROM customers
UNION ALL
SELECT 'Products:', COUNT(*) FROM products
UNION ALL
SELECT 'Appointments:', COUNT(*) FROM appointments
UNION ALL
SELECT 'Purchases:', COUNT(*) FROM purchases
UNION ALL
SELECT 'Finance:', COUNT(*) FROM finance
UNION ALL
SELECT 'Settings:', COUNT(*) FROM settings;

-- 9. 샘플 데이터 조회
SELECT 'Sample customers:' as info;
SELECT name, phone, skin_type, point FROM customers LIMIT 3;

SELECT 'Sample products:' as info;
SELECT name, price, type, status FROM products LIMIT 3;

SELECT 'Sample appointments:' as info;
SELECT 
    c.name as customer_name,
    p.name as product_name,
    a.datetime,
    a.status
FROM appointments a
JOIN customers c ON a.customer_id = c.id
JOIN products p ON a.product_id = p.id
LIMIT 3; 