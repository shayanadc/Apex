-- Match this database name to your DB_NAME environment variable
CREATE DATABASE IF NOT EXISTS apex_nevada;
USE apex_nevada;

CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  name          VARCHAR(100)     NOT NULL,
  email         VARCHAR(255)     NOT NULL,
  password      VARCHAR(255)     NOT NULL,
  access_token  VARCHAR(512)     NULL,
  role          ENUM('USER','ADMIN') NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
