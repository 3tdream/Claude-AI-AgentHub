# 🇷🇺 Russian Testing Setup - Phase 1

## Goal: Test with Russian users using proxy NOW

---

## 🚀 Quick Setup (30 minutes)

### Step 1: Rent VPS for Proxy

**Recommended: Hetzner Germany**

1. Go to: https://www.hetzner.com/cloud
2. Create account
3. Order server:
   - **Type:** CX11 (€3.99/month)
   - **Location:** Falkenstein, Germany
   - **OS:** Ubuntu 22.04
   - **Backup:** Optional

**Alternative: Vultr**
- https://www.vultr.com/
- $6/month server
- Frankfurt location

**Note IP Address:** You'll get something like `95.216.xxx.xxx`

---

### Step 2: Install Xray with Reality (10 minutes)

SSH into your VPS:

```bash
ssh root@YOUR_VPS_IP
```

Run auto-installer:

```bash
# Install Xray with Reality auto-config
bash <(curl -Ls https://raw.githubusercontent.com/chika0801/Xray-install/main/install.sh)
```

**During installation:**
- Choose option 1: VLESS+Reality
- It will auto-generate everything
- **SAVE THE OUTPUT!** You need:
  - UUID
  - Public Key
  - Private Key
  - Short ID

**Alternative manual script:**

```bash
# 1. Install Xray
bash -c "$(curl -L https://github.com/XTLS/Xray-install/raw/main/install-release.sh)" @ install

# 2. Generate keys
xray x25519

# 3. Create config (see PROXY_SETUP.md for full config)
nano /usr/local/etc/xray/config.json

# 4. Start Xray
systemctl start xray
systemctl enable xray
```

---

### Step 3: Configure Local Client (5 minutes)

**For Russian Testers:**

**Option A: v2rayN (Windows)**

1. Download: https://github.com/2dust/v2rayN/releases
2. Extract and run v2rayN.exe
3. Click "Servers" → "Add VLESS Server"
4. Enter:
   - Address: YOUR_VPS_IP
   - Port: 443
   - UUID: (from Step 2)
   - Flow: xtls-rprx-vision
   - Security: reality
   - SNI: www.microsoft.com
   - Public Key: (from Step 2)
   - Short ID: (from Step 2)
5. Right-click server → "Set as active server"
6. Settings → Enable "Local SOCKS Port" → 1080

**Option B: Nekoray (Windows/Linux/Mac)**

1. Download: https://github.com/MatsuriDayo/nekoray/releases
2. Similar setup to v2rayN

**Option C: v2rayNG (Android)**

1. Play Store or: https://github.com/2dust/v2rayNG/releases
2. Import config via QR code or manual entry

---

### Step 4: Update Telegram MCP .env

For **Russian testers**, use proxy:

```bash
# .env for Russian testing
TELEGRAM_API_ID=31418699
TELEGRAM_API_HASH=5af1f4855d6707481f24be592019e89c
TELEGRAM_SESSION=your_session_here

# Enable proxy
PROXY_ENABLED=true
PROXY_TYPE=socks5
PROXY_HOST=127.0.0.1
PROXY_PORT=1080
```

For **International testers**, no proxy:

```bash
# .env for international testing
TELEGRAM_API_ID=31418699
TELEGRAM_API_HASH=5af1f4855d6707481f24be592019e89c
TELEGRAM_SESSION=your_session_here

# Disable proxy
PROXY_ENABLED=false
```

---

### Step 5: Test Proxy Connection

**Test from your machine (simulating Russian user):**

```bash
# 1. Start v2rayN/Nekoray (SOCKS5 on 127.0.0.1:1080)

# 2. Test proxy works
curl --socks5 127.0.0.1:1080 https://ipinfo.io

# Should return VPS IP, not your real IP

# 3. Test Telegram MCP with proxy
cd telegram-mcp
npm run build
npm run dev
```

**Expected output:**
```
Using SOCKS5 proxy: 127.0.0.1:1080
Connecting to Telegram...
Connection to 149.154.167.91:80/TCPFull complete! ✓
```

---

## 👥 Recruiting Russian Testers

### Where to Find Russian Testers:

1. **Russian Telegram Communities:**
   - @ru_python (Russian developers)
   - @prorussia (Tech community)
   - @habr_com (Tech articles)
   - @freelance_russia

2. **Russian Forums:**
   - Habr.com (Russian Hacker News)
   - VC.ru (Startup community)
   - Reddit: r/russia, r/russian

3. **VK (Russian Facebook):**
   - Tech groups
   - Developer communities
   - Beta tester groups

4. **Personal Network:**
   - Russian friends/colleagues
   - Telegram contacts in Russia

---

## 📝 Recruitment Message (Russian)

```
🧪 Ищу бета-тестеров из России!

Я создал Telegram MCP сервер с обходом блокировок через
VLESS+Reality. Нужны 5-10 тестеров из России для проверки.

Что вы получите:
- Бесплатный доступ к финальной версии навсегда
- 1000₽ за подробный отчёт
- Упоминание в проекте

Требования:
- Активный пользователь Telegram
- Базовые технические навыки
- 30 минут на тестирование

Интересно? Пишите в личку!
```

**English version:**

```
🧪 Looking for beta testers from Russia!

I built a Telegram MCP server with VLESS+Reality proxy
to bypass blocking. Need 5-10 testers from Russia.

What you get:
- Free lifetime access
- ₽1000 ($10) for detailed feedback
- Credit in project

Requirements:
- Active Telegram user
- Basic tech skills
- 30 mins testing time

Interested? DM me!
```

---

## 🧪 Russian-Specific Test Scenarios

### Scenario 1: Proxy Connection Test
**Priority: CRITICAL**

**Steps:**
1. Configure v2rayN with your VPS
2. Enable SOCKS5 on 1080
3. Set `PROXY_ENABLED=true` in .env
4. Run `npm run dev`
5. Send test message

**Expected:**
- ✓ Connects through proxy
- ✓ No blocking detected
- ✓ Messages send/receive normally

**Success Criteria:**
- 100% connection success
- <5 second latency

---

### Scenario 2: DPI Bypass Test
**Priority: HIGH**

**Test if Russian DPI detects traffic:**

**Steps:**
1. Monitor for 1 hour
2. Send 50+ messages
3. Check for disconnections
4. Verify no speed degradation

**Expected:**
- ✓ No disconnections
- ✓ Stable latency
- ✓ No throttling

**Success Criteria:**
- Zero DPI detection
- Consistent performance

---

### Scenario 3: Failover Test
**Priority: MEDIUM**

**Test backup servers:**

**Steps:**
1. Stop primary VPS
2. Configure backup VPS in .env
3. Verify auto-reconnect works
4. Test operations continue

**Expected:**
- ✓ Reconnects within 10 seconds
- ✓ No data loss
- ✓ Operations resume

---

### Scenario 4: Long-Running Stability (Russia)
**Priority: HIGH**

**Test 24-hour connection:**

**Steps:**
1. Start MCP server
2. Leave running for 24 hours
3. Perform operations every hour
4. Monitor connection drops

**Expected:**
- ✓ 99%+ uptime
- ✓ Auto-reconnect works
- ✓ No proxy blocks

**Success Criteria:**
- <3 disconnections in 24h
- All reconnects successful

---

### Scenario 5: Real-World Usage (Russia)
**Priority: HIGH**

**Test typical Russian use cases:**

**Steps:**
1. Join Russian Telegram channels
2. Search Russian language messages
3. Send Cyrillic text
4. Use Russian stickers
5. Voice messages in Russian

**Expected:**
- ✓ Perfect encoding (Cyrillic)
- ✓ All features work
- ✓ Cultural elements preserved

---

## 📊 Comparison Testing

### Direct vs Proxy Performance:

| Metric | International (Direct) | Russia (Proxy) | Delta |
|--------|----------------------|---------------|-------|
| Connection time | <1s | <3s | +2s |
| Message latency | <500ms | <1s | +500ms |
| Search speed | <1s | <2s | +1s |
| Success rate | 99%+ | 95%+ | -4% |

**Acceptable ranges:**
- Latency: +500-1000ms through proxy is OK
- Success: >95% is acceptable
- Disconnections: <5 per day is OK

---

## 🐛 Russian-Specific Issues to Watch

### Common Problems:

**Issue 1: Roskomnadzor Blocking**
- Symptom: Sudden disconnections
- Solution: Rotate proxy servers
- Prevention: Multiple VPS locations

**Issue 2: DPI Detection**
- Symptom: Traffic throttling
- Solution: Change SNI domain
- Prevention: Use Reality protocol (already done)

**Issue 3: Local ISP Blocking**
- Symptom: Can't connect to VPS
- Solution: Use CDN (Cloudflare)
- Prevention: Multiple VPS providers

**Issue 4: Cyrillic Encoding**
- Symptom: Garbled Russian text
- Solution: UTF-8 enforcement
- Prevention: Test Russian characters

---

## 🎯 Success Criteria (Russian Testing)

### Must Have:
- ✅ 95%+ connection success rate
- ✅ <2 second latency through proxy
- ✅ Zero DPI detection
- ✅ 24-hour stability test passed
- ✅ All Russian features work (Cyrillic, etc.)

### Should Have:
- ✅ <5 disconnections per 24h
- ✅ Auto-reconnect 100% success
- ✅ Multiple proxy servers tested
- ✅ Positive feedback from Russian testers

---

## 🔒 Security for Russian Testers

### Privacy Protection:

1. **No Logging:**
   ```bash
   # On VPS, disable logs
   systemctl stop rsyslog
   ```

2. **Encrypted Connection:**
   - VLESS+Reality = fully encrypted
   - Looks like HTTPS to Microsoft/Google

3. **Anonymous Payment:**
   - Pay testers via Crypto
   - Or Telegram anonymous payments

4. **No Personal Data:**
   - Don't collect Russian tester info
   - Use Telegram usernames only
   - No email/phone required

---

## 💰 Budget for Russian Testing

### Costs (Month 1):

**Infrastructure:**
- 1x VPS (Hetzner): €4/month
- 1x Backup VPS (Vultr): $6/month
- **Total: ~€10/month ($11)**

**Tester Incentives:**
- 5-10 Russian testers × ₽1000 each
- **Total: ₽5000-10000 (~$50-100)**

**Grand Total: ~$60-110 for Phase 1 testing**

**Worth it?** YES!
- Validates most important market
- Tests hardest technical challenge
- Real user feedback on proxy
- Phase 2 will be much smoother

---

## 📅 Timeline (Russian Testing)

### Week 1: Setup
- Day 1: Rent VPS, install Xray
- Day 2: Test proxy yourself
- Day 3: Create tester docs (Russian)
- Day 4-5: Recruit 5-10 Russian testers
- Day 6-7: Onboard Russian testers

### Week 2: Testing
- Day 1-3: Initial tests
- Day 4-5: 24-hour stability test
- Day 6-7: Advanced scenarios

### Week 3: Analysis
- Analyze results
- Fix issues
- Retest

### Week 4: Validation
- Final tests
- Confirm stability
- Ready for Phase 2

---

## ✅ Checklist for Russian Testing

**Before starting:**

- [ ] VPS rented and configured
- [ ] Xray with Reality installed
- [ ] Tested proxy from your machine
- [ ] Tested Telegram MCP with proxy
- [ ] Connection stable for 1 hour
- [ ] Documentation in Russian created
- [ ] Recruitment message prepared
- [ ] Payment method ready (₽1000 per tester)
- [ ] Telegram group for Russian testers created
- [ ] Privacy/security measures in place

**Ready to start recruiting!** 🚀

---

## 🆘 Quick Help

**Problem: Can't connect to VPS**
```bash
# Check if Xray is running
systemctl status xray

# Check firewall
ufw allow 443/tcp
```

**Problem: Proxy connects but Telegram doesn't**
```bash
# Test SOCKS5 proxy
curl --socks5 127.0.0.1:1080 https://telegram.org

# Check .env settings
PROXY_ENABLED=true
PROXY_PORT=1080  # Match your v2rayN port
```

**Problem: DPI detection**
```bash
# Change SNI to different domain
# In Xray config, try:
"serverNames": ["www.cloudflare.com"]  # instead of microsoft.com
```

---

**You're now ready to test with REAL Russian users!** 🇷🇺🚀
