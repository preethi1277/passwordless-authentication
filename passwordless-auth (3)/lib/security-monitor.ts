interface AuthAttempt {
  email: string
  userId?: string
  authMethod: 'biometric' | 'recaptcha'
  success: boolean
  failureReason?: string
  ipAddress?: string
  userAgent?: string
  deviceInfo?: any
}

interface SecurityEvent {
  userId?: string
  eventType: string
  eventData?: any
  severity: 'low' | 'medium' | 'high' | 'critical'
  ipAddress?: string
}

export class SecurityMonitor {
  // Log authentication attempts
  static async logAuthAttempt(attempt: AuthAttempt) {
    try {
      // In production, save to database
      console.log('Auth attempt logged:', attempt)
      
      // Check for suspicious patterns
      if (!attempt.success) {
        await this.checkFailedAttempts(attempt.email, attempt.authMethod)
      }
    } catch (error) {
      console.error('Failed to log auth attempt:', error)
    }
  }

  // Check for failed attempt patterns
  static async checkFailedAttempts(email: string, authMethod: string) {
    try {
      // In production, query database for recent failed attempts
      const recentFailures = await this.getRecentFailedAttempts(email, authMethod)
      
      if (recentFailures >= 5) {
        await this.logSecurityEvent({
          eventType: 'multiple_failed_attempts',
          eventData: { email, authMethod, count: recentFailures },
          severity: 'high'
        })
        
        // Implement rate limiting or account locking
        await this.implementRateLimit(email)
      }
    } catch (error) {
      console.error('Failed to check failed attempts:', error)
    }
  }

  // Get recent failed attempts (mock implementation)
  static async getRecentFailedAttempts(email: string, authMethod: string): Promise<number> {
    // In production, query database:
    // SELECT COUNT(*) FROM auth_attempts 
    // WHERE email = $1 AND auth_method = $2 AND success = false 
    // AND created_at > NOW() - INTERVAL '15 minutes'
    
    return Math.floor(Math.random() * 3) // Mock data
  }

  // Log security events
  static async logSecurityEvent(event: SecurityEvent) {
    try {
      console.log('Security event logged:', event)
      
      // In production, save to database and potentially send alerts
      if (event.severity === 'high' || event.severity === 'critical') {
        await this.sendSecurityAlert(event)
      }
    } catch (error) {
      console.error('Failed to log security event:', error)
    }
  }

  // Implement rate limiting
  static async implementRateLimit(email: string) {
    console.log(`Rate limiting implemented for: ${email}`)
    // In production, implement temporary account locking or CAPTCHA requirements
  }

  // Send security alerts
  static async sendSecurityAlert(event: SecurityEvent) {
    console.log('Security alert sent:', event)
    // In production, send email/SMS alerts to administrators
  }

  // Track biometric failures specifically
  static async trackBiometricFailure(email: string, failureReason: string, deviceInfo: any) {
    await this.logAuthAttempt({
      email,
      authMethod: 'biometric',
      success: false,
      failureReason,
      deviceInfo
    })

    await this.logSecurityEvent({
      eventType: 'biometric_failure',
      eventData: { email, failureReason, deviceInfo },
      severity: 'medium'
    })
  }
}
