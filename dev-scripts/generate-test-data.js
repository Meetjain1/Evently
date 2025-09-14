#!/usr/bin/env node

// This script generates test data for the Evently application
// Usage: node generate-test-data.js

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Random data generators
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const generateRandomName = () => {
  const firstNames = [
    'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 
    'William', 'Elizabeth', 'David', 'Susan', 'Richard', 'Jessica', 'Joseph', 'Sarah',
    'Thomas', 'Karen', 'Charles', 'Nancy', 'Christopher', 'Lisa', 'Daniel', 'Margaret',
    'Matthew', 'Betty', 'Anthony', 'Sandra', 'Mark', 'Ashley', 'Donald', 'Dorothy',
    'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
    'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Melissa', 'George', 'Deborah'
  ];
  
  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
    'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
    'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
    'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
    'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell'
  ];
  
  return {
    firstName: getRandomElement(firstNames),
    lastName: getRandomElement(lastNames)
  };
};

const generateRandomEmail = (firstName, lastName) => {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'example.com', 'company.com'];
  const domain = getRandomElement(domains);
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${getRandomInt(1, 999)}@${domain}`;
};

const generateRandomAddress = () => {
  const streets = [
    'Main St', 'Park Ave', 'Oak St', 'Maple Ave', 'Cedar Rd', 'Washington St',
    'Broadway', 'Highland Ave', 'Sunset Blvd', 'Lake St', 'Ridge Rd', 'Pine St'
  ];
  
  const cities = [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
    'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
    'San Francisco', 'Columbus', 'Indianapolis', 'Seattle', 'Denver', 'Boston'
  ];
  
  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID',
    'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS'
  ];
  
  const zipCodes = [];
  for (let i = 0; i < 10; i++) {
    zipCodes.push(String(getRandomInt(10000, 99999)));
  }
  
  return {
    address: `${getRandomInt(1, 9999)} ${getRandomElement(streets)}`,
    city: getRandomElement(cities),
    state: getRandomElement(states),
    zipCode: getRandomElement(zipCodes),
    country: 'USA'
  };
};

const generateRandomVenueName = () => {
  const prefixes = [
    'Grand', 'Royal', 'Elite', 'Premier', 'Luxury', 'Central', 'Metropolitan',
    'Modern', 'Legacy', 'Heritage', 'Summit', 'Golden', 'Silver', 'Diamond',
    'Platinum', 'Emerald', 'Crystal', 'Sapphire', 'Ruby', 'Coastal', 'Highland'
  ];
  
  const types = [
    'Hall', 'Arena', 'Stadium', 'Center', 'Auditorium', 'Theatre', 'Pavilion',
    'Coliseum', 'Garden', 'Forum', 'Plaza', 'Palace', 'Dome', 'Convention Center',
    'Opera House', 'Amphitheatre', 'Field', 'Court', 'Resort', 'Ballroom'
  ];
  
  return `${getRandomElement(prefixes)} ${getRandomElement(types)}`;
};

const generateRandomEventName = () => {
  const themes = [
    'Annual', 'International', 'Global', 'National', 'Regional', 'Local',
    'Summer', 'Winter', 'Spring', 'Fall', 'Holiday', 'Weekend', 'Charity',
    'Corporate', 'Tech', 'Music', 'Art', 'Food', 'Fashion', 'Sports', 'Film'
  ];
  
  const types = [
    'Conference', 'Festival', 'Expo', 'Summit', 'Symposium', 'Concert',
    'Exhibition', 'Gala', 'Awards', 'Showcase', 'Fair', 'Tournament',
    'Workshop', 'Seminar', 'Retreat', 'Networking', 'Celebration', 'Benefit'
  ];
  
  const topics = [
    'Technology', 'Innovation', 'Leadership', 'Entrepreneurship', 'Marketing',
    'Design', 'Science', 'Business', 'Education', 'Health', 'Wellness', 
    'Environment', 'Art', 'Music', 'Culture', 'Food', 'Fashion', 'Sports'
  ];
  
  const year = new Date().getFullYear();
  
  // Different formats for event names
  const formats = [
    `${getRandomElement(themes)} ${getRandomElement(types)} ${year}`,
    `${getRandomElement(topics)} ${getRandomElement(types)}`,
    `${getRandomElement(themes)} ${getRandomElement(topics)} ${getRandomElement(types)}`,
    `${getRandomElement(types)} of ${getRandomElement(topics)} ${year}`
  ];
  
  return getRandomElement(formats);
};

// Generate test data
async function generateTestData() {
  try {
    const data = {
      users: [],
      venues: [],
      events: [],
      seats: [],
      bookings: [],
      waitlistEntries: []
    };
    
    // Generate users (10 users, 2 admins)
    console.log('Generating users...');
    
    // Admin users
    for (let i = 0; i < 2; i++) {
      const { firstName, lastName } = generateRandomName();
      const email = i === 0 ? 'admin@example.com' : generateRandomEmail(firstName, lastName);
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      
      data.users.push({
        id: uuidv4(),
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    // Regular users
    for (let i = 0; i < 10; i++) {
      const { firstName, lastName } = generateRandomName();
      const email = i === 0 ? 'user@example.com' : generateRandomEmail(firstName, lastName);
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      
      data.users.push({
        id: uuidv4(),
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    // Generate venues (5 venues)
    console.log('Generating venues...');
    
    for (let i = 0; i < 5; i++) {
      const { address, city, state, zipCode, country } = generateRandomAddress();
      const venueName = generateRandomVenueName();
      const adminUser = data.users.find(user => user.role === 'admin');
      
      data.venues.push({
        id: uuidv4(),
        name: venueName,
        address,
        city,
        state,
        zipCode,
        country,
        totalCapacity: getRandomInt(100, 5000),
        hasSeating: Math.random() > 0.2, // 80% venues have seating
        description: `${venueName} is a premier venue located in ${city}, ${state}.`,
        creatorId: adminUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    // Generate events (10 events, 2 per venue)
    console.log('Generating events...');
    
    const eventStatuses = ['draft', 'published', 'cancelled', 'completed'];
    const now = new Date();
    const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    
    for (let i = 0; i < 10; i++) {
      const eventName = generateRandomEventName();
      const venue = data.venues[i % data.venues.length];
      const adminUser = data.users.find(user => user.role === 'admin');
      const startDate = getRandomDate(now, oneYearFromNow);
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + getRandomInt(2, 8));
      
      const capacity = getRandomInt(50, venue.totalCapacity);
      const hasSeating = venue.hasSeating && Math.random() > 0.3;
      const status = getRandomElement(eventStatuses);
      
      data.events.push({
        id: uuidv4(),
        name: eventName,
        description: `Join us for ${eventName}, an unforgettable experience at ${venue.name}.`,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        capacity,
        bookedSeats: 0,
        isFeatured: Math.random() > 0.7,
        status,
        ticketPrice: getRandomInt(10, 500) + 0.99,
        hasWaitlist: Math.random() > 0.5,
        maxWaitlistSize: getRandomInt(20, 100),
        hasSeating,
        publishedAt: status === 'published' ? new Date().toISOString() : null,
        creatorId: adminUser.id,
        venueId: venue.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1
      });
    }
    
    // Generate seats for venues with seating
    console.log('Generating seats...');
    
    for (const event of data.events.filter(e => e.hasSeating)) {
      const venue = data.venues.find(v => v.id === event.venueId);
      
      if (!venue.hasSeating) continue;
      
      // Define seat rows and sections
      const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      const sections = ['Main Floor', 'Balcony', 'VIP', 'Orchestra'];
      
      // Generate seats for each row
      const seatsPerRow = getRandomInt(10, 20);
      
      for (let r = 0; r < Math.min(rows.length, event.capacity / seatsPerRow); r++) {
        const rowName = rows[r];
        const section = r < 2 ? sections[0] : (r < 4 ? sections[1] : (r < 6 ? sections[2] : sections[3]));
        
        for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
          const seatStatus = Math.random() > 0.8 ? 'booked' : 'available';
          
          const seat = {
            id: uuidv4(),
            rowName,
            seatNumber: seatNum,
            status: seatStatus,
            isActive: true,
            notes: null,
            isAccessible: seatNum === 1 || seatNum === seatsPerRow, // Accessible seats at ends
            section,
            venueId: venue.id,
            eventId: event.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          data.seats.push(seat);
          
          // Update booked seats count
          if (seatStatus === 'booked') {
            const eventIndex = data.events.findIndex(e => e.id === event.id);
            data.events[eventIndex].bookedSeats++;
          }
        }
      }
    }
    
    // Generate bookings
    console.log('Generating bookings...');
    
    const bookingStatuses = ['pending', 'confirmed', 'cancelled'];
    
    for (let i = 0; i < 20; i++) {
      const user = getRandomElement(data.users.filter(u => u.role === 'user'));
      const event = getRandomElement(data.events.filter(e => e.status === 'published'));
      const numberOfTickets = getRandomInt(1, 4);
      const status = getRandomElement(bookingStatuses);
      const totalAmount = numberOfTickets * parseFloat(event.ticketPrice);
      
      const booking = {
        id: uuidv4(),
        numberOfTickets,
        status,
        totalAmount,
        cancellationReason: status === 'cancelled' ? 'Customer requested cancellation' : null,
        paymentReference: status === 'confirmed' ? `PAY-${getRandomInt(100000, 999999)}` : null,
        paymentDate: status === 'confirmed' ? new Date().toISOString() : null,
        userId: user.id,
        eventId: event.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      data.bookings.push(booking);
    }
    
    // Generate waitlist entries
    console.log('Generating waitlist entries...');
    
    for (let i = 0; i < 15; i++) {
      const user = getRandomElement(data.users.filter(u => u.role === 'user'));
      const event = getRandomElement(data.events.filter(e => e.hasWaitlist && e.status === 'published'));
      const numberOfTickets = getRandomInt(1, 3);
      const statuses = ['waiting', 'notified', 'confirmed', 'expired'];
      const status = getRandomElement(statuses);
      const { firstName, lastName } = generateRandomName();
      
      const waitlistEntry = {
        id: uuidv4(),
        name: `${firstName} ${lastName}`,
        email: generateRandomEmail(firstName, lastName),
        phone: `+1${getRandomInt(2000000000, 9999999999)}`,
        numberOfTickets,
        status,
        notifiedAt: status === 'waiting' ? null : new Date().toISOString(),
        expiresAt: status === 'notified' ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null,
        userId: Math.random() > 0.5 ? user.id : null,
        eventId: event.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      data.waitlistEntries.push(waitlistEntry);
    }
    
    // Write data to file
    console.log('Writing data to file...');
    const filePath = path.join(__dirname, 'test-data.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    console.log(`Test data generated successfully and saved to ${filePath}`);
    console.log('Summary:');
    console.log(`- Users: ${data.users.length} (${data.users.filter(u => u.role === 'admin').length} admins, ${data.users.filter(u => u.role === 'user').length} regular users)`);
    console.log(`- Venues: ${data.venues.length}`);
    console.log(`- Events: ${data.events.length}`);
    console.log(`- Seats: ${data.seats.length}`);
    console.log(`- Bookings: ${data.bookings.length}`);
    console.log(`- Waitlist Entries: ${data.waitlistEntries.length}`);
    
  } catch (error) {
    console.error('Error generating test data:', error);
  }
}

generateTestData();
