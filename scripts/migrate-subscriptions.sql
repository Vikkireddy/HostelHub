

USE hostelhub;

CREATE TABLE IF NOT EXISTS subscription_plans (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price_monthly DECIMAL(10, 2) NOT NULL,
  max_students INT NULL,
  features JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hostel_subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hostel_id INT NOT NULL,
  plan_id VARCHAR(50) NOT NULL,
  status ENUM('active', 'expired', 'cancelled', 'trial', 'grace_period', 'payment_failed') NOT NULL DEFAULT 'active',
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  cancelled_at TIMESTAMP NULL,
  grace_period_ends_at TIMESTAMP NULL,
  trial_ends_at TIMESTAMP NULL,
  last_payment_at TIMESTAMP NULL,
  is_owner_managed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_hostel_active (hostel_id),
  FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES subscription_plans(id)
);

INSERT INTO subscription_plans (id, name, price_monthly, max_students, features) VALUES
('basic', 'Basic', 149, 14, '["Up to 14 members", "Room Management", "Payment Tracking"]'),
('pro', 'Pro', 299, 34, '["Up to 34 members", "Reports & Analytics", "Expense & profit tracking"]'),
('enterprise', 'Enterprise', 799, NULL, '["Unlimited members", "Multi Hostel", "Priority Support"]')
ON DUPLICATE KEY UPDATE name=VALUES(name), price_monthly=VALUES(price_monthly), max_students=VALUES(max_students), features=VALUES(features);

INSERT INTO hostel_subscriptions (hostel_id, plan_id, status, expires_at)
SELECT h.id, 'pro', 'active', DATE_ADD(NOW(), INTERVAL 1 MONTH)
FROM hostels h
WHERE h.name = 'Default Hostel'
AND NOT EXISTS (SELECT 1 FROM hostel_subscriptions hs WHERE hs.hostel_id = h.id)
LIMIT 1;
