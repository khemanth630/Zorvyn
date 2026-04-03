require('dotenv').config();
const { sequelize, User, FinancialRecord } = require('../models');

/**
 * Seed the database with demo users and financial records.
 */
async function seed() {
  try {
    // Force sync to reset tables
    await sequelize.sync({ force: true });
    console.log('🗄️  Database tables created.\n');

    // ---- Create Users ----
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@finance.com',
      password: 'admin123',
      role: 'admin',
      status: 'active',
    });

    const analystUser = await User.create({
      name: 'Analyst User',
      email: 'analyst@finance.com',
      password: 'analyst123',
      role: 'analyst',
      status: 'active',
    });

    const viewerUser = await User.create({
      name: 'Viewer User',
      email: 'viewer@finance.com',
      password: 'viewer123',
      role: 'viewer',
      status: 'active',
    });

    console.log('👤 Users created:');
    console.log(`   Admin   → admin@finance.com   / admin123`);
    console.log(`   Analyst → analyst@finance.com  / analyst123`);
    console.log(`   Viewer  → viewer@finance.com   / viewer123\n`);

    // ---- Create Financial Records ----
    const records = [
      { amount: 5000.00, type: 'income',  category: 'Salary',         date: '2024-01-15', description: 'Monthly salary - January' },
      { amount: 1200.00, type: 'expense', category: 'Rent',           date: '2024-01-01', description: 'Office rent for January' },
      { amount: 350.00,  type: 'expense', category: 'Utilities',      date: '2024-01-05', description: 'Electricity and water bill' },
      { amount: 800.00,  type: 'income',  category: 'Freelance',      date: '2024-01-20', description: 'Freelance consulting project' },
      { amount: 150.00,  type: 'expense', category: 'Office Supplies',date: '2024-01-10', description: 'Stationery and printer ink' },
      { amount: 5000.00, type: 'income',  category: 'Salary',         date: '2024-02-15', description: 'Monthly salary - February' },
      { amount: 1200.00, type: 'expense', category: 'Rent',           date: '2024-02-01', description: 'Office rent for February' },
      { amount: 200.00,  type: 'expense', category: 'Software',       date: '2024-02-10', description: 'SaaS subscription renewal' },
      { amount: 2500.00, type: 'income',  category: 'Investment',     date: '2024-02-20', description: 'Stock dividend payout' },
      { amount: 450.00,  type: 'expense', category: 'Travel',         date: '2024-02-25', description: 'Business trip transport' },
      { amount: 5000.00, type: 'income',  category: 'Salary',         date: '2024-03-15', description: 'Monthly salary - March' },
      { amount: 1200.00, type: 'expense', category: 'Rent',           date: '2024-03-01', description: 'Office rent for March' },
      { amount: 600.00,  type: 'expense', category: 'Marketing',      date: '2024-03-10', description: 'Social media ad campaign' },
      { amount: 1500.00, type: 'income',  category: 'Freelance',      date: '2024-03-20', description: 'Website development project' },
      { amount: 300.00,  type: 'expense', category: 'Utilities',      date: '2024-03-05', description: 'Internet and phone bill' },
      { amount: 5000.00, type: 'income',  category: 'Salary',         date: '2024-04-15', description: 'Monthly salary - April' },
      { amount: 1200.00, type: 'expense', category: 'Rent',           date: '2024-04-01', description: 'Office rent for April' },
      { amount: 750.00,  type: 'expense', category: 'Insurance',      date: '2024-04-05', description: 'Business insurance premium' },
      { amount: 3000.00, type: 'income',  category: 'Consulting',     date: '2024-04-18', description: 'Strategy consulting engagement' },
      { amount: 180.00,  type: 'expense', category: 'Office Supplies',date: '2024-04-22', description: 'New keyboard and mouse' },
      { amount: 5200.00, type: 'income',  category: 'Salary',         date: '2024-05-15', description: 'Monthly salary - May (with bonus)' },
      { amount: 400.00,  type: 'expense', category: 'Training',       date: '2024-05-08', description: 'Online course subscription' },
      { amount: 1200.00, type: 'expense', category: 'Rent',           date: '2024-05-01', description: 'Office rent for May' },
      { amount: 950.00,  type: 'income',  category: 'Freelance',      date: '2024-05-25', description: 'Logo design project' },
      { amount: 275.00,  type: 'expense', category: 'Maintenance',    date: '2024-05-12', description: 'Server maintenance and hosting' },
    ];

    for (const rec of records) {
      await FinancialRecord.create({
        ...rec,
        created_by: adminUser.id,
      });
    }

    console.log(`💰 Created ${records.length} financial records.\n`);
    console.log('✅ Seed completed successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
