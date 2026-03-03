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
        <footer className="bg-theme-bg border-t border-theme-border pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-20">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="block mb-6">
                            <img
                                src="/images/mainlogo.png"
                                alt="Norden Suites"
                                className="h-14 w-auto object-contain"
                                onError={e => {
                                    e.target.style.display = 'none';
                                    e.target.insertAdjacentHTML('afterend', '<span class="text-3xl font-serif font-bold text-theme-text tracking-wider">NORDEN<span class="block text-xs text-norden-gold-500 uppercase tracking-[0.2em] mt-1">Suits &amp; Apartments</span></span>');
                                }}
                            />
                        </Link>
                        <p className="text-theme-muted text-sm leading-relaxed mb-8 max-w-xs">
                            Redefining coastal luxury with the perfect blend of 5-star service and private residence living in Mombasa.
                        </p>
                        <div className="flex gap-4">
                            <a href="https://www.instagram.com/nordensuites/" target="_blank" rel="noopener noreferrer" className="text-theme-muted hover:text-norden-gold-500 transition-colors" title="Instagram">
                                <Instagram size={20} />
                            </a>
                            <a href="https://www.tiktok.com/@nordensuites?lang=en" target="_blank" rel="noopener noreferrer" className="text-theme-muted hover:text-norden-gold-500 transition-colors" title="TikTok">
                                <TikTokIcon size={20} />
                            </a>
                            <a href="https://www.youtube.com/@nordensuites" target="_blank" rel="noopener noreferrer" className="text-theme-muted hover:text-norden-gold-500 transition-colors" title="YouTube">
                                <Youtube size={20} />
                            </a>
                            <a href="https://www.facebook.com/profile.php?id=61588263853770&sk=about" target="_blank" rel="noopener noreferrer" className="text-theme-muted hover:text-norden-gold-500 transition-colors" title="Facebook">
                                <Facebook size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Explore */}
                    <div>
                        <h4 className="text-theme-text font-serif text-lg mb-6">Explore</h4>
                        <ul className="space-y-3">
                            <li><Link to="/suites" className="text-theme-muted hover:text-norden-gold-500 transition-colors text-sm">Residences</Link></li>
                            <li><Link to="/experiences" className="text-theme-muted hover:text-norden-gold-500 transition-colors text-sm">Coastal Experience</Link></li>
                            <li><Link to="/contact" className="text-theme-muted hover:text-norden-gold-500 transition-colors text-sm">Concierge</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-theme-text font-serif text-lg mb-6">Contact Us</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-sm text-theme-muted">
                                <MapPin size={18} className="text-norden-gold-500 shrink-0" />
                                <span>Nyali Beach Road, <br />Mombasa, Kenya</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-theme-muted">
                                <Phone size={18} className="text-norden-gold-500 shrink-0" />
                                <span>+254 704 055 869</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-theme-muted">
                                <Mail size={18} className="text-norden-gold-500 shrink-0" />
                                <span>welcome@nordensuites.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="text-theme-text font-serif text-lg mb-6">Stay Updated</h4>
                        <p className="text-theme-muted text-sm mb-4">Subscribe for exclusive offers and private events.</p>
                        <div className="flex items-center border-b border-theme-border pb-2 group focus-within:border-norden-gold-500 transition-colors">
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="bg-transparent border-none outline-none text-theme-text text-sm w-full placeholder:text-theme-muted"
                            />
                            <button className="text-norden-gold-500 hover:text-norden-gold-400 transition-colors">
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-theme-border pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <p className="text-theme-muted text-[10px] uppercase tracking-widest opacity-60">© 2026 Norden Suits. All rights reserved.</p>
                        <p className="text-theme-muted text-xs mt-2">
                            Developed by | <a href="https://kkdes.co.ke/" target="_blank" rel="noopener noreferrer" className="text-norden-gold-500 hover:text-norden-gold-400 font-bold transition-colors">KKDES</a>
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
                        <div className="flex gap-6">
                            <Link to="#" className="text-theme-muted hover:text-norden-gold-500 transition-colors text-[11px] uppercase tracking-wider">Privacy</Link>
                            <Link to="#" className="text-theme-muted hover:text-norden-gold-500 transition-colors text-[11px] uppercase tracking-wider">Terms</Link>
                        </div>

                        {/* Admin Link at Bottom Right */}
                        <button
                            onClick={() => setView('staff')}
                            className="flex items-center gap-2 group text-theme-muted hover:text-norden-gold-500 transition-all duration-300 py-1 px-3 border border-transparent hover:border-norden-gold-500/20 rounded-md text-[10px] uppercase tracking-widest"
                        >
                            <Shield size={12} className="group-hover:rotate-12 transition-transform" />
                            <span>{isAdmin ? 'Dashboard' : 'Staff Access'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

