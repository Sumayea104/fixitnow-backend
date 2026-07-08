import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

function main() {
  try {
    app.listen(PORT, () => {
      console.log(`🚀 Server is spinning on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

main();