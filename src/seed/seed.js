require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Task = require('../models/Task');

const seed = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tareas_db';
  await mongoose.connect(uri);

  await User.deleteMany({});
  await Task.deleteMany({});

  const [admin, user1] = await User.create([
    { username: 'admin', password: 'password123' },
    { username: 'user1', password: 'password123' }
  ]);

  await Task.insertMany([
    { title: 'Setup project structure', description: 'Initialize folders and config', status: 'completed', priority: 'high', userId: admin._id },
    { title: 'Implement authentication', description: 'JWT login endpoint', status: 'completed', priority: 'high', userId: admin._id },
    { title: 'Write unit tests', description: 'Cover all endpoints with Jest + Supertest', status: 'in_progress', priority: 'high', userId: admin._id },
    { title: 'Add Swagger docs', description: 'Document all endpoints with OpenAPI 3.0', status: 'in_progress', priority: 'medium', userId: admin._id },
    { title: 'Deploy to production', description: 'Configure CI/CD pipeline', status: 'pending', priority: 'medium', userId: admin._id },
    { title: 'Buy groceries', description: 'Milk, eggs, bread', status: 'pending', priority: 'low', userId: user1._id },
    { title: 'Exercise', description: '30 minutes cardio', status: 'pending', priority: 'medium', userId: user1._id, dueDate: new Date() },
    { title: 'Read book', description: 'Chapter 5 of Clean Code', status: 'in_progress', priority: 'low', userId: user1._id },
    { title: 'Call dentist', description: 'Schedule appointment', status: 'pending', priority: 'high', userId: user1._id },
    { title: 'Review PR', description: 'Review open pull requests', status: 'completed', priority: 'medium', userId: user1._id }
  ]);

  console.log('Seed complete: 2 users and 10 tasks created.');
  console.log('  Users: admin / user1  (password: password123)');
  await mongoose.disconnect();
};

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
