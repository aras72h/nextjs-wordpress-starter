import { z } from 'zod';
import { sendEmail } from '@/lib/email';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be under 1000 characters'),
  website: z.string().max(0), // honeypot — must be empty
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return Response.json(
        { error: 'Invalid data', issues: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Honeypot triggered — silently return success
    if (result.data.website) {
      return Response.json({ success: true });
    }

    const { name, email, subject, message } = result.data;

    await sendEmail({ name, email, subject, message });

    return Response.json({ success: true });
  } catch (err) {
    console.error('Contact form error:', err);
    return Response.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}
