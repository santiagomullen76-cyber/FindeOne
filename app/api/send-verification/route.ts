import { type NextRequest, NextResponse } from "next/server"

// This route sends verification emails using Resend
// You need to add RESEND_API_KEY to your environment variables
export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    // Check if Resend API key is configured
    const resendApiKey = process.env.RESEND_API_KEY

    if (!resendApiKey) {
      // Return the code for demo purposes when no email service is configured
      return NextResponse.json({
        success: true,
        demo: true,
        code,
        message: "Demo mode - no email service configured",
      })
    }

    // Send email using Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "FindOne <onboarding@resend.dev>",
        to: [email],
        subject: "Tu código de verificación de FindOne",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #4A90E2; margin: 0;">FindOne</h1>
              <p style="color: #666; margin-top: 5px;">Encuentra tu compañero ideal</p>
            </div>
            
            <div style="background: #f8f9fa; border-radius: 12px; padding: 30px; text-align: center;">
              <h2 style="color: #333; margin-top: 0;">Código de verificación</h2>
              <p style="color: #666; margin-bottom: 20px;">
                Usa el siguiente código para verificar tu cuenta:
              </p>
              <div style="background: #4A90E2; color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 15px 30px; border-radius: 8px; display: inline-block;">
                ${code}
              </div>
              <p style="color: #999; font-size: 14px; margin-top: 20px;">
                Este código expira en 10 minutos.
              </p>
            </div>
            
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
              Si no solicitaste este código, ignora este email.
            </p>
          </div>
        `,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("[FindOne] Error sending email:", error)
      return NextResponse.json({ success: false, message: "Error al enviar email" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Email enviado" })
  } catch (error) {
    console.error("[FindOne] Error:", error)
    return NextResponse.json({ success: false, message: "Error del servidor" }, { status: 500 })
  }
}
