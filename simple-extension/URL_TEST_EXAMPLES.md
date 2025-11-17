# 🔗 URL Fraud Detection - Test Examples

## ✅ SAFE URLs (Should show LOW/NO RISK)

```
https://www.google.com
https://github.com/fraud-fence
https://www.amazon.com/products
https://www.microsoft.com/en-us/
https://stackoverflow.com/questions
```

---

## ⚠️ MEDIUM RISK URLs (Should show WARNINGS)

### URL Shorteners (Hide destination)
```
https://bit.ly/abc123
https://tinyurl.com/xyz789
https://t.co/abcd1234
```

### No HTTPS (Insecure)
```
http://example-bank.com/login
http://paypal-verify.com
```

### Suspicious Keywords in Unknown Domains
```
https://secure-login-verify.com
https://account-update-center.com
https://confirm-identity-now.com
```

### Excessive Subdomains
```
https://login.secure.verify.account.example.com
https://payment.confirm.update.verify.banking-site.com
```

---

## 🚨 HIGH RISK URLs (Should show DANGER)

### IP Addresses (Major red flag)
```
http://192.168.1.100/login
https://203.45.67.89/paypal
http://10.0.0.5/verify-account
```

### Suspicious Free Domain Extensions
```
https://paypal-login.tk
https://amazon-verify.ml
https://microsoft-update.ga
https://apple-secure.cf
https://netflix-confirm.gq
```

### Typosquatting (Impersonation)
```
https://gooogle.com/signin
https://paypai.com/login
https://facebok.com/verify
https://amaz0n.com/account
https://micros0ft.com/update
https://app1e.com/id/verify
```

### @ Symbol Phishing
```
https://user:pass@fake-site.com
https://admin@malicious-domain.com
https://paypal.com@evil-site.tk
```

### Multiple Red Flags Combined
```
http://192.168.1.50/paypal-verify-account-login
https://secure-banking-login-verify.tk
http://amaz0n-account-update.ml/signin
https://user@paypal-verify.ga/confirm
```

---

## 🧪 How to Test

### Method 1: Direct Paste
1. Click the Fraud Fence extension icon
2. Paste any URL from above into the text box
3. Analysis runs automatically after 1 second

### Method 2: Select & Analyze
1. Select a URL from any webpage
2. Click the Fraud Fence icon
3. Analysis runs immediately

### Method 3: Right-Click
1. Select a URL on any page
2. Right-click → "Check for Fraud with Fraud Fence"
3. Click extension icon when notified

---

## 🎯 What the Extension Checks

### URL Analysis Includes:
1. ✅ **IP Address Detection** - Sites should use domain names, not IPs
2. ✅ **Suspicious TLDs** - Free domains (.tk, .ml, .ga, .cf, .gq, .xyz)
3. ✅ **URL Shorteners** - bit.ly, tinyurl, t.co (hide real destination)
4. ✅ **Excessive Subdomains** - login.secure.verify.account.example.com
5. ✅ **Suspicious Keywords** - "verify", "login", "secure", "account" in unknown domains
6. ✅ **Typosquatting** - gooogle.com, paypai.com, facebok.com
7. ✅ **HTTPS Missing** - HTTP is insecure for login/banking sites
8. ✅ **@ Symbol** - Credential hiding technique
9. ✅ **Excessive Hyphens** - secure-login-verify-account-now.com
10. ✅ **Long Domains** - Very long domain names (over 30 characters)
11. ✅ **Suspicious Paths** - /login, /signin, /verify in untrusted domains

---

## 📊 Risk Scoring

| Score | Risk Level | Recommendation |
|-------|-----------|----------------|
| 50+ | 🚨 HIGH RISK | DO NOT CLICK - Likely phishing |
| 25-49 | ⚠️ MEDIUM RISK | Verify before clicking |
| 1-24 | ⚠️ LOW RISK | Minor concerns detected |
| 0 | ✅ SAFE | No major indicators found |

---

## 💡 Pro Tips

1. **Always verify URLs** before entering passwords or payment info
2. **Check the domain carefully** - Look for typos (gooogle vs google)
3. **Hover over links** to see real destination before clicking
4. **Use official apps** instead of clicking email links
5. **Check for HTTPS** on login/payment pages
6. **Be suspicious of shortened URLs** - They hide the real destination
7. **Never trust IP addresses** for legitimate sites

---

**Last Updated:** November 17, 2025  
**Feature:** URL Fraud Detection Added
