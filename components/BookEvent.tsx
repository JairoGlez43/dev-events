"use client";
import { useState } from "react";
import { createBooking } from "@/lib/actions/booking.actions";

const BookEvent = ({ slug }: { slug: string }) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await createBooking({ eventSlug: slug, email });
    if (response.ok) {
      setSubmitted(true);
      setEmail("");
    } else {
      alert(response.message);
    }
  };

  return (
    <div id="book-event">
      {submitted ? (
        <p className="text-sm">Thank you for signing-up</p>
      ) : (
        <form onSubmit={onSubmit}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />

          <button type="submit" className="button-submit">
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

export default BookEvent;