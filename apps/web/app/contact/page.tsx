import type { Metadata } from 'next';
import { ContactForm } from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Have a question? Get in touch.',
};

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">

      <div className="mb-10">
        <h1 className="text-4xl font-bold text-text-primary mb-3">Contact</h1>
        <p className="text-text-secondary text-lg">
          Have a question? Get in touch.
        </p>
      </div>

      <ContactForm />

    </div>
  );
}
