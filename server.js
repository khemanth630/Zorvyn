const app = require('./src/app');
const { sequelize } = require('./src/models');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Sync database (creates tables if they don't exist)
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✅ Database synced successfully');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
