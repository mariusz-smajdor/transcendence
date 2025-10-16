#!/bin/bash

# Connection Test Script for Transcendence Project
# This script tests the connection between client and server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Transcendence Connection Test${NC}"
echo "=================================="

# Function to test HTTP connection
test_http_connection() {
    local url=$1
    local name=$2
    
    echo -e "${BLUE}Testing $name: $url${NC}"
    
    if curl -k -s --connect-timeout 10 --max-time 30 "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $name is reachable${NC}"
        return 0
    else
        echo -e "${RED}❌ $name is not reachable${NC}"
        return 1
    fi
}

# Function to test WebSocket connection
test_websocket_connection() {
    local url=$1
    local name=$2
    
    echo -e "${BLUE}Testing WebSocket $name: $url${NC}"
    
    # Use wscat if available, otherwise use a simple test
    if command -v wscat &> /dev/null; then
        timeout 10 wscat -c "$url" --no-color > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ WebSocket $name is reachable${NC}"
            return 0
        else
            echo -e "${RED}❌ WebSocket $name is not reachable${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  wscat not available, skipping WebSocket test${NC}"
        echo -e "${YELLOW}   Install wscat with: npm install -g wscat${NC}"
        return 1
    fi
}

# Function to check if services are running
check_services() {
    echo -e "${BLUE}🔍 Checking if services are running...${NC}"
    
    # Check if Docker containers are running
    if docker ps | grep -q "server"; then
        echo -e "${GREEN}✅ Server container is running${NC}"
    else
        echo -e "${RED}❌ Server container is not running${NC}"
        echo -e "${YELLOW}   Run: docker-compose up --build${NC}"
        return 1
    fi
    
    if docker ps | grep -q "client"; then
        echo -e "${GREEN}✅ Client container is running${NC}"
    else
        echo -e "${RED}❌ Client container is not running${NC}"
        echo -e "${YELLOW}   Run: docker-compose up --build${NC}"
        return 1
    fi
    
    return 0
}

# Function to get connection info
get_connection_info() {
    echo -e "${BLUE}📋 Connection Information${NC}"
    echo "=========================="
    
    # Get local IP
    local local_ip=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
    echo -e "${GREEN}Local IP:${NC} $local_ip"
    
    # Get public IP
    local public_ip=$(curl -s ifconfig.me 2>/dev/null || echo "Unable to determine")
    echo -e "${GREEN}Public IP:${NC} $public_ip"
    
    echo ""
    echo -e "${BLUE}Test URLs:${NC}"
    echo "  Server (local): https://$local_ip:3000"
    echo "  Client (local): https://$local_ip:8080"
    echo "  Server (public): https://$public_ip:3000"
    echo "  Client (public): https://$public_ip:8080"
}

# Function to run comprehensive tests
run_tests() {
    local server_ip=$1
    local client_ip=$2
    
    echo -e "${BLUE}🧪 Running Connection Tests${NC}"
    echo "=============================="
    
    # Test server connection
    test_http_connection "https://$server_ip:3000" "Server"
    local server_ok=$?
    
    # Test client connection
    test_http_connection "https://$client_ip:8080" "Client"
    local client_ok=$?
    
    # Test WebSocket connections
    test_websocket_connection "wss://$server_ip:3000/invitations" "Invitations"
    test_websocket_connection "wss://$server_ip:3000/notifications" "Notifications"
    
    echo ""
    echo -e "${BLUE}📊 Test Results Summary${NC}"
    echo "========================="
    
    if [ $server_ok -eq 0 ]; then
        echo -e "${GREEN}✅ Server is accessible${NC}"
    else
        echo -e "${RED}❌ Server is not accessible${NC}"
        echo -e "${YELLOW}   Check firewall settings and port forwarding${NC}"
    fi
    
    if [ $client_ok -eq 0 ]; then
        echo -e "${GREEN}✅ Client is accessible${NC}"
    else
        echo -e "${RED}❌ Client is not accessible${NC}"
        echo -e "${YELLOW}   Check firewall settings and port forwarding${NC}"
    fi
    
    echo ""
    if [ $server_ok -eq 0 ] && [ $client_ok -eq 0 ]; then
        echo -e "${GREEN}🎉 All basic connections are working!${NC}"
        echo -e "${BLUE}📖 Next steps:${NC}"
        echo "1. Open https://$client_ip:8080 in your browser"
        echo "2. Accept the SSL certificate warning"
        echo "3. Test the application functionality"
    else
        echo -e "${RED}⚠️  Some connections are failing${NC}"
        echo -e "${BLUE}🔧 Troubleshooting:${NC}"
        echo "1. Check if Docker containers are running"
        echo "2. Verify firewall settings"
        echo "3. Check network connectivity"
        echo "4. Review the NETWORK_SETUP.md guide"
    fi
}

# Main execution
main() {
    echo -e "${BLUE}🚀 Starting connection tests...${NC}"
    
    # Check if services are running
    if ! check_services; then
        echo -e "${RED}❌ Services are not running. Please start them first.${NC}"
        exit 1
    fi
    
    # Get connection information
    get_connection_info
    
    # Get IP addresses
    local local_ip=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
    
    echo ""
    echo -e "${BLUE}🔍 Testing with IP: $local_ip${NC}"
    
    # Run tests
    run_tests "$local_ip" "$local_ip"
    
    echo ""
    echo -e "${BLUE}💡 Additional Tips:${NC}"
    echo "- If tests fail, check Docker logs: docker-compose logs"
    echo "- For external access, configure port forwarding"
    echo "- Use VPN or tunneling services for different networks"
    echo "- Check browser console for detailed error messages"
}

# Run main function
main "$@"
