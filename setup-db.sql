CREATE DATABASE IF NOT EXISTS evently_db;
CREATE USER IF NOT EXISTS 'evently_user'@'localhost' IDENTIFIED BY 'Evently@123';
GRANT ALL PRIVILEGES ON evently_db.* TO 'evently_user'@'localhost';
FLUSH PRIVILEGES;
