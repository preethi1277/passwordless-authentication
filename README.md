<h1>🔐 Passwordless Authentication - Secure Login Solution  </h1>
A secure and seamless authentication system that removes the need for traditional passwords.  
This project leverages **FIDO2/WebAuthn, biometrics, OTP, and magic links** to provide strong protection against phishing, credential stuffing, and brute-force attacks.  

---

<h2>📌 About  </h2>
This project demonstrates a **passwordless authentication system** designed to: 
- Improve login security by eliminating password-based risks  
- Provide a smooth user experience with modern authentication methods  
- Ensure compliance with **NIST, GDPR, ISO 27001, and OWASP** security standards  

---

<h2>✨ Features  </h2>
✅ Passwordless login (Biometrics, OTP, Magic Links, Security Keys)  
✅ Secure onboarding and account recovery  
✅ Multi-device support (Desktop, Mobile, IoT)  
✅ Integration with **FIDO2/WebAuthn**  
✅ Encrypted communication with **TLS 1.3 & AES-256**  
✅ Automated security testing in CI/CD pipelines  
✅ Real-time logging, monitoring & anomaly detection  

---

<h2> ⚙️ Tech Stack  </h2>
| Layer          | Tech Used                                      |  
|----------------|-----------------------------------------------|  
| Frontend       | JavaScript (WebAuthn integration)             |  
| Backend        | Python, Go                                    |  
| Authentication | FIDO2, WebAuthn, OAuth 2.0, OpenID Connect    |  
| Security Tools | YubiKeys, Titan Keys, Face ID, Touch ID       |  
| Cloud Services | AWS Cognito, Firebase Auth, Azure AD B2C      |  
| Encryption     | AES-256 (data at rest), TLS 1.3 (in transit)  |  

---

<h2> 🧠 How It Works  </h2>
1. User enters email/username  <br>
2. System prompts authentication via **biometrics, OTP, or security key**  <br>
3. A signed cryptographic response is sent to the server  <br>
4. Server verifies the signature and grants access  <br>
5. Security logs & monitoring track suspicious activity  <br>

---

<h2> 🧩 How to Run (Developer Setup)  </h2>
1. Clone the repo:  
   ```bash
   git clone https://github.com/preethi1277/passwordless-authentication.git
   cd passwordless-authentication
