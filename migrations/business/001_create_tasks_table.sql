-- Create tasks table
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  author_id TEXT NOT NULL,
  assigned_user_id TEXT,
  filename VARCHAR(255),
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tasks_author_id FOREIGN KEY (author_id) REFERENCES users(id),
  CONSTRAINT fk_tasks_assigned_user_id FOREIGN KEY (assigned_user_id) REFERENCES users(id)
);
