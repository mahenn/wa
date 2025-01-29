#!/usr/bin/env node

const Database = require('better-sqlite3');
const path = require('path');

// Get database file path from arguments or default to 'my-database.db'
const dbFilePath = process.argv[2] || 'my-database.db';  // Default database name
const command = process.argv[3];  // First argument after the db path is the command

// Open the SQLite database
const db = new Database(dbFilePath);

// Example command: Get all users
if (command === 'chats') {
  const users = db.prepare('SELECT * FROM chats').all();
  console.log(users);
}
// Example command: Add a user
else if (command === 'messages') {
  const users = db.prepare('SELECT * FROM messages').all();
  console.log(users);
}
else if (command === 'contacts') {
  const users = db.prepare('SELECT * FROM contacts').all();
  console.log(users);
}


db.close();