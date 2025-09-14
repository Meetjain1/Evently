/**
 * This script converts MySQL schema to PostgreSQL compatible schema
 */
import fs from 'fs';
import path from 'path';

// Read the MySQL schema file
const mysqlSchema = fs.readFileSync(path.join(__dirname, '../schema-updated.sql'), 'utf8');

// Helper function to convert MySQL data types to PostgreSQL
function convertDataType(mysqlType: string): string {
    // Convert common MySQL types to PostgreSQL types
    if (mysqlType.includes('int')) return 'integer';
    if (mysqlType.includes('varchar')) return mysqlType.replace('varchar', 'character varying');
    if (mysqlType === 'datetime') return 'timestamp';
    if (mysqlType === 'tinyint(1)') return 'boolean';
    if (mysqlType === 'text') return 'text';
    if (mysqlType.includes('decimal')) return mysqlType;
    
    // Default return the original type
    return mysqlType;
}

// Convert MySQL schema to PostgreSQL
function convertToPostgres(mysqlSchema: string): string {
    let postgresSchema = mysqlSchema;
    
    // Replace MySQL-specific syntax with PostgreSQL syntax
    postgresSchema = postgresSchema
        // Replace ENGINE=InnoDB
        .replace(/ENGINE\s*=\s*InnoDB/gi, '')
        // Replace AUTO_INCREMENT with SERIAL
        .replace(/AUTO_INCREMENT/gi, '')
        // Replace INT NOT NULL AUTO_INCREMENT PRIMARY KEY with SERIAL PRIMARY KEY
        .replace(/int(\(\d+\))?\s+NOT\s+NULL\s+AUTO_INCREMENT\s+PRIMARY\s+KEY/gi, 'SERIAL PRIMARY KEY')
        // Replace backticks with double quotes for identifiers
        .replace(/`/g, '"')
        // Replace IF NOT EXISTS with simple CREATE (PostgreSQL handles this differently)
        .replace(/CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS/gi, 'CREATE TABLE')
        // Handle default CURRENT_TIMESTAMP
        .replace(/DEFAULT\s+CURRENT_TIMESTAMP/gi, 'DEFAULT CURRENT_TIMESTAMP');
    
    return postgresSchema;
}

// Convert and write the PostgreSQL schema
const postgresSchema = convertToPostgres(mysqlSchema);
fs.writeFileSync(path.join(__dirname, '../schema-postgres.sql'), postgresSchema, 'utf8');

console.log('PostgreSQL schema file generated: schema-postgres.sql');
