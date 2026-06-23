import React from "react";
import { Package, Globe, MessageCircle, Users, Camera, Mail, MapPin, Phone, CreditCard, Banknote, ShieldCheck, Apple, Play } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto border-t border-gray-800">
  
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8">
          
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src="/ShopEaseLogo.png" alt="ShopEase" className="h-28 w-auto -my-8" />
            </div>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed max-w-sm">
              Your ultimate destination for fashion, electronics, and lifestyle. Discover millions of products at unbeatable prices, delivered right to your doorstep.
            </p>
            <div className="flex flex-col gap-3 text-sm text-gray-400 mb-8">
              <span className="flex items-center gap-2 hover:text-white transition cursor-pointer"><MapPin size={16} /> 123 Commerce Avenue, NY 10012</span>
              <span className="flex items-center gap-2 hover:text-white transition cursor-pointer"><Phone size={16} /> +1 (800) 123-4567</span>
              <span className="flex items-center gap-2 hover:text-white transition cursor-pointer"><Mail size={16} /> support@shopease.com</span>
            </div>
            
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center cursor-pointer hover:bg-white hover:text-gray-900 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center cursor-pointer hover:bg-white hover:text-gray-900 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center cursor-pointer hover:bg-white hover:text-gray-900 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center cursor-pointer hover:bg-white hover:text-gray-900 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-6">Company</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition">About Us</a></li>
              <li><a href="#" className="hover:text-white transition">Careers</a></li>
              <li><a href="#" className="hover:text-white transition">Press Releases</a></li>
              <li><a href="#" className="hover:text-white transition">ShopEase Blog</a></li>
              <li><a href="#" className="hover:text-white transition">Investor Relations</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-6">Make Money</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition">Sell on ShopEase</a></li>
              <li><a href="#" className="hover:text-white transition">Become an Affiliate</a></li>
              <li><a href="#" className="hover:text-white transition">Advertise Your Products</a></li>
              <li><a href="#" className="hover:text-white transition">Global Selling</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-6">Customer Care</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition">Track Your Order</a></li>
              <li><a href="#" className="hover:text-white transition">Returns & Replacements</a></li>
              <li><a href="#" className="hover:text-white transition">Shipping Rates & Policies</a></li>
              <li><a href="#" className="hover:text-white transition">Product Recalls</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-6">Download App</h3>
            <div className="flex flex-col gap-3">
              <button className="flex items-center gap-3 bg-gray-800 px-4 py-2.5 rounded-xl hover:bg-gray-700 transition w-full">
                
                <Play size={24} className="text-white" fill="currentColor" />
                <div className="text-left">
                  <p className="text-[10px] text-gray-400 leading-tight">GET IT ON</p>
                  <p className="text-sm font-bold text-white leading-tight">Google Play</p>
                </div>
              </button>
            </div>
            
            <h3 className="text-white font-bold text-lg mt-8 mb-4">Payment Methods</h3>
            <div className="flex gap-2 flex-wrap">
              <div className="w-10 h-6 bg-gray-800 rounded border border-gray-700 flex items-center justify-center"><CreditCard size={14} /></div>
              <div className="w-10 h-6 bg-gray-800 rounded border border-gray-700 flex items-center justify-center"><Banknote size={14} /></div>
            </div>
          </div>

        </div>

        <div className="border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} ShopEase.com. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition">Conditions of Use</a>
            <a href="#" className="hover:text-white transition">Privacy Notice</a>
            <a href="#" className="hover:text-white transition">Interest-Based Ads</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
