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
        <footer className="bg-[#0A0B0D] text-white pt-24 pb-12 relative overflow-hidden">
            {/* Background Texture with door.jpg */}
            <div
                className="absolute inset-0 z-0 opacity-30 grayscale pointer-events-none"
                style={{
                    backgroundImage: 'url("/images/door.jpg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(10px) brightness(0.3)'
                }}
            />

            {/* Subtle Gradient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-norden-gold-500/50 to-transparent z-10" />
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-norden-gold-500/5 blur-[120px] rounded-full z-10" />

            <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 mb-20">

                    {/* Brand Section - Prominent Logo at the far left */}
                    <div className="col-span-1 md:col-span-4 flex flex-col items-start">
                        <Link to="/" className="block mb-10 group w-full -ml-2">
                            <div className="relative w-full">
                                <div className="absolute -inset-10 bg-norden-gold-500/5 blur-3xl rounded-full scale-0 group-hover:scale-100 transition-transform duration-1000" />
                                <img
                                    src="/images/mlogo.png"
                                    alt="Norden Suites"
                                    className="w-[280px] md:w-full h-auto object-contain brightness-110 relative z-10 transition-transform duration-700 group-hover:scale-[1.02] origin-left"
                                    onError={e => {
                                        e.target.style.display = 'none';
                                        e.target.insertAdjacentHTML('afterend', '<span class="text-5xl font-serif font-bold text-white tracking-wider">NORDEN<span class="block text-sm text-norden-gold-500 uppercase tracking-[0.4em] mt-2 font-bold">Suites &amp; Apartments</span></span>');
                                    }}
                                />
                            </div>
                        </Link>
                        <p className="text-gray-400 text-lg leading-relaxed mb-10 font-light max-w-sm">
                            Redefining coastal luxury with the perfect blend of 5-star service and private residence living. Experience the soul of the Swahili coast in Nyali's most exclusive boutique residence.
                        </p>
                        <div className="flex gap-6">
                            {[
                                { icon: <Instagram size={24} />, url: "https://www.instagram.com/nordensuites/" },
                                { icon: <TikTokIcon size={24} />, url: "https://www.tiktok.com/@nordensuites?lang=en" },
                                { icon: <Youtube size={24} />, url: "https://www.youtube.com/@nordensuites" },
                                { icon: <Facebook size={24} />, url: "https://www.facebook.com/profile.php?id=61588263853770&sk=about" }
                            ].map((social, i) => (
                                <a
                                    key={i}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-500 hover:text-norden-gold-500 transition-all duration-300 transform hover:scale-110"
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation - Right Side (8 cols) */}
                    <div className="col-span-1 md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-8 pt-4">
                        {/* Explore */}
                        <div>
                            <h4 className="text-white font-serif text-xl mb-8 flex items-center gap-3">
                                <span className="w-8 h-[1px] bg-norden-gold-500" />
                                Explore
                            </h4>
                            <ul className="space-y-4">
                                {[
                                    { name: 'Residences', path: '/suites' },
                                    { name: 'Apartments', path: '/rooms' },
                                    { name: 'Coastal Experience', path: '/experiences' },
                                    { name: 'Concierge', path: '/contact' },
                                    { name: 'Wellness', path: '/wellness' }
                                ].map((link) => (
                                    <li key={link.name}>
                                        <Link to={link.path} className="text-gray-400 hover:text-norden-gold-500 transition-colors text-sm font-medium inline-block group">
                                            {link.name}
                                            <div className="h-[1px] w-0 bg-norden-gold-500 transition-all duration-300 group-hover:w-full" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h4 className="text-white font-serif text-xl mb-8 flex items-center gap-3">
                                <span className="w-8 h-[1px] bg-norden-gold-500" />
                                Contact Us
                            </h4>
                            <ul className="space-y-6">
                                <li className="flex items-start gap-4 group">
                                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-norden-gold-500 group-hover:bg-norden-gold-500 group-hover:text-white transition-all duration-300">
                                        <MapPin size={18} />
                                    </div>
                                    <span className="text-sm text-gray-400 leading-snug pt-1 group-hover:text-white transition-colors">Nyali Beach Road,<br />Mombasa, Kenya</span>
                                </li>
                                <li className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-norden-gold-500 group-hover:bg-norden-gold-500 group-hover:text-white transition-all duration-300">
                                        <Phone size={18} />
                                    </div>
                                    <span className="text-sm text-gray-400 group-hover:text-white transition-colors">+254 704 055 869</span>
                                </li>
                                <li className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-norden-gold-500 group-hover:bg-norden-gold-500 group-hover:text-white transition-all duration-300">
                                        <Mail size={18} />
                                    </div>
                                    <span className="text-sm text-gray-400 group-hover:text-white transition-colors">welcome@nordensuites.com</span>
                                </li>
                            </ul>
                        </div>

                        {/* Newsletter */}
                        <div>
                            <h4 className="text-white font-serif text-xl mb-8 flex items-center gap-3">
                                <span className="w-8 h-[1px] bg-norden-gold-500" />
                                VIP Newsletter
                            </h4>
                            <p className="text-gray-400 text-sm mb-6 font-light italic">Enter your email to receive curated offers and community updates.</p>
                            <div className="relative group">
                                <input
                                    type="email"
                                    placeholder="Your Email Address"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-norden-gold-500 transition-all placeholder:text-gray-600"
                                />
                                <button className="absolute right-2 top-1.5 w-9 h-9 bg-norden-gold-500 text-norden-dark-900 rounded flex items-center justify-center hover:bg-white transition-all duration-300">
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col items-center md:items-start gap-1 opacity-60">
                        <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] font-bold">© 2026 NORDEN SUITES. ALL RIGHTS RESERVED.</p>
                        <div className="text-gray-500 text-[10px] uppercase tracking-widest font-medium flex items-center gap-1">
                            <span>Developed by |</span>
                            <a href="https://kkdes.co.ke/" target="_blank" rel="noopener noreferrer" className="hover:text-norden-gold-500 transition-colors">
                                KKDES
                            </a>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-8">
                        <div className="flex gap-8">
                            <Link to="/privacy" className="text-gray-500 hover:text-white transition-colors text-xs uppercase tracking-widest font-semibold">Privacy Policy</Link>
                            <Link to="/terms" className="text-gray-500 hover:text-white transition-colors text-xs uppercase tracking-widest font-semibold">Terms of Service</Link>
                        </div>

                        <div className="w-[1px] h-6 bg-white/10 hidden sm:block" />

                        <button
                            onClick={() => setView('staff')}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-gray-400 hover:text-norden-gold-500 transition-all duration-500 text-[10px] uppercase tracking-[0.2em] font-bold"
                        >
                            <Shield size={12} />
                            {isAdmin ? 'Management Console' : 'Partner Access'}
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

