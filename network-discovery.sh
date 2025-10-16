#!/bin/bash

# Network Discovery and Port Forwarding Helper
# This script helps discover network information and provides port forwarding guidance

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Network Discovery Tool${NC}"
echo "=========================="

# Function to get network interfaces
get_network_interfaces() {
    echo -e "${BLUE}📡 Network Interfaces:${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        ifconfig | grep -A 1 "inet " | grep -v "127.0.0.1" | while read line; do
            if [[ $line == *"inet "* ]]; then
                ip=$(echo $line | awk '{print $2}')
                interface=$(ifconfig | grep -B 1 "$ip" | head -1 | cut -d: -f1)
                echo "  $interface: $ip"
            fi
        done
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        ip addr show | grep "inet " | grep -v "127.0.0.1" | while read line; do
            ip=$(echo $line | awk '{print $2}' | cut -d/ -f1)
            interface=$(ip addr show | grep -B 2 "$ip" | head -1 | cut -d: -f2 | xargs)
            echo "  $interface: $ip"
        done
    fi
}

# Function to check port status
check_ports() {
    echo -e "\n${BLUE}🔌 Port Status:${NC}"
    local ports=(3000 3443 8080)
    
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            process=$(lsof -Pi :$port -sTCP:LISTEN | tail -1 | awk '{print $1}')
            echo -e "  Port $port: ${GREEN}IN USE${NC} (by $process)"
        else
            echo -e "  Port $port: ${YELLOW}AVAILABLE${NC}"
        fi
    done
}

# Function to get public IP
get_public_ip() {
    echo -e "\n${BLUE}🌍 Public IP Address:${NC}"
    local public_ip=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null || echo "Unable to determine")
    echo "  $public_ip"
}

# Function to check firewall status
check_firewall() {
    echo -e "\n${BLUE}🔥 Firewall Status:${NC}"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        local firewall_status=$(sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate 2>/dev/null || echo "Unknown")
        echo "  macOS Firewall: $firewall_status"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v ufw &> /dev/null; then
            local ufw_status=$(sudo ufw status 2>/dev/null | head -1 || echo "Unknown")
            echo "  UFW Status: $ufw_status"
        fi
        
        if command -v iptables &> /dev/null; then
            local iptables_rules=$(sudo iptables -L | wc -l)
            echo "  iptables rules: $iptables_rules"
        fi
    fi
}

# Function to provide port forwarding guidance
port_forwarding_guidance() {
    echo -e "\n${BLUE}📋 Port Forwarding Guidance:${NC}"
    echo "================================"
    
    echo -e "\n${YELLOW}For Router Port Forwarding:${NC}"
    echo "1. Access your router's admin panel (usually 192.168.1.1 or 192.168.0.1)"
    echo "2. Look for 'Port Forwarding' or 'Virtual Server' settings"
    echo "3. Add these rules:"
    echo "   - External Port: 3000 → Internal IP: YOUR_IP → Internal Port: 3000"
    echo "   - External Port: 3443 → Internal IP: YOUR_IP → Internal Port: 3443"
    echo "   - External Port: 8080 → Internal IP: YOUR_IP → Internal Port: 8080"
    echo "4. Save and restart your router"
    
    echo -e "\n${YELLOW}For Cloud/VPS Deployment:${NC}"
    echo "1. Ensure security groups allow ports 3000, 3443, 8080"
    echo "2. Update firewall rules if needed"
    echo "3. Use the public IP address in your configuration"
    
    echo -e "\n${YELLOW}For VPN/Tunneling:${NC}"
    echo "1. Use services like ngrok, Cloudflare Tunnel, or Tailscale"
    echo "2. Example with ngrok:"
    echo "   ngrok http 8080"
    echo "   ngrok http 3000"
    echo "3. Use the provided public URLs in your configuration"
}

# Function to generate connection URLs
generate_connection_urls() {
    local local_ip=$(get_local_ip)
    local public_ip=$(curl -s ifconfig.me 2>/dev/null || echo "UNKNOWN")
    
    echo -e "\n${BLUE}🔗 Connection URLs:${NC}"
    echo "===================="
    
    echo -e "\n${GREEN}Local Network Access:${NC}"
    echo "  Server: https://$local_ip:3000"
    echo "  Client: https://$local_ip:8080"
    
    if [[ "$public_ip" != "UNKNOWN" ]]; then
        echo -e "\n${GREEN}Internet Access (if port forwarded):${NC}"
        echo "  Server: https://$public_ip:3000"
        echo "  Client: https://$public_ip:8080"
    fi
    
    echo -e "\n${YELLOW}For other computers to connect:${NC}"
    echo "1. Use the local IP for same network"
    echo "2. Use the public IP for internet access"
    echo "3. Accept SSL certificate warnings"
    echo "4. Ensure firewall allows the connections"
}

# Function to get local IP
get_local_ip() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        hostname -I | awk '{print $1}'
    else
        echo "127.0.0.1"
    fi
}

# Function to test connectivity
test_connectivity() {
    local target_ip=$1
    local port=$2
    
    if timeout 3 bash -c "</dev/tcp/$target_ip/$port" 2>/dev/null; then
        echo -e "${GREEN}✅ Port $port is reachable${NC}"
    else
        echo -e "${RED}❌ Port $port is not reachable${NC}"
    fi
}

# Main execution
main() {
    echo -e "${BLUE}🚀 Starting network discovery...${NC}"
    
    # Get network information
    get_network_interfaces
    check_ports
    get_public_ip
    check_firewall
    
    # Generate connection information
    generate_connection_urls
    
    # Provide guidance
    port_forwarding_guidance
    
    echo -e "\n${GREEN}🎉 Network discovery completed!${NC}"
    echo -e "${BLUE}📖 Next steps:${NC}"
    echo "1. Run ./setup-network.sh to configure the application"
    echo "2. Start the application with: docker-compose up --build"
    echo "3. Share the connection URLs with other developers"
    echo "4. Configure port forwarding if needed for internet access"
}

# Run main function
main "$@"
