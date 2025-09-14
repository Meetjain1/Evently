-- PostgreSQL version of the setup script
CREATE DATABASE evently_db;
CREATE USER evently_user WITH ENCRYPTED PASSWORD 'Evently@123';
GRANT ALL PRIVILEGES ON DATABASE evently_db TO evently_user;
