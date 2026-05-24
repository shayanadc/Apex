-- Test-container init script.
-- No CREATE DATABASE / USE statements — MySQL entrypoint already connects
-- to the database named by MYSQL_DATABASE (apex_nevada_test).
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED         NOT NULL AUTO_INCREMENT,
  name          VARCHAR(100)         NOT NULL,
  email         VARCHAR(255)         NOT NULL,
  password      VARCHAR(255)         NOT NULL,
  access_token  VARCHAR(512)         NULL,
  role          ENUM('USER','ADMIN') NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
