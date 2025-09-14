-- Drop tables if they exist
DROP TABLE IF EXISTS waitlist_entries;
DROP TABLE IF EXISTS booked_seats;
DROP TABLE IF EXISTS seats;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS venues;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create venues table
CREATE TABLE venues (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address VARCHAR(200) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  zipCode VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL,
  totalCapacity INT NOT NULL,
  hasSeating BOOLEAN DEFAULT FALSE,
  description TEXT,
  creatorId VARCHAR(36) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  FOREIGN KEY (creatorId) REFERENCES users(id)
);

-- Create events table
CREATE TABLE events (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  startDate DATETIME NOT NULL,
  endDate DATETIME NOT NULL,
  venueId VARCHAR(36) NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  totalCapacity INT NOT NULL,
  availableTickets INT NOT NULL,
  isPublished BOOLEAN DEFAULT FALSE,
  isCancelled BOOLEAN DEFAULT FALSE,
  imageUrl VARCHAR(255),
  creatorId VARCHAR(36) NOT NULL,
  isSeated BOOLEAN DEFAULT FALSE,
  allowWaitlist BOOLEAN DEFAULT FALSE,
  maxTicketsPerBooking INT DEFAULT 10,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (venueId) REFERENCES venues(id),
  FOREIGN KEY (creatorId) REFERENCES users(id)
);

-- Create bookings table
CREATE TABLE bookings (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  eventId VARCHAR(36) NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
  bookingReference VARCHAR(50) NOT NULL,
  numberOfTickets INT NOT NULL DEFAULT 1,
  totalAmount DECIMAL(10, 2) NOT NULL,
  version INT DEFAULT 1,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (eventId) REFERENCES events(id),
  UNIQUE KEY uk_booking_reference (bookingReference)
);

-- Create seats table
CREATE TABLE seats (
  id VARCHAR(36) PRIMARY KEY,
  rowName VARCHAR(10) NOT NULL,
  seatNumber INT NOT NULL,
  status ENUM('available', 'reserved', 'booked') DEFAULT 'available',
  isActive BOOLEAN DEFAULT TRUE,
  notes TEXT,
  venueId VARCHAR(36) NOT NULL,
  eventId VARCHAR(36),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (venueId) REFERENCES venues(id),
  FOREIGN KEY (eventId) REFERENCES events(id),
  UNIQUE KEY uk_venue_seat (venueId, rowName, seatNumber)
);

-- Create booked_seats table
CREATE TABLE booked_seats (
  id VARCHAR(36) PRIMARY KEY,
  bookingId VARCHAR(36) NOT NULL,
  seatId VARCHAR(36) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (bookingId) REFERENCES bookings(id),
  FOREIGN KEY (seatId) REFERENCES seats(id),
  UNIQUE KEY uk_booking_seat (bookingId, seatId)
);

-- Create waitlist_entries table
CREATE TABLE waitlist_entries (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  eventId VARCHAR(36) NOT NULL,
  status ENUM('waiting', 'notified', 'booked', 'expired') DEFAULT 'waiting',
  position INT NOT NULL,
  notifiedAt DATETIME,
  numberOfTickets INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (eventId) REFERENCES events(id),
  UNIQUE KEY uk_user_event (userId, eventId)
);
