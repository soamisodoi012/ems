Simply show video https://www.loom.com/share/1738ea9cbd5e46afa5dc0fd2c6175a31

clone repo at master branch
git clone https://github.com/soamisodoi012/ems
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your database credentials
# Edit .env file and set:
# DB_NAME=your_database_name
# DB_USER=your_database_user
# DB_PASSWORD=your_database_password
# DB_HOST=localhost
# DB_PORT=5432
# JWT_SECRET=your_super_secret_key_here
# JWT_EXPIRE=90d
# PORT=5000
create db employee_management
import dbexport.sql db file into the db
or follow the following steps
# Run database migrations (if any)
npm run migration:make
npm run migration:test
npm run seed:test


# Start the backend server
npm run dev
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with backend URL (if needed)
# VITE_API_URL=http://localhost:5000/api

# Start the frontend development server
npm run dev
