-- Update admin user (ID 1) to mark AST workshop as completed
UPDATE users 
SET 
  ast_workshop_completed = true,
  ast_completed_at = NOW()
WHERE id = 1 AND username = 'admin';

-- Check the result
SELECT id, username, name, ast_workshop_completed, ast_completed_at 
FROM users 
WHERE ast_workshop_completed = true 
ORDER BY id;