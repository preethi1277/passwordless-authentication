import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  query, 
  where,
  addDoc,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from './firebase';

export interface SimpleUser {
  email: string;
  encryptionKey: string;
  fingerprintHash: string;
  deviceFingerprint: string;
  isVerified: boolean;
  createdAt: any;
  lastLoginAt?: any;
}

export interface ValidationAttempt {
  email: string;
  success: boolean;
  reason?: string;
  timestamp: any;
  deviceInfo: any;
}

export class SimpleFirebaseAuth {
  // Generate encryption key for fingerprint
  static async generateEncryptionKey(): Promise<string> {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Create fingerprint hash
  static async createFingerprintHash(credentialId: string, deviceInfo: any): Promise<string> {
    const fingerprintData = {
      credentialId,
      userAgent: deviceInfo.userAgent,
      platform: deviceInfo.platform,
      timestamp: Date.now()
    };
    
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(fingerprintData));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Generate device fingerprint
  static async generateDeviceFingerprint(): Promise<string> {
    const deviceData = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio,
      hardwareConcurrency: navigator.hardwareConcurrency,
      maxTouchPoints: navigator.maxTouchPoints
    };

    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(deviceData));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Validate email format
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Check if email already exists
  static async emailExists(email: string): Promise<boolean> {
    try {
      const userRef = doc(db, 'simple_users', email);
      const userSnap = await getDoc(userRef);
      return userSnap.exists();
    } catch (error) {
      console.error('Error checking email existence:', error);
      return false;
    }
  }

  // Register new user with fingerprint
  static async registerUser(
    email: string, 
    credentialId: string, 
    deviceInfo: any
  ): Promise<{ success: boolean; encryptionKey?: string; error?: string }> {
    try {
      // Validate email
      if (!this.validateEmail(email)) {
        return { success: false, error: 'Invalid email format' };
      }

      // Check if email already exists
      if (await this.emailExists(email)) {
        return { success: false, error: 'Email already registered' };
      }

      // Generate encryption key and hashes
      const encryptionKey = await this.generateEncryptionKey();
      const fingerprintHash = await this.createFingerprintHash(credentialId, deviceInfo);
      const deviceFingerprint = await this.generateDeviceFingerprint();

      // Check if device is already registered to another email
      const deviceQuery = query(
        collection(db, 'simple_users'),
        where('deviceFingerprint', '==', deviceFingerprint)
      );
      const deviceDocs = await getDocs(deviceQuery);
      
      if (!deviceDocs.empty) {
        return { success: false, error: 'This device is already registered to another account' };
      }

      // Create user document
      const userData: SimpleUser = {
        email,
        encryptionKey,
        fingerprintHash,
        deviceFingerprint,
        isVerified: true,
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, 'simple_users', email), userData);

      // Log registration
      await this.logValidationAttempt({
        email,
        success: true,
        reason: 'User registered successfully',
        timestamp: serverTimestamp(),
        deviceInfo
      });

      return { success: true, encryptionKey };

    } catch (error) {
      console.error('Error registering user:', error);
      return { success: false, error: 'Registration failed' };
    }
  }

  // Validate user with fingerprint
  static async validateUser(
    email: string, 
    credentialId: string, 
    deviceInfo: any
  ): Promise<{ success: boolean; encryptionKey?: string; error?: string }> {
    try {
      // Validate email format
      if (!this.validateEmail(email)) {
        await this.logValidationAttempt({
          email,
          success: false,
          reason: 'Invalid email format',
          timestamp: serverTimestamp(),
          deviceInfo
        });
        return { success: false, error: 'Invalid email format' };
      }

      // Get user data
      const userRef = doc(db, 'simple_users', email);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await this.logValidationAttempt({
          email,
          success: false,
          reason: 'User not found',
          timestamp: serverTimestamp(),
          deviceInfo
        });
        return { success: false, error: 'User not found' };
      }

      const userData = userSnap.data() as SimpleUser;

      // Check if user is verified
      if (!userData.isVerified) {
        await this.logValidationAttempt({
          email,
          success: false,
          reason: 'User not verified',
          timestamp: serverTimestamp(),
          deviceInfo
        });
        return { success: false, error: 'Account not verified' };
      }

      // Generate current device fingerprint
      const currentDeviceFingerprint = await this.generateDeviceFingerprint();

      // Validate device fingerprint
      if (userData.deviceFingerprint !== currentDeviceFingerprint) {
        await this.logValidationAttempt({
          email,
          success: false,
          reason: 'Device fingerprint mismatch',
          timestamp: serverTimestamp(),
          deviceInfo
        });
        return { success: false, error: 'Device not recognized' };
      }

      // Generate current fingerprint hash
      const currentFingerprintHash = await this.createFingerprintHash(credentialId, deviceInfo);

      // Validate fingerprint hash
      if (userData.fingerprintHash !== currentFingerprintHash) {
        await this.logValidationAttempt({
          email,
          success: false,
          reason: 'Fingerprint hash mismatch',
          timestamp: serverTimestamp(),
          deviceInfo
        });
        return { success: false, error: 'Fingerprint validation failed' };
      }

      // Update last login
      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp()
      });

      // Log successful validation
      await this.logValidationAttempt({
        email,
        success: true,
        reason: 'Validation successful',
        timestamp: serverTimestamp(),
        deviceInfo
      });

      return { success: true, encryptionKey: userData.encryptionKey };

    } catch (error) {
      console.error('Error validating user:', error);
      await this.logValidationAttempt({
        email,
        success: false,
        reason: `Validation error: ${error}`,
        timestamp: serverTimestamp(),
        deviceInfo
      });
      return { success: false, error: 'Validation failed' };
    }
  }

  // Encrypt data using user's encryption key
  static async encryptData(data: string, encryptionKey: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const keyData = encoder.encode(encryptionKey.slice(0, 32)); // Use first 32 chars as key
      
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      );

      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encodedData = encoder.encode(data);

      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        encodedData
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);

      return Array.from(combined, byte => byte.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('Encryption error:', error);
      throw error;
    }
  }

  // Decrypt data using user's encryption key
  static async decryptData(encryptedData: string, encryptionKey: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      const keyData = encoder.encode(encryptionKey.slice(0, 32));
      
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );

      // Convert hex string back to bytes
      const combined = new Uint8Array(
        encryptedData.match(/.{2}/g)!.map(byte => parseInt(byte, 16))
      );

      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        encrypted
      );

      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Decryption error:', error);
      throw error;
    }
  }

  // Log validation attempts
  static async logValidationAttempt(attempt: ValidationAttempt): Promise<void> {
    try {
      await addDoc(collection(db, 'validation_attempts'), attempt);
    } catch (error) {
      console.error('Error logging validation attempt:', error);
    }
  }

  // Get recent failed attempts for rate limiting
  static async getRecentFailedAttempts(email: string, minutes: number = 15): Promise<number> {
    try {
      const timeThreshold = new Date(Date.now() - minutes * 60 * 1000);
      
      const attemptsQuery = query(
        collection(db, 'validation_attempts'),
        where('email', '==', email),
        where('success', '==', false),
        where('timestamp', '>', timeThreshold)
      );

      const attempts = await getDocs(attemptsQuery);
      return attempts.size;
    } catch (error) {
      console.error('Error getting failed attempts:', error);
      return 0;
    }
  }

  // Check if user is rate limited
  static async isRateLimited(email: string): Promise<boolean> {
    const failedAttempts = await this.getRecentFailedAttempts(email);
    return failedAttempts >= 5; // Rate limit after 5 failed attempts
  }
}
