import React from 'react';
import { ArrowRight, Instagram, Twitter, Facebook, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-theme-bg border-t border-theme-border pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-20">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="block mb-6">
                            <span className="text-3xl font-serif font-bold text-theme-text tracking-wider">NORDEN</span>
                            <span className="block text-xs text-norden-gold-500 uppercase tracking-[0.2em] mt-1">Luxury Apartments</span>
                        </Link>
                        <p className="text-theme-muted text-sm leading-relaxed mb-8 max-w-xs">
                            Experience the perfect blend of 5-star service and private apartment living.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-theme-muted hover:text-norden-gold-500 transition-colors"><Instagram size={20} /></a>
                            <a href="#" className="text-theme-muted hover:text-norden-gold-500 transition-colors"><Twitter size={20} /></a>
                            <a href="#" className="text-theme-muted hover:text-norden-gold-500 transition-colors"><Facebook size={20} /></a>
                        </div>
                    </div>

                    {/* Explore */}
                    <div>
                        <h4 className="text-theme-text font-serif text-lg mb-6">Explore</h4>
                        <ul className="space-y-3">
                            <li><Link to="/suites" className="text-theme-muted hover:text-norden-gold-500 transition-colors text-sm">Residences</Link></li>
                            <li><Link to="/laundry" className="text-theme-muted hover:text-norden-gold-500 transition-colors text-sm">Laundry Service</Link></li>
                            <li><Link to="/experiences" className="text-theme-muted hover:text-norden-gold-500 transition-colors text-sm">Curated Experiences</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-theme-text font-serif text-lg mb-6">Contact</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-sm text-theme-muted">
                                <MapPin size={18} className="text-norden-gold-500 shrink-0" />
                                <span>Nyali Beach Road, <br />Mombasa, Kenya</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-theme-muted">
                                <Phone size={18} className="text-norden-gold-500 shrink-0" />
                                <span>+254 700 000 000</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-theme-muted">
                                <Mail size={18} className="text-norden-gold-500 shrink-0" />
                                <span>concierge@nordensuits.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="text-theme-text font-serif text-lg mb-6">Newsletter</h4>
                        <p className="text-theme-muted text-sm mb-4">Join our inner circle for exclusive updates.</p>
                        <div className="flex items-center border-b border-white/20 pb-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-theme-muted focus:placeholder:text-theme-muted"
                            />
                            <button className="text-norden-gold-500 hover:text-white transition-colors">
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-theme-muted text-xs">© 2026 Norden Suits. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link to="#" className="text-theme-muted hover:text-theme-muted text-xs">Privacy Policy</Link>
                        <Link to="#" className="text-theme-muted hover:text-theme-muted text-xs">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
