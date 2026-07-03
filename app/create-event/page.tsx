import { auth } from '@/auth';
import Form from '@/components/Form';
import { redirect } from 'next/navigation';


export const metadata = {
  title: 'Create Event - DevEvent',
  description: 'Create and manage your events',
};

export default async function CreateEventPage() {
  const session = await auth();
  if (!session?.user) {
    // Si el usuario no está autenticado, redirigir al login
    redirect('/login');
  }
  
  return (
    <main id="create-event">
      <div className="header">
        <h1>Create New Event</h1>
        <p className="subheading">Fill in the details below to create your event</p>
      </div>

      <div className="form-container">
        <Form />
      </div>
    </main>
  );
}