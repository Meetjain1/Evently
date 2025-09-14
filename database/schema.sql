-- MySQL Schema for Evently Application

-- Create Database (if not exists)
CREATE DATABASE IF NOT EXISTS evently_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE evently_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  firstName VARCHAR(255) NOT NULL,
  lastName VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Venues Table
CREATE TABLE IF NOT EXISTS venues (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  zipCode VARCHAR(20),
  country VARCHAR(100) NOT NULL,
  totalCapacity INT NOT NULL,
  hasSeating BOOLEAN NOT NULL DEFAULT TRUE,
  description TEXT,
  creatorId VARCHAR(36) NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (creatorId) REFERENCES users(id) ON DELETE CASCADE
);

-- Events Table
CREATE TABLE IF NOT EXISTS events (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  startDate TIMESTAMP NOT NULL,
  endDate TIMESTAMP NOT NULL,
  capacity INT NOT NULL,
  bookedSeats INT NOT NULL DEFAULT 0,
  isFeatured BOOLEAN NOT NULL DEFAULT FALSE,
  status ENUM('draft', 'published', 'cancelled', 'completed') NOT NULL DEFAULT 'draft',
  ticketPrice DECIMAL(10, 2) NOT NULL,
  hasWaitlist BOOLEAN NOT NULL DEFAULT FALSE,
  maxWaitlistSize INT,
  hasSeating BOOLEAN NOT NULL DEFAULT FALSE,
  publishedAt TIMESTAMP NULL,
  creatorId VARCHAR(36) NOT NULL,
  venueId VARCHAR(36) NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  version INT NOT NULL DEFAULT 1,
  FOREIGN KEY (creatorId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (venueId) REFERENCES venues(id) ON DELETE CASCADE
);

-- Seats Table
CREATE TABLE IF NOT EXISTS seats (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  rowName VARCHAR(10) NOT NULL,
  seatNumber INT NOT NULL,
  status ENUM('available', 'booked', 'reserved', 'blocked', 'maintenance') NOT NULL DEFAULT 'available',
  isActive BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  isAccessible BOOLEAN NOT NULL DEFAULT FALSE,
  section VARCHAR(100),
  venueId VARCHAR(36) NOT NULL,
  eventId VARCHAR(36),
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (venueId) REFERENCES venues(id) ON DELETE CASCADE,
  FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE SET NULL,
  UNIQUE KEY venue_seat_unique (venueId, rowName, seatNumber)
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  numberOfTickets INT NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled') NOT NULL DEFAULT 'pending',
  totalAmount DECIMAL(10, 2) NOT NULL,
  cancellationReason TEXT,
  paymentReference VARCHAR(255),
  paymentDate TIMESTAMP NULL,
  userId VARCHAR(36) NOT NULL,
  eventId VARCHAR(36) NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE
);

-- Booked Seats Table (connecting bookings to seats)
CREATE TABLE IF NOT EXISTS booked_seats (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  bookingId VARCHAR(36) NOT NULL,
  seatId VARCHAR(36) NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (bookingId) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (seatId) REFERENCES seats(id) ON DELETE CASCADE,
  UNIQUE KEY booking_seat_unique (bookingId, seatId)
);

-- Waitlist Entries Table
CREATE TABLE IF NOT EXISTS waitlist_entries (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  numberOfTickets INT NOT NULL DEFAULT 1,
  status ENUM('waiting', 'notified', 'confirmed', 'expired') NOT NULL DEFAULT 'waiting',
  notifiedAt TIMESTAMP NULL,
  expiresAt TIMESTAMP NULL,
  userId VARCHAR(36),
  eventId VARCHAR(36) NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE
);

-- TypeORM Metadata Table
CREATE TABLE IF NOT EXISTS typeorm_metadata (
  type VARCHAR(255) NOT NULL,
  database VARCHAR(255),
  schema VARCHAR(255),
  table VARCHAR(255),
  name VARCHAR(255),
  value TEXT
);

-- Indexes for improved performance
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_venue ON events(venueId);
CREATE INDEX idx_events_creator ON events(creatorId);
CREATE INDEX idx_bookings_user ON bookings(userId);
CREATE INDEX idx_bookings_event ON bookings(eventId);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_seats_venue ON seats(venueId);
CREATE INDEX idx_seats_event ON seats(eventId);
CREATE INDEX idx_seats_status ON seats(status);
CREATE INDEX idx_waitlist_event ON waitlist_entries(eventId);
CREATE INDEX idx_waitlist_status ON waitlist_entries(status);
