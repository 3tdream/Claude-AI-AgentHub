# 🌐 Proxy Setup Guide for Restricted Regions

This guide helps you configure the Telegram MCP server to work reliably in regions with internet censorship (Russia, Iran, China, etc.).

## 📋 Table of Contents
- [Why Proxy is Needed](#why-proxy-is-needed)
- [Supported Protocols](#supported-protocols)
- [Quick Setup](#quick-setup)
- [Protocol Configurations](#protocol-configurations)
- [Troubleshooting](#troubleshooting)

---

## 🔒 Why Proxy is Needed

In some countries, Telegram is blocked or heavily restricted:
- **Russia**: DPI blocks Telegram IPs
- **Iran**: Full Telegram blocking
- **China**: Great Firewall blocks MTProto

**Solution**: Use circumvention protocols that:
1. Bypass Deep Packet Inspection (DPI)
2. Obfuscate traffic patterns
3. Look like regular HTTPS traffic

---

## 🛡️ Supported Protocols

### 1. **VLESS+Reality (Xray)** ⭐ Recommended
- **Best for**: Bypassing sophisticated DPI
- **Speed**: Very fast
- **Detection resistance**: Excellent
- **Setup complexity**: Medium

### 2. **AmneziaWG**
- **Best for**: WireGuard users, mobile devices
- **Speed**: Excellent
- **Detection resistance**: Good
- **Setup complexity**: Easy

### 3. **Hysteria 2**
- **Best for**: Unstable/lossy networks
- **Speed**: Good (adaptive)
- **Detection resistance**: Good
- **Setup complexity**: Easy

---

## ⚡ Quick Setup

### Step 1: Choose Your Proxy Server

You need a VPS server **outside** the restricted region:
- **Recommended providers**: Hetzner (Germany), Vultr, DigitalOcean
- **Location**: EU, Singapore, or US
- **Specs**: 1GB RAM, 1 CPU core is enough

### Step 2: Configure Proxy on .env

Edit your `.env` file:

```bash
# Enable proxy
PROXY_ENABLED=true
PROXY_TYPE=socks5
PROXY_HOST=127.0.0.1  # or your proxy server IP
PROXY_PORT=1080       # your proxy SOCKS5 port
PROXY_USERNAME=       # optional
PROXY_PASSWORD=       # optional
```

---

## 🔧 Protocol Configurations

## Option 1: VLESS+Reality (Xray) 🔥

### Server Setup (VPS)

```bash
# 1. Install Xray
bash -c "$(curl -L https://github.com/XTLS/Xray-install/raw/main/install-release.sh)" @ install

# 2. Configure Xray
sudo nano /usr/local/etc/xray/config.json
```

**Xray Server Config:**
```json
{
  "inbounds": [
    {
      "port": 443,
      "protocol": "vless",
      "settings": {
        "clients": [
          {
            "id": "YOUR-UUID-HERE",
            "flow": "xtls-rprx-vision"
          }
        ],
        "decryption": "none"
      },
      "streamSettings": {
        "network": "tcp",
        "security": "reality",
        "realitySettings": {
          "dest": "www.microsoft.com:443",
          "serverNames": ["www.microsoft.com"],
          "privateKey": "YOUR-PRIVATE-KEY",
          "shortIds": [""]
        }
      }
    },
    {
      "port": 1080,
      "protocol": "socks",
      "settings": {
        "auth": "noauth",
        "udp": true
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom"
    }
  ]
}
```

```bash
# 3. Start Xray
sudo systemctl start xray
sudo systemctl enable xray
```

### Client Setup (Your Machine)

**Option A: Use Xray Client + SOCKS5**

```bash
# Install Xray locally
# Download from: https://github.com/XTLS/Xray-core/releases

# Create local config.json
{
  "inbounds": [
    {
      "port": 1080,
      "protocol": "socks",
      "settings": {
        "auth": "noauth",
        "udp": true
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "vless",
      "settings": {
        "vnext": [
          {
            "address": "YOUR-SERVER-IP",
            "port": 443,
            "users": [
              {
                "id": "YOUR-UUID-HERE",
                "encryption": "none",
                "flow": "xtls-rprx-vision"
              }
            ]
          }
        ]
      },
      "streamSettings": {
        "network": "tcp",
        "security": "reality",
        "realitySettings": {
          "serverName": "www.microsoft.com",
          "publicKey": "YOUR-PUBLIC-KEY",
          "shortId": "",
          "fingerprint": "chrome"
        }
      }
    }
  ]
}

# Run Xray
xray run -c config.json
```

Then set in `.env`:
```bash
PROXY_ENABLED=true
PROXY_HOST=127.0.0.1
PROXY_PORT=1080
```

---

## Option 2: AmneziaWG

### Server Setup (VPS)

```bash
# 1. Install AmneziaWG
curl -fsSL https://get.amnezia.org | sh

# 2. Configure
sudo amneziawg-quick up wg0

# 3. Add peer
sudo wg set wg0 peer YOUR_PUBLIC_KEY allowed-ips 0.0.0.0/0

# 4. Enable IP forwarding
echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Client Setup

1. **Install AmneziaVPN client**
   - Windows: Download from [amnezia.org](https://amnezia.org)
   - Import server config

2. **Enable SOCKS5 proxy in AmneziaVPN settings**

3. **Configure .env:**
```bash
PROXY_ENABLED=true
PROXY_HOST=127.0.0.1
PROXY_PORT=1080  # AmneziaVPN SOCKS5 port
```

---

## Option 3: Hysteria 2

### Server Setup (VPS)

```bash
# 1. Install Hysteria 2
bash <(curl -fsSL https://get.hy2.sh/)

# 2. Create config
sudo nano /etc/hysteria/config.yaml
```

**Hysteria Server Config:**
```yaml
listen: :443

tls:
  cert: /path/to/fullchain.pem
  key: /path/to/privkey.pem

auth:
  type: password
  password: YOUR_STRONG_PASSWORD

masquerade:
  type: proxy
  proxy:
    url: https://www.bing.com
    rewriteHost: true

socks5:
  listen: 127.0.0.1:1080
```

```bash
# 3. Start Hysteria
sudo systemctl start hysteria-server
sudo systemctl enable hysteria-server
```

### Client Setup

```yaml
# Create client config: hysteria-client.yaml
server: YOUR-SERVER-IP:443

auth: YOUR_STRONG_PASSWORD

tls:
  sni: YOUR-DOMAIN.com
  insecure: false

socks5:
  listen: 127.0.0.1:1080

bandwidth:
  up: 50 mbps
  down: 100 mbps
```

```bash
# Run client
hysteria -c hysteria-client.yaml
```

**Configure .env:**
```bash
PROXY_ENABLED=true
PROXY_HOST=127.0.0.1
PROXY_PORT=1080
```

---

## 🧪 Testing Your Proxy

### Test 1: Check Proxy Connection
```bash
# Install curl with SOCKS5 support
curl --socks5 127.0.0.1:1080 https://ipinfo.io
```

Should return your **VPS server's IP**, not your local IP.

### Test 2: Test Telegram Connection
```bash
# Rebuild the project
npm run build

# Run with proxy
npm run dev
```

Check logs for:
```
Using SOCKS5 proxy: 127.0.0.1:1080
Connecting to Telegram...
Connection to 149.154.167.91:80/TCPFull complete!
```

---

## 📊 Performance Comparison

| Protocol | Speed | Stability | Setup | Detection Resistance |
|----------|-------|-----------|-------|---------------------|
| VLESS+Reality | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| AmneziaWG | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Hysteria 2 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

**Recommendation**: Use **VLESS+Reality** for maximum censorship resistance.

---

## 🔧 Troubleshooting

### Problem: "Connection failed" error

**Solution 1**: Check proxy is running
```bash
# Test SOCKS5 proxy
curl --socks5 127.0.0.1:1080 https://telegram.org
```

**Solution 2**: Check firewall
```bash
# On VPS
sudo ufw allow 443/tcp
sudo ufw allow 1080/tcp
```

### Problem: "Proxy timeout"

**Solution**: Increase connectionRetries in `src/index.ts`:
```typescript
const client = new TelegramClient(stringSession, apiId, apiHash, {
  connectionRetries: 10,  // Increase from 5
  proxy: proxyConfig,
});
```

### Problem: DPI still detecting traffic

**Solution**: Switch from Hysteria to VLESS+Reality (better obfuscation)

---

## 🚀 Production Deployment

### For Russian Users:

1. **VPS Location**: Choose EU servers (Hetzner Germany recommended)
2. **Protocol**: VLESS+Reality (most resistant to Russian DPI)
3. **Backup**: Set up 2-3 servers in different locations
4. **Monitoring**: Use uptime monitoring (UptimeRobot)

### Environment Setup:
```bash
# Production .env
PROXY_ENABLED=true
PROXY_HOST=your-vps-ip
PROXY_PORT=443  # VLESS+Reality uses 443
```

---

## 📚 Additional Resources

- [Xray Documentation](https://xtls.github.io/)
- [AmneziaVPN](https://amnezia.org/)
- [Hysteria 2 Docs](https://v2.hysteria.network/)
- [V2Ray Config Generator](https://v2rayconfig.com/)

---

## ⚠️ Legal Notice

**This guide is for educational purposes and to help users access communication services in regions with internet censorship. Always comply with local laws and regulations.**

---

## 💡 Tips

- **Rotate servers**: Don't use the same VPS for too long
- **Use CDN**: Put Cloudflare in front for extra protection
- **Multiple protocols**: Have backup proxies ready
- **Monitor logs**: Watch for connection issues
- **Auto-reconnect**: The MCP server has built-in retry logic

Good luck! 🎉
