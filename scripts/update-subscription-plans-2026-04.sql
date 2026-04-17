USE hostelhub;

UPDATE subscription_plans SET
  name = 'Base',
  price_monthly = 399,
  max_students = 50,
  features = '["Up to 50 students", "Students, rooms & payments", "CSV import/export", "Dashboard overview"]'
WHERE id = 'basic';

UPDATE subscription_plans SET
  name = 'Pro',
  price_monthly = 699,
  max_students = 100,
  features = '["Up to 100 students", "Income vs expenses & charts", "Planned vacates on dashboard", "Admin expenses"]'
WHERE id = 'pro';

UPDATE subscription_plans SET
  name = 'Pro Plus',
  price_monthly = 999,
  max_students = NULL,
  features = '["Unlimited students", "Everything in Pro", "Priority support", "Multi-hostel ready"]'
WHERE id = 'enterprise';
