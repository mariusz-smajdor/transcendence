# 🌐 Multi-Computer Network Setup Guide

This guide explains how to set up the Transcendence project to work across multiple computers on different networks.

## 📋 Prerequisites

- Docker and Docker Compose installed on all computers
- OpenSSL installed (for SSL certificates)
- All computers connected to the internet (can be on different networks)

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)

Run the automated network setup script:

```bash
./setup-network.sh
```

This script will:

- Detect your local IP address
- Create environment configuration files
- Generate SSL certificates for remote access
- Configure CORS settings
- Display connection information

### Option 2: Manual Setup

1. **Find your computer's IP address:**

   ```bash
   # macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1

   # Or use
   hostname -I
   ```

2. **Create environment files:**

   Create `.env` in the project root:

   ```bash
   cp env.example .env
   ```

   Edit `.env` and set:

   ```env
   SERVER_HOST=0.0.0.0
   CLIENT_HOST=0.0.0.0
   SERVER_IP=YOUR_IP_ADDRESS
   CLIENT_IP=YOUR_IP_ADDRESS
   ```

3. **Create client environment file:**

   Create `client/.env`:

   ```env
   VITE_SERVER_URL=https://YOUR_IP_ADDRESS:3000
   VITE_WS_URL=wss://YOUR_IP_ADDRESS:3000
   VITE_CLIENT_PORT=8080
   VITE_CLIENT_HOST=0.0.0.0
   ```

4. **Generate SSL certificates:**

   ```bash
   ./generate-certs.sh
   ```

5. **Start the application:**
   ```bash
   docker-compose up --build
   ```

## 🔧 Configuration Details

### Server Configuration

The server is configured to:

- Listen on all interfaces (`0.0.0.0:3000`)
- Accept connections from any IP address in private ranges
- Use HTTPS with self-signed certificates
- Support WebSocket connections

### Client Configuration

The client is configured to:

- Connect to the server using the server's IP address
- Listen on all interfaces (`0.0.0.0:8080`)
- Use HTTPS with self-signed certificates
- Proxy API requests to the server

### CORS Configuration

The server accepts requests from:

- `localhost:8080` (local development)
- Any IP address in private ranges (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
- Requests without origin headers (mobile apps, Postman)

## 🌍 Network Scenarios

### Scenario 1: Same Local Network

- All computers connected to the same WiFi/router
- Use the router's assigned IP addresses
- Firewall should allow ports 3000, 3443, and 8080

### Scenario 2: Different Networks (Your Case)

- Laptop on WiFi, other computers on Ethernet
- Use the server computer's public IP or set up port forwarding
- Consider using a VPN or tunneling service

### Scenario 3: Internet Access

- Use cloud hosting (AWS, DigitalOcean, etc.)
- Set up proper domain names and SSL certificates
- Configure firewall and security groups

## 🔒 Security Considerations

### Development Environment

- Self-signed certificates are used (browsers will show warnings)
- Accept the security warnings in your browser
- CORS is configured for development (not production-ready)

### Production Environment

- Use proper SSL certificates from a trusted CA
- Restrict CORS to specific domains
- Implement proper authentication and authorization
- Use environment variables for sensitive data

## 🛠️ Troubleshooting

### Common Issues

1. **Connection Refused**

   - Check if ports 3000, 3443, and 8080 are open
   - Verify firewall settings
   - Ensure Docker containers are running

2. **CORS Errors**

   - Check if the client is using the correct server IP
   - Verify CORS configuration in server code
   - Check browser console for detailed error messages

3. **SSL Certificate Warnings**

   - This is normal for self-signed certificates
   - Click "Advanced" and "Proceed to site" in your browser
   - Consider using a proper SSL certificate for production

4. **WebSocket Connection Issues**
   - Ensure WebSocket endpoints are properly configured
   - Check if the server supports WebSocket connections
   - Verify network connectivity between client and server

### Debugging Commands

```bash
# Check if ports are listening
netstat -tulpn | grep :3000
netstat -tulpn | grep :8080

# Check Docker containers
docker ps

# Check Docker logs
docker-compose logs server
docker-compose logs client

# Test connectivity
curl -k https://YOUR_SERVER_IP:3000
```

## 📱 Mobile Development

For mobile app development:

- Use the server's IP address in your mobile app configuration
- Ensure the mobile device can reach the server IP
- Consider using a tunneling service like ngrok for testing

## 🔄 Updating Configuration

To change the server IP or other settings:

1. Update `.env` file with new IP
2. Update `client/.env` file with new server URL
3. Regenerate certificates if needed:
   ```bash
   ./generate-certs.sh
   ```
4. Restart Docker containers:
   ```bash
   docker-compose down
   docker-compose up --build
   ```

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Check Docker and network connectivity
4. Review the logs for error messages

## 🎯 Next Steps

After successful setup:

1. Update Google OAuth settings with your server IP
2. Test the application from different computers
3. Configure your development workflow
4. Consider setting up CI/CD for automated deployments
