#!/usr/bin/env node

// This script imports test data from the JSON file into the database
// Usage: node import-test-data.js

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'evently',
};

async function importTestData() {
  let connection;
  
  try {
    console.log('Reading test data file...');
    const testDataPath = path.join(__dirname, 'test-data.json');
    
    if (!fs.existsSync(testDataPath)) {
      console.error('Test data file not found. Please run generate-test-data.js first.');
      process.exit(1);
    }
    
    const data = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));
    
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    // Start transaction
    await connection.beginTransaction();
    
    // Clear existing data from tables (in reverse order to avoid foreign key constraints)
    console.log('Clearing existing data...');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    await connection.execute('TRUNCATE TABLE waitlist_entry');
    await connection.execute('TRUNCATE TABLE booking');
    await connection.execute('TRUNCATE TABLE seat');
    await connection.execute('TRUNCATE TABLE event');
    await connection.execute('TRUNCATE TABLE venue');
    await connection.execute('TRUNCATE TABLE user');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    
    // Import users
    console.log('Importing users...');
    for (const user of data.users) {
      await connection.execute(
        `INSERT INTO user (
          id, first_name, last_name, email, password, role, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.id,
          user.firstName,
          user.lastName,
          user.email,
          user.password,
          user.role,
          user.createdAt,
          user.updatedAt
        ]
      );
    }
    
    // Import venues
    console.log('Importing venues...');
    for (const venue of data.venues) {
      await connection.execute(
        `INSERT INTO venue (
          id, name, address, city, state, zip_code, country, total_capacity,
          has_seating, description, creator_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          venue.id,
          venue.name,
          venue.address,
          venue.city,
          venue.state,
          venue.zipCode,
          venue.country,
          venue.totalCapacity,
          venue.hasSeating ? 1 : 0,
          venue.description,
          venue.creatorId,
          venue.createdAt,
          venue.updatedAt
        ]
      );
    }
    
    // Import events
    console.log('Importing events...');
    for (const event of data.events) {
      await connection.execute(
        `INSERT INTO event (
          id, name, description, start_date, end_date, capacity, booked_seats,
          is_featured, status, ticket_price, has_waitlist, max_waitlist_size,
          has_seating, published_at, creator_id, venue_id, created_at, updated_at, version
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          event.id,
          event.name,
          event.description,
          event.startDate,
          event.endDate,
          event.capacity,
          event.bookedSeats,
          event.isFeatured ? 1 : 0,
          event.status,
          event.ticketPrice,
          event.hasWaitlist ? 1 : 0,
          event.maxWaitlistSize,
          event.hasSeating ? 1 : 0,
          event.publishedAt,
          event.creatorId,
          event.venueId,
          event.createdAt,
          event.updatedAt,
          event.version
        ]
      );
    }
    
    // Import seats
    console.log('Importing seats...');
    for (const seat of data.seats) {
      await connection.execute(
        `INSERT INTO seat (
          id, row_name, seat_number, status, is_active, notes,
          is_accessible, section, venue_id, event_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          seat.id,
          seat.rowName,
          seat.seatNumber,
          seat.status,
          seat.isActive ? 1 : 0,
          seat.notes,
          seat.isAccessible ? 1 : 0,
          seat.section,
          seat.venueId,
          seat.eventId,
          seat.createdAt,
          seat.updatedAt
        ]
      );
    }
    
    // Import bookings
    console.log('Importing bookings...');
    for (const booking of data.bookings) {
      await connection.execute(
        `INSERT INTO booking (
          id, number_of_tickets, status, total_amount, cancellation_reason,
          payment_reference, payment_date, user_id, event_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          booking.id,
          booking.numberOfTickets,
          booking.status,
          booking.totalAmount,
          booking.cancellationReason,
          booking.paymentReference,
          booking.paymentDate,
          booking.userId,
          booking.eventId,
          booking.createdAt,
          booking.updatedAt
        ]
      );
    }
    
    // Import waitlist entries
    console.log('Importing waitlist entries...');
    for (const entry of data.waitlistEntries) {
      await connection.execute(
        `INSERT INTO waitlist_entry (
          id, name, email, phone, number_of_tickets, status, notified_at,
          expires_at, user_id, event_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          entry.id,
          entry.name,
          entry.email,
          entry.phone,
          entry.numberOfTickets,
          entry.status,
          entry.notifiedAt,
          entry.expiresAt,
          entry.userId,
          entry.eventId,
          entry.createdAt,
          entry.updatedAt
        ]
      );
    }
    
    // Commit transaction
    await connection.commit();
    
    console.log('Test data imported successfully!');
    console.log('Summary:');
    console.log(`- Users: ${data.users.length}`);
    console.log(`- Venues: ${data.venues.length}`);
    console.log(`- Events: ${data.events.length}`);
    console.log(`- Seats: ${data.seats.length}`);
    console.log(`- Bookings: ${data.bookings.length}`);
    console.log(`- Waitlist Entries: ${data.waitlistEntries.length}`);
    
  } catch (error) {
    console.error('Error importing test data:', error);
    
    // Rollback transaction on error
    if (connection) {
      await connection.rollback();
    }
    
    process.exit(1);
  } finally {
    // Close database connection
    if (connection) {
      await connection.end();
    }
  }
}

importTestData();
