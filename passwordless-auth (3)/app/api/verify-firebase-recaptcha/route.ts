import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { token, email } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'reCAPTCHA token is required' },
        { status: 400 }
      )
    }

    // Verify reCAPTCHA token with Google
    const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: process.env.RECAPTCHA_SECRET_KEY || '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe', // Replace with your Firebase reCAPTCHA secret
        response: token,
      }),
    })

    const recaptchaData = await recaptchaResponse.json()

    if (!recaptchaData.success) {
      console.error('reCAPTCHA verification failed:', recaptchaData['error-codes'])
      return NextResponse.json(
        { error: 'reCAPTCHA verification failed', details: recaptchaData['error-codes'] },
        { status: 400 }
      )
    }

    // Additional security checks for reCAPTCHA v3 (if using score)
    if (recaptchaData.score && recaptchaData.score < 0.5) {
      return NextResponse.json(
        { error: 'Low reCAPTCHA score - suspicious activity detected' },
        { status: 400 }
      )
    }

    console.log(`reCAPTCHA verified successfully for email: ${email}`)

    return NextResponse.json({ 
      success: true, 
      message: 'reCAPTCHA verified successfully',
      score: recaptchaData.score 
    })

  } catch (error) {
    console.error('reCAPTCHA verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error during reCAPTCHA verification' },
      { status: 500 }
    )
  }
}
