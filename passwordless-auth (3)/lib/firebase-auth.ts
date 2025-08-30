import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  addDoc,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from './firebase';

export interface User {
  id: string;
  email: string;
  createdAt: any;
  isActive: boolean;
  biometricCredentials?: BiometricCredential[];
}

export interface BiometricCredential {
  id: string;
  credentialId: string;
  publicKey: string;
  counter: number;
  deviceInfo: {
    userAgent: string;
    platform: string;
    deviceFingerprint: string;
  };
  createdAt: any;
  lastUsedAt: any;
}

export interface AuthAttempt {
  email: string;
  userId?: string;
  authMethod: 'biometric' | 'recaptcha';
  success: boolean;
  failureReason?: string;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: any;
  createdAt: any;
}

export class FirebaseAuthService {
  // Create or get user
  static async createOrGetUser(email: string): Promise<User> {
    try {
      const userRef = doc(db, 'users', email);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return { id: email, ...userSnap.data() } as User;
      } else {
        const newUser: Omit<User, 'id'> = {
          email,
          createdAt: serverTimestamp(),
          isActive: true,
          biometricCredentials: []
        };

        await setDoc(userRef, newUser);
        return { id: email, ...newUser } as User;
      }
    } catch (error) {
      console.error('Error creating/getting user:', error);
      throw error;
    }
  }

  // Store biometric credential with security checks
  static async storeBiometricCredential(
    email: string, 
    credentialId: string, 
    publicKey: string,
    deviceInfo: any
  ): Promise<void> {
    try {
      // Generate device fingerprint for security
      const deviceFingerprint = await this.generateDeviceFingerprint(deviceInfo);
      
      // Check if this device fingerprint is already registered to another email
      const existingCredQuery = query(
        collection(db, 'biometric_credentials'),
        where('deviceInfo.deviceFingerprint', '==', deviceFingerprint)
      );
      
      const existingCreds = await getDocs(existingCredQuery);
      
      // Security check: Prevent same device from being used by different emails
      for (const credDoc of existingCreds.docs) {
        const credData = credDoc.data();
        if (credData.userEmail !== email) {
          throw new Error('This device fingerprint is already registered to another account');
        }
      }

      const credential: BiometricCredential = {
        id: credentialId,
        credentialId,
        publicKey,
        counter: 0,
        deviceInfo: {
          ...deviceInfo,
          deviceFingerprint
        },
        createdAt: serverTimestamp(),
        lastUsedAt: serverTimestamp()
      };

      // Store credential with user email reference
      await addDoc(collection(db, 'biometric_credentials'), {
        ...credential,
        userEmail: email
      });

      // Update user document
      const userRef = doc(db, 'users', email);
      await updateDoc(userRef, {
        [`biometricCredentials.${credentialId}`]: credential
      });

    } catch (error) {
      console.error('Error storing biometric credential:', error);
      throw error;
    }
  }

  // Verify biometric credential with enhanced security
  static async verifyBiometricCredential(
    email: string, 
    credentialId: string,
    deviceInfo: any
  ): Promise<boolean> {
    try {
      const deviceFingerprint = await this.generateDeviceFingerprint(deviceInfo);
      
      // Get user's credentials
      const credQuery = query(
        collection(db, 'biometric_credentials'),
        where('userEmail', '==', email),
        where('credentialId', '==', credentialId)
      );
      
      const credSnap = await getDocs(credQuery);
      
      if (credSnap.empty) {
        await this.logAuthAttempt({
          email,
          authMethod: 'biometric',
          success: false,
          failureReason: 'Credential not found',
          deviceInfo
        });
        return false;
      }

      const credData = credSnap.docs[0].data();
      
      // Security check: Verify device fingerprint matches
      if (credData.deviceInfo.deviceFingerprint !== deviceFingerprint) {
        await this.logAuthAttempt({
          email,
          authMethod: 'biometric',
          success: false,
          failureReason: 'Device fingerprint mismatch',
          deviceInfo
        });
        
        // Log security event
        await this.logSecurityEvent({
          userEmail: email,
          eventType: 'device_fingerprint_mismatch',
          severity: 'high',
          eventData: {
            expectedFingerprint: credData.deviceInfo.deviceFingerprint,
            actualFingerprint: deviceFingerprint
          }
        });
        
        return false;
      }

      // Update last used timestamp and counter
      await updateDoc(credSnap.docs[0].ref, {
        lastUsedAt: serverTimestamp(),
        counter: increment(1)
      });

      await this.logAuthAttempt({
        email,
        authMethod: 'biometric',
        success: true,
        deviceInfo
      });

      return true;
    } catch (error) {
      console.error('Error verifying biometric credential:', error);
      await this.logAuthAttempt({
        email,
        authMethod: 'biometric',
        success: false,
        failureReason: error instanceof Error ? error.message : 'Unknown error',
        deviceInfo
      });
      return false;
    }
  }

  // Generate unique device fingerprint
  static async generateDeviceFingerprint(deviceInfo: any): Promise<string> {
    const fingerprint = {
      userAgent: deviceInfo.userAgent || navigator.userAgent,
      platform: deviceInfo.platform || navigator.platform,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio
    };

    // Create hash of device characteristics
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(fingerprint));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Log authentication attempts
  static async logAuthAttempt(attempt: Omit<AuthAttempt, 'createdAt'>): Promise<void> {
    try {
      await addDoc(collection(db, 'auth_attempts'), {
        ...attempt,
        createdAt: serverTimestamp()
      });

      // Check for suspicious activity
      if (!attempt.success) {
        await this.checkFailedAttempts(attempt.email, attempt.authMethod);
      }
    } catch (error) {
      console.error('Error logging auth attempt:', error);
    }
  }

  // Check for failed attempts and implement security measures
  static async checkFailedAttempts(email: string, authMethod: string): Promise<void> {
    try {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      
      const failedAttemptsQuery = query(
        collection(db, 'auth_attempts'),
        where('email', '==', email),
        where('authMethod', '==', authMethod),
        where('success', '==', false),
        where('createdAt', '>', fifteenMinutesAgo)
      );

      const failedAttempts = await getDocs(failedAttemptsQuery);
      const failureCount = failedAttempts.size;

      if (failureCount >= 5) {
        // Log security event
        await this.logSecurityEvent({
          userEmail: email,
          eventType: 'multiple_failed_attempts',
          severity: 'high',
          eventData: {
            authMethod,
            failureCount,
            timeWindow: '15 minutes'
          }
        });

        // Temporarily disable account
        await this.temporarilyDisableAccount(email);
      }
    } catch (error) {
      console.error('Error checking failed attempts:', error);
    }
  }

  // Log security events
  static async logSecurityEvent(event: {
    userEmail?: string;
    eventType: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    eventData?: any;
  }): Promise<void> {
    try {
      await addDoc(collection(db, 'security_events'), {
        ...event,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  // Temporarily disable account
  static async temporarilyDisableAccount(email: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', email);
      await updateDoc(userRef, {
        isActive: false,
        disabledUntil: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        disabledReason: 'Multiple failed authentication attempts'
      });
    } catch (error) {
      console.error('Error disabling account:', error);
    }
  }

  // Check if account is active
  static async isAccountActive(email: string): Promise<boolean> {
    try {
      const userRef = doc(db, 'users', email);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) return false;
      
      const userData = userSnap.data();
      
      // Check if account is disabled
      if (!userData.isActive) {
        // Check if disable period has expired
        if (userData.disabledUntil && userData.disabledUntil.toDate() < new Date()) {
          // Re-enable account
          await updateDoc(userRef, {
            isActive: true,
            disabledUntil: null,
            disabledReason: null
          });
          return true;
        }
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking account status:', error);
      return false;
    }
  }
}
