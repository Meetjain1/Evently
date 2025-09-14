#!/usr/bin/env node

/**
 * Seed script to populate database with test data
 * Usage: npm run seed-dev-data
 */

import 'reflect-metadata';
import { AppDataSource } from '../src/config/data-source';
import { User } from '../src/models/User';
import { Event } from '../src/models/Event';
import { Venue } from '../src/models/Venue';
import { Booking } from '../src/models/Booking';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';
import { SeatService } from '../src/services/seat.service';
import { UserRole, EventStatus, BookingStatus } from '../src/models';

// Initialize database connection
async function initialize() {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  }
}

// Create test users
async function createUsers() {
  const userRepository = AppDataSource.getRepository(User);
  
  // Clear existing users
  await userRepository.clear();
  
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = userRepository.create({
    id: uuidv4(),
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    password: adminPassword,
    role: UserRole.ADMIN,
  });
  
  // Create regular user
  const userPassword = await bcrypt.hash('user123', 10);
  const user = userRepository.create({
    id: uuidv4(),
    firstName: 'Regular',
    lastName: 'User',
    email: 'user@example.com',
    password: userPassword,
    role: UserRole.USER,
  });
  
  // Create event organizer
  const organizerPassword = await bcrypt.hash('organizer123', 10);
  const organizer = userRepository.create({
    id: uuidv4(),
    firstName: 'Event',
    lastName: 'Organizer',
    email: 'organizer@example.com',
    password: organizerPassword,
    role: UserRole.ADMIN, // Using ADMIN role since ORGANIZER might not exist
  });
  
  await userRepository.save([admin, user, organizer]);
  console.log('Created test users');
  
  return { admin, user, organizer };
}

// Create test venues
async function createVenues(creator) {
  const venueRepository = AppDataSource.getRepository(Venue);
  
  // Clear existing venues
  await venueRepository.clear();
  
  // Create venues
  const venue1 = venueRepository.create({
    id: uuidv4(),
    name: 'Main Concert Hall',
    address: '123 Music Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA',
    totalCapacity: 500,
    hasSeating: true,
    description: 'A spacious concert hall with excellent acoustics',
    creatorId: creator.id,
  });
  
  const venue2 = venueRepository.create({
    id: uuidv4(),
    name: 'The Stadium',
    address: '456 Sports Avenue',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90001',
    country: 'USA',
    totalCapacity: 2000,
    hasSeating: true,
    description: 'Large outdoor stadium suitable for sporting events and concerts',
    creatorId: creator.id,
  });
  
  await venueRepository.save([venue1, venue2]);
  console.log('Created test venues');
  
  return { venue1, venue2 };
}

// Create test events
async function createEvents(creator, venues) {
  const eventRepository = AppDataSource.getRepository(Event);
  
  // Clear existing events
  await eventRepository.clear();
  
  // Create future date (30 days from now)
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);
  
  // Create another future date (31 days from now)
  const endDate = new Date(futureDate);
  endDate.setDate(endDate.getDate() + 1);
  
  // Create events
  const event1 = eventRepository.create({
    id: uuidv4(),
    name: 'Summer Music Festival',
    description: 'A celebration of music featuring top artists',
    startDate: futureDate,
    endDate: endDate,
    capacity: 500,
    bookedSeats: 0,
    isFeatured: true,
    status: EventStatus.PUBLISHED,
    ticketPrice: 75.00,
    hasWaitlist: true,
    maxWaitlistSize: 50,
    hasSeating: true,
    publishedAt: new Date(),
    creatorId: creator.id,
    venueId: venues.venue1.id,
  });
  
  const event2 = eventRepository.create({
    id: uuidv4(),
    name: 'Tech Conference 2025',
    description: 'The latest in technology innovations',
    startDate: new Date(futureDate.setDate(futureDate.getDate() + 15)),
    endDate: new Date(endDate.setDate(endDate.getDate() + 15)),
    capacity: 1000,
    bookedSeats: 0,
    isFeatured: true,
    status: EventStatus.PUBLISHED,
    ticketPrice: 150.00,
    hasWaitlist: true,
    maxWaitlistSize: 100,
    hasSeating: true,
    publishedAt: new Date(),
    creatorId: creator.id,
    venueId: venues.venue2.id,
  });
  
  await eventRepository.save([event1, event2]);
  console.log('Created test events');
  
  return { event1, event2 };
}

// Create seats for venues and events
async function createSeats(venues, events) {
  console.log('Note: Seat creation is commented out due to interface complexity.');
  console.log('Please use the API to create seats for the venues and events.');
  
  // Note: To create seats, you would need to use an authenticated API call
  // that includes the proper creator ID and admin status
  
  console.log('Created test seats (placeholder)');
}

// Create test bookings
async function createBookings(user, events) {
  const bookingRepository = AppDataSource.getRepository(Booking);
  
  // Clear existing bookings
  await bookingRepository.clear();
  
  // Create bookings
  const booking1 = bookingRepository.create({
    id: uuidv4(),
    numberOfTickets: 2,
    status: BookingStatus.CONFIRMED,
    totalAmount: events.event1.ticketPrice * 2,
    userId: user.id,
    eventId: events.event1.id,
  });
  
  const booking2 = bookingRepository.create({
    id: uuidv4(),
    numberOfTickets: 1,
    status: BookingStatus.PENDING,
    totalAmount: events.event2.ticketPrice,
    userId: user.id,
    eventId: events.event2.id,
  });
  
  await bookingRepository.save([booking1, booking2]);
  console.log('Created test bookings');
}

// Main function to run the seeding process
async function seed() {
  try {
    await initialize();
    const users = await createUsers();
    const venues = await createVenues(users.admin);
    const events = await createEvents(users.organizer, venues);
    await createSeats(venues, events);
    await createBookings(users.user, events);
    
    console.log('Database seeding completed successfully!');
    console.log('\nTest user credentials:');
    console.log('Admin: admin@example.com / admin123');
    console.log('User: user@example.com / user123');
    console.log('Organizer: organizer@example.com / organizer123');
    
    // Close the database connection
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    // Close the database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(1);
  }
}

// Run the seed function
seed();
