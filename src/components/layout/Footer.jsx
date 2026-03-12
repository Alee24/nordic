import React from 'react';
import { ArrowRight, Instagram, Youtube, Facebook, Mail, Phone, MapPin, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import useManagementStore from '../../store/useManagementStore';

// TikTok icon (not in lucide-react)
const TikTokIcon = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.89 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.35 6.35 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.73a8.13 8.13 0 004.76 1.52V6.81a4.85 4.85 0 01-.99-.12z" />
    </svg>
);


const Footer = () => {
    const { setView, isAdmin } = useManagementStore();

    return (
        <footer className="bg-theme-surface text-theme-text pt-24 pb-12 relative overflow-hidden border-t border-theme-border">
            {/* Background Texture with door.jpg */}
            <div
                className="absolute inset-0 z-0 opacity-30 grayscale pointer-events-none"
                style={{
                    backgroundImage: 'url("/images/door.jpg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(10px) brightness(1.2) opacity(0.1)'
                }}
            />

            {/* Subtle Gradient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-theme-accent/50 to-transparent z-10" />
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-theme-accent/5 blur-[120px] rounded-full z-10" />

            <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 mb-20">

                    {/* Brand Section - Prominent Logo at the far left */}
                    <div className="col-span-1 md:col-span-4 flex flex-col items-start">
                        <Link to="/" className="block mb-10 group w-full -ml-2">
                            <div className="relative w-full">
                                <div className="absolute -inset-10 bg-theme-accent/5 blur-3xl rounded-full scale-0 group-hover:scale-100 transition-transform duration-1000" />
                                <img
                                    src="/images/mlogo.png"
                                    alt="Norden Suites"
                                    className="w-[280px] md:w-full h-auto object-contain relative z-10 transition-transform duration-700 group-hover:scale-[1.02] origin-left"
                                    onError={e => {
                                        e.target.style.display = 'none';
                                        e.target.insertAdjacentHTML('afterend', '<span class="text-5xl font-serif font-bold text-white tracking-wider">NORDEN<span class="block text-sm text-norden-gold-500 uppercase tracking-[0.4em] mt-2 font-bold">Suites &amp; Apartments</span></span>');
                                    }}
                                />
                            </div>
                        </Link>
                    </div>

                    {/* Navigation - Right Side (8 cols) */}
                    <div className="col-span-1 md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-8 pt-4">
                        {/* Explore */}
                        <div>
                            <h4 className="text-white font-serif text-xl mb-8 flex items-center gap-3">
                                <span className="w-8 h-[1px] bg-theme-accent" />
                                Explore
                            </h4>
                            <ul className="space-y-4">
                                {[
                                    { name: 'Residences', path: '/suites' },
                                    { name: 'Coastal Experience', path: '/experiences' },
                                    { name: 'Concierge', path: '/contact' },
                                    { name: 'Wellness', path: '/wellness' }
                                ].map((link) => (
                                    <li key={link.name}>
                                        <Link to={link.path} className="text-theme-muted hover:text-theme-accent transition-colors text-sm font-medium inline-block group">
                                            {link.name}
                                            <div className="h-[1px] w-0 bg-theme-accent transition-all duration-300 group-hover:w-full" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h4 className="text-white font-serif text-xl mb-8 flex items-center gap-3">
                                <span className="w-8 h-[1px] bg-theme-accent" />
                                Contact Us
                            </h4>
                            <ul className="space-y-6">
                                <li className="flex items-start gap-4 group">
                                    <div className="w-10 h-10 rounded-lg bg-theme-bg flex items-center justify-center text-theme-accent group-hover:bg-theme-accent group-hover:text-white transition-all duration-300">
                                        <MapPin size={18} />
                                    </div>
                                    <span className="text-sm text-theme-muted leading-snug pt-1 group-hover:text-theme-text transition-colors">Nyali Beach Road,<br />Mombasa, Kenya</span>
                                </li>
                                <li className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-lg bg-theme-bg flex items-center justify-center text-theme-accent group-hover:bg-theme-accent group-hover:text-white transition-all duration-300">
                                        <Phone size={18} />
                                    </div>
                                    <span className="text-sm text-theme-muted group-hover:text-theme-text transition-colors">+254 704 055 869</span>
                                </li>
                                <li className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-lg bg-theme-bg flex items-center justify-center text-theme-accent group-hover:bg-theme-accent group-hover:text-white transition-all duration-300">
                                        <Mail size={18} />
                                    </div>
                                    <span className="text-sm text-theme-muted group-hover:text-theme-text transition-colors">welcome@nordensuites.com</span>
                                </li>
                            </ul>
                        </div>

                        {/* Newsletter */}
                        <div>
                            <h4 className="text-white font-serif text-xl mb-8 flex items-center gap-3">
                                <span className="w-8 h-[1px] bg-theme-accent" />
                                VIP Newsletter
                            </h4>
                            <p className="text-gray-400 text-sm mb-6 font-light italic">Enter your email to receive curated offers and community updates.</p>
                            <div className="relative group">
                                <input
                                    type="email"
                                    placeholder="Your Email Address"
                                    className="w-full bg-theme-bg border border-theme-border rounded-lg px-4 py-3 text-theme-text text-sm outline-none focus:border-theme-accent transition-all placeholder:text-theme-muted/50"
                                />
                                <button className="absolute right-2 top-1.5 w-9 h-9 bg-theme-accent text-white rounded flex items-center justify-center hover:bg-theme-accent-hover transition-all duration-300">
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Media Row - Centered below main content */}
                <div className="flex flex-col items-center justify-center mb-16 pt-8 border-t border-white/5">
                    <div className="flex gap-10">
                        {[
                            { icon: <Instagram size={28} />, url: "https://www.instagram.com/nordensuites/" },
                            { icon: <TikTokIcon size={28} />, url: "https://www.tiktok.com/@nordensuites?lang=en" },
                            { icon: <Youtube size={28} />, url: "https://www.youtube.com/@nordensuites" },
                            { icon: <Facebook size={28} />, url: "https://www.facebook.com/profile.php?id=61588263853770&sk=about" }
                        ].map((social, i) => (
                            <a
                                key={i}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-theme-muted hover:text-theme-accent transition-all duration-500 transform hover:scale-125 hover:drop-shadow-[0_0_10px_rgba(2,136,209,0.3)]"
                            >
                                {social.icon}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col items-center md:items-start gap-1">
                        <p className="text-theme-muted text-[10px] uppercase tracking-[0.3em] font-bold">© 2026 NORDEN SUITES. ALL RIGHTS RESERVED.</p>
                        <div className="text-theme-muted text-[10px] uppercase tracking-widest font-bold flex items-center gap-1">
                            <span>Developed by |</span>
                            <a href="https://kkdes.co.ke/" target="_blank" rel="noopener noreferrer" className="text-theme-accent hover:text-norden-gold-500 transition-colors font-black">
                                KKDES
                            </a>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-8">
                        <div className="flex gap-6">
                            <Link to="/privacy" className="px-5 py-2 rounded-full border border-theme-border text-theme-muted hover:text-theme-accent hover:border-theme-accent transition-all duration-300 text-xs uppercase tracking-widest font-bold shadow-sm transform hover:-translate-y-1">
                                Privacy Policy
                            </Link>
                            <Link to="/terms" className="px-5 py-2 rounded-full border border-theme-border text-theme-muted hover:text-theme-accent hover:border-theme-accent transition-all duration-300 text-xs uppercase tracking-widest font-bold shadow-sm transform hover:-translate-y-1">
                                Terms of Service
                            </Link>
                        </div>

                        <div className="w-[1px] h-6 bg-white/10 hidden lg:block" />

                        <button
                            onClick={() => setView('staff')}
                            className="flex items-center gap-2 px-6 py-2 bg-theme-bg hover:bg-theme-surface border border-theme-border rounded-full text-theme-muted hover:text-theme-accent transition-all duration-500 text-[10px] uppercase tracking-[0.2em] font-bold shadow-sm"
                        >
                            <Shield size={12} />
                            {isAdmin ? 'Management Console' : 'Staff Login'}
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

