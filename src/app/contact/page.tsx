"use client";

import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import PageHero from "@/components/PageHero";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please complete all fields.");
      return;
    }
    toast.success("Message sent — the civic desk will reply shortly.");
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <div className="bg-white">
      <PageHero
        label="Company"
        title="Contact NaijaPass"
        description="Partnerships, support, and media — reach the civic desk from here."
      />
      <form
        onSubmit={onSubmit}
        className="mx-auto max-w-xl space-y-4 px-5 py-12 md:px-8"
      >
        <label className="block text-sm">
          <span className="mb-1.5 block font-semibold text-navy">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-2xl bg-[#f4f6f8] px-3 py-2.5 outline-none ring-1 ring-navy/8 focus:ring-2 focus:ring-forest/25"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-semibold text-navy">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl bg-[#f4f6f8] px-3 py-2.5 outline-none ring-1 ring-navy/8 focus:ring-2 focus:ring-forest/25"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-semibold text-navy">Message</span>
          <textarea
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-2xl bg-[#f4f6f8] px-3 py-2.5 outline-none ring-1 ring-navy/8 focus:ring-2 focus:ring-forest/25"
          />
        </label>
        <button type="submit" className="btn btn-primary">
          Send message
        </button>
      </form>
    </div>
  );
}
