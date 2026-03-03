import React from 'react';
import Section from '../components/ui/Section';
import { Shield, Lock, Scale, ClipboardCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
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
                            <Shield size={32} />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif text-theme-text">Privacy Policy</h1>
                    </div>

                    <div className="prose prose-invert max-w-none space-y-8 text-theme-muted leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-serif text-theme-text mb-4">1. Information We Collect</h2>
                            <p>
                                At Norden Suites, we collect minimal personal information necessary to facilitate your booking and enhance your stay. This includes:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-4">
                                <li>Identity Data: Name, passport/ID number (at check-in).</li>
                                <li>Contact Data: Email address, phone number.</li>
                                <li>Transaction Data: Payment details (processed securely via our partners).</li>
                                <li>Usage Data: How you interact with our website to improve performance.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-serif text-theme-text mb-4">2. How We Use Your Data</h2>
                            <p>We use your information strictly for:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-4">
                                <li>Processing and confirming your reservations.</li>
                                <li>Communicating essential check-in and check-out information.</li>
                                <li>Providing bespoke concierge services during your stay.</li>
                                <li>Sending occasional VIP updates (only if you opt-in to our newsletter).</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-serif text-theme-text mb-4">3. Data Security</h2>
                            <div className="flex items-start gap-4 bg-theme-surface p-6 rounded-xl border border-theme-border">
                                <Lock className="text-norden-gold-500 shrink-0 mt-1" size={20} />
                                <p className="text-sm m-0">
                                    Your data is stored on secure, encrypted servers. We do not sell or share your personal information with third parties for marketing purposes. Access is restricted to authorized personnel only.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-serif text-theme-text mb-4">4. Your Rights</h2>
                            <p>
                                You have the right to request access to, correction of, or deletion of your personal data at any time. For such requests, please contact us at <a href="mailto:welcome@nordensuites.com" className="text-norden-gold-500 underline">welcome@nordensuites.com</a>.
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

export default PrivacyPolicy;
