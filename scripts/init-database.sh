#!/bin/bash

# Database Initialization Script
# This script ensures the database is properly initialized with all auth improvements

set -e

echo "🚀 Initializing AI Agent Platform Database..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if the database container exists
if ! docker ps -a --format "table {{.Names}}" | grep -q "db-mysql"; then
    print_warning "Database container not found. Starting fresh database..."
    docker-compose up -d db
    sleep 10
else
    print_status "Database container found. Checking if it's running..."
    if ! docker ps --format "table {{.Names}}" | grep -q "db-mysql"; then
        print_status "Starting database container..."
        docker-compose up -d db
        sleep 10
    else
        print_success "Database container is already running."
    fi
fi

# Wait for database to be ready
print_status "Waiting for database to be ready..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if docker exec db-mysql mysqladmin ping -h localhost -u root -p${DB_ROOT_PASSWORD:-rootpassword} --silent; then
        print_success "Database is ready!"
        break
    fi
    attempt=$((attempt + 1))
    print_status "Attempt $attempt/$max_attempts - Database not ready yet, waiting..."
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    print_error "Database failed to start within the expected time."
    exit 1
fi

# Check if the database and tables exist
print_status "Checking database schema..."

# Check if the enhanced users table exists with auth fields
if docker exec db-mysql mysql -u ${DB_USER:-ai_user} -p${DB_PASSWORD:-ai_password123} ${DB_NAME:-ai_agent_platform} -e "DESCRIBE users;" | grep -q "refresh_token"; then
    print_success "Enhanced auth schema is already applied."
else
    print_warning "Enhanced auth schema not found. Applying initialization script..."
    
    # Apply the initialization script
    docker exec -i db-mysql mysql -u ${DB_USER:-ai_user} -p${DB_PASSWORD:-ai_password123} ${DB_NAME:-ai_agent_platform} < mysql/init/01-init.sql
    
    if [ $? -eq 0 ]; then
        print_success "Database initialization completed successfully!"
    else
        print_error "Database initialization failed!"
        exit 1
    fi
fi

# Verify the admin user exists with correct password
print_status "Verifying admin user..."
admin_exists=$(docker exec db-mysql mysql -u ${DB_USER:-ai_user} -p${DB_PASSWORD:-ai_password123} ${DB_NAME:-ai_agent_platform} -s -N -e "SELECT COUNT(*) FROM users WHERE email = 'admin@aiagentplatform.com';")

if [ "$admin_exists" -eq "1" ]; then
    print_success "Admin user exists."
    
    # Check if admin user has email verified
    email_verified=$(docker exec db-mysql mysql -u ${DB_USER:-ai_user} -p${DB_PASSWORD:-ai_password123} ${DB_NAME:-ai_agent_platform} -s -N -e "SELECT email_verified FROM users WHERE email = 'admin@aiagentplatform.com';")
    
    if [ "$email_verified" -eq "1" ]; then
        print_success "Admin user email is verified."
    else
        print_warning "Admin user email is not verified. Updating..."
        docker exec db-mysql mysql -u ${DB_USER:-ai_user} -p${DB_PASSWORD:-ai_password123} ${DB_NAME:-ai_agent_platform} -e "UPDATE users SET email_verified = 1 WHERE email = 'admin@aiagentplatform.com';"
        print_success "Admin user email verification updated."
    fi
else
    print_warning "Admin user not found. Creating..."
    docker exec db-mysql mysql -u ${DB_USER:-ai_user} -p${DB_PASSWORD:-ai_password123} ${DB_NAME:-ai_agent_platform} -e "
    INSERT INTO users (id, email, password_hash, first_name, last_name, role, email_verified, password_changed_at) 
    VALUES ('admin-001', 'admin@aiagentplatform.com', '\$2a\$12\$htYUWStIG8WIrF6LhAOfIOKDkJmtFcd2grq35I4LHf3kKiBec0x1.', 'Admin', 'User', 'admin', 1, CURRENT_TIMESTAMP);
    "
    print_success "Admin user created."
fi

# Check if default company exists
print_status "Checking default company..."
company_exists=$(docker exec db-mysql mysql -u ${DB_USER:-ai_user} -p${DB_PASSWORD:-ai_password123} ${DB_NAME:-ai_agent_platform} -s -N -e "SELECT COUNT(*) FROM companies WHERE name = 'AI Agent Platform';")

if [ "$company_exists" -eq "1" ]; then
    print_success "Default company exists."
else
    print_warning "Default company not found. Creating..."
    docker exec db-mysql mysql -u ${DB_USER:-ai_user} -p${DB_PASSWORD:-ai_password123} ${DB_NAME:-ai_agent_platform} -e "
    INSERT INTO companies (id, name, domain, subscription_plan, max_agents) 
    VALUES ('company-001', 'AI Agent Platform', 'aiagentplatform.com', 'enterprise', 100);
    "
    print_success "Default company created."
fi

# Check if admin user is linked to company
print_status "Checking admin-company relationship..."
relationship_exists=$(docker exec db-mysql mysql -u ${DB_USER:-ai_user} -p${DB_PASSWORD:-ai_password123} ${DB_NAME:-ai_agent_platform} -s -N -e "SELECT COUNT(*) FROM user_companies WHERE user_id = 'admin-001' AND company_id = 'company-001';")

if [ "$relationship_exists" -eq "1" ]; then
    print_success "Admin-company relationship exists."
else
    print_warning "Admin-company relationship not found. Creating..."
    docker exec db-mysql mysql -u ${DB_USER:-ai_user} -p${DB_PASSWORD:-ai_password123} ${DB_NAME:-ai_agent_platform} -e "
    INSERT INTO user_companies (id, user_id, company_id, role) 
    VALUES ('uc-001', 'admin-001', 'company-001', 'owner');
    "
    print_success "Admin-company relationship created."
fi

# Verify auth-related tables exist
print_status "Verifying auth-related tables..."
auth_tables=("refresh_tokens" "password_reset_tokens" "user_sessions" "auth_audit_logs")

for table in "${auth_tables[@]}"; do
    if docker exec db-mysql mysql -u ${DB_USER:-ai_user} -p${DB_PASSWORD:-ai_password123} ${DB_NAME:-ai_agent_platform} -e "DESCRIBE $table;" > /dev/null 2>&1; then
        print_success "Table $table exists."
    else
        print_error "Table $table is missing!"
        exit 1
    fi
done

# Test database connection
print_status "Testing database connection..."
if docker exec db-mysql mysql -u ${DB_USER:-ai_user} -p${DB_PASSWORD:-ai_password123} ${DB_NAME:-ai_agent_platform} -e "SELECT 1;" > /dev/null 2>&1; then
    print_success "Database connection test passed."
else
    print_error "Database connection test failed!"
    exit 1
fi

print_success "🎉 Database initialization completed successfully!"
print_status "Database is ready for the AI Agent Platform."
print_status "Admin credentials: admin@aiagentplatform.com / admin123"
