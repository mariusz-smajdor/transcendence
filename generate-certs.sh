#!/bin/bash

# SSL Certificate Generation Script for Transcendence Project
# This script generates self-signed SSL certificates for both client and server

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CLIENT_CERT_DIR="./client/certs"
SERVER_CERT_DIR="./server/certs"
DAYS_VALID=365

echo -e "${BLUE}🔐 SSL Certificate Generation for Transcendence${NC}"
echo "=================================================="

# Function to create directory if it doesn't exist
create_dir() {
    local dir=$1
    if [ ! -d "$dir" ]; then
        echo -e "${YELLOW}📁 Creating directory: $dir${NC}"
        mkdir -p "$dir"
    else
        echo -e "${GREEN}✅ Directory exists: $dir${NC}"
    fi
}

# Function to generate certificate
generate_cert() {
    local name=$1
    local cert_dir=$2
    local common_name=$3
    local key_file="$cert_dir/$name.key"
    local crt_file="$cert_dir/$name.crt"
    
    echo -e "${BLUE}🔑 Generating $name certificate...${NC}"
    
    # Generate private key
    openssl genrsa -out "$key_file" 2048
    
    # Generate certificate
    openssl req -new -x509 -key "$key_file" -out "$crt_file" -days $DAYS_VALID \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=$common_name" \
        -addext "subjectAltName=DNS:localhost,DNS:$common_name,IP:127.0.0.1,IP:0.0.0.0,IP:10.12.4.4"
    
    # Set appropriate permissions
    chmod 600 "$key_file"
    chmod 644 "$crt_file"
    
    echo -e "${GREEN}✅ Generated: $key_file${NC}"
    echo -e "${GREEN}✅ Generated: $crt_file${NC}"
}

# Function to backup existing certificates
backup_existing() {
    local cert_dir=$1
    local backup_dir="$cert_dir/backup_$(date +%Y%m%d_%H%M%S)"
    
    if [ -f "$cert_dir"/*.key ] || [ -f "$cert_dir"/*.crt ] 2>/dev/null; then
        echo -e "${YELLOW}📦 Backing up existing certificates to: $backup_dir${NC}"
        mkdir -p "$backup_dir"
        mv "$cert_dir"/*.key "$cert_dir"/*.crt "$backup_dir/" 2>/dev/null || true
    fi
}

# Function to verify certificate
verify_cert() {
    local cert_file=$1
    local name=$2
    
    if openssl x509 -in "$cert_file" -text -noout > /dev/null 2>&1; then
        local expiry=$(openssl x509 -in "$cert_file" -noout -enddate | cut -d= -f2)
        echo -e "${GREEN}✅ $name certificate is valid (expires: $expiry)${NC}"
    else
        echo -e "${RED}❌ $name certificate verification failed${NC}"
        return 1
    fi
}

# Main execution
main() {
    echo -e "${BLUE}🚀 Starting certificate generation...${NC}"
    
    # Check if OpenSSL is installed
    if ! command -v openssl &> /dev/null; then
        echo -e "${RED}❌ OpenSSL is not installed. Please install it first.${NC}"
        echo "  macOS: brew install openssl"
        echo "  Ubuntu/Debian: sudo apt-get install openssl"
        echo "  CentOS/RHEL: sudo yum install openssl"
        exit 1
    fi
    
    # Create certificate directories
    create_dir "$CLIENT_CERT_DIR"
    create_dir "$SERVER_CERT_DIR"
    
    # Backup existing certificates
    backup_existing "$CLIENT_CERT_DIR"
    backup_existing "$SERVER_CERT_DIR"
    
    # Generate client certificates (for localhost)
    echo -e "\n${BLUE}🌐 Generating Client Certificates${NC}"
    generate_cert "localhost" "$CLIENT_CERT_DIR" "localhost"
    
    # Generate server certificates
    echo -e "\n${BLUE}🖥️  Generating Server Certificates${NC}"
    generate_cert "server" "$SERVER_CERT_DIR" "server"
    
    # Verify certificates
    echo -e "\n${BLUE}🔍 Verifying Certificates${NC}"
    verify_cert "$CLIENT_CERT_DIR/localhost.crt" "Client"
    verify_cert "$SERVER_CERT_DIR/server.crt" "Server"
    
    # Display certificate information
    echo -e "\n${BLUE}📋 Certificate Summary${NC}"
    echo "======================================"
    echo -e "${GREEN}Client certificates:${NC}"
    echo "  Key:  $CLIENT_CERT_DIR/localhost.key"
    echo "  Cert: $CLIENT_CERT_DIR/localhost.crt"
    echo -e "${GREEN}Server certificates:${NC}"
    echo "  Key:  $SERVER_CERT_DIR/server.key"
    echo "  Cert: $SERVER_CERT_DIR/server.crt"
    
    echo -e "\n${GREEN}🎉 Certificate generation completed successfully!${NC}"
    echo -e "${YELLOW}⚠️  Note: These are self-signed certificates for development use only.${NC}"
    echo -e "${YELLOW}⚠️  Your browser may show security warnings - this is normal for self-signed certs.${NC}"
    
    # Instructions for Docker
    echo -e "\n${BLUE}🐳 Docker Instructions${NC}"
    echo "======================================"
    echo "1. Run this script: ./generate-certs.sh"
    echo "2. Start your containers: docker-compose up"
    echo "3. Access your app at: https://localhost:8080"
    echo "4. Accept the security warning in your browser"
}

# Run main function
main "$@"
