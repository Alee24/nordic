import React from 'react';
import Section from '../components/ui/Section';
import { Scale, Clock, CreditCard, Ban } from 'lucide-react';
import { motion } from 'framer-motion';

const TermsOfService = () => {
    return (
        <div className="bg-theme-bg min-h-screen pt-32 pb-20">
            <Section size="small">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl mx-auto"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-norden-gold-500/10 rounded-xl text-norden-gold-500">
                            <Scale size={32} />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif text-theme-text">Terms of Service</h1>
                    </div>

                    <div className="prose prose-invert max-w-none space-y-8 text-theme-muted leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-serif text-theme-text mb-4">1. Booking & Reservation</h2>
                            <p>
                                By booking a stay at Norden Suites, you agree to provide accurate personal identification. All bookings are subject to availability and full payment is required to guarantee your reservation.
                            </p>
                        </section>

                        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-theme-surface p-6 rounded-xl border border-theme-border">
                                <div className="flex items-center gap-2 text-norden-gold-500 mb-3">
                                    <Clock size={18} />
                                    <span className="font-bold text-sm uppercase tracking-wider">Check-in/Out</span>
                                </div>
                                <p className="text-sm m-0">
                                    Check-in: 2:00 PM<br />
                                    Check-out: 11:00 AM<br />
                                    Late check-out is subject to availability and additional fees.
                                </p>
                            </div>
                            <div className="bg-theme-surface p-6 rounded-xl border border-theme-border">
                                <div className="flex items-center gap-2 text-norden-gold-500 mb-3">
                                    <Ban size={18} />
                                    <span className="font-bold text-sm uppercase tracking-wider">Cancellation</span>
                                </div>
                                <p className="text-sm m-0">
                                    Full refund for cancellations made 48 hours before check-in. Cancellations within 48 hours are non-refundable.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-serif text-theme-text mb-4">2. Guest Responsibilities</h2>
                            <p>
                                Norden Suites is a residential community. We expect guests to:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-4">
                                <li>Respect quiet hours from 10:00 PM to 8:00 AM.</li>
                                <li>Maintain the property in a clean and orderly fashion.</li>
                                <li>Adhere to the non-smoking policy inside all suites.</li>
                                <li>Be responsible for any damages caused to the suite or furniture during the stay.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-serif text-theme-text mb-4">3. Security & Safety</h2>
                            <p>
                                Our residences have 24/7 on-site security. However, Norden Suites is not liable for the loss or theft of personal items from the suite. We encourage using the provided in-room safes for valuables.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-serif text-theme-text mb-4">4. Liability</h2>
                            <p>
                                Norden Suites provides luxury accommodation services but shall not be held liable for any personal injury, loss, or property damage during your stay, except where required by Kenyan law.
                            </p>
                        </section>

                        <div className="pt-10 border-t border-theme-border text-xs">
                            Last Updated: March 2026
                        </div>
                    </div>
                </motion.div>
            </Section>
        </div>
    );
};

export default TermsOfService;
