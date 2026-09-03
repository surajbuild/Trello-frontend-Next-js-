import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
) {
  const verifyUrl = `${APP_URL}/auth/verify?token=${token}`;

  await resend.emails.send({
    from: "Trello Chat <onboarding@resend.dev>",
    to: email,
    subject: "Verify your email address",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">Welcome, ${name}!</h1>
        <p style="font-size: 16px; color: #555; margin-bottom: 24px;">
          Thanks for signing up. Please verify your email address by clicking the button below.
        </p>
        <a
          href="${verifyUrl}"
          style="
            display: inline-block;
            background-color: #2563eb;
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 500;
          "
        >
          Verify Email
        </a>
        <p style="font-size: 14px; color: #999; margin-top: 32px;">
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}
