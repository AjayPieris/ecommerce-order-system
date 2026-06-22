import React from "react";
import { Package, Globe, MessageCircle, Users, Camera, Mail, MapPin, Phone, CreditCard, Banknote, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto border-t border-gray-800">
      
      {/* Newsletter / Benefits Strip */}
      <div className="bg-gray-800/50 border-b border-gray-800">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex-1 w-full flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white"><ShieldCheck size={24} /></div>
              <div>
                <h4 className="text-white font-bold">100% Secure</h4>
                <p className="text-sm text-gray-400">Safe payments</p>
              </div>
            </div>
            <div className="hidden sm:block w-px h-8 bg-gray-700"></div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white"><Globe size={24} /></div>
              <div>
                <h4 className="text-white font-bold">Global Shipping</h4>
                <p className="text-sm text-gray-400">To 100+ countries</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-md">
            <h4 className="text-white font-bold mb-2">Subscribe to our Newsletter</h4>
            <div className="flex bg-gray-800 rounded-full p-1 border border-gray-700 focus-within:border-gray-500 transition">
              <input type="email" placeholder="Enter your email" className="w-full bg-transparent border-none px-4 text-sm focus:outline-none text-white" />
              <button className="bg-white text-gray-900 px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-100 transition">Subscribe</button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8">
          
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 text-white mb-6">
              <Package size={32} />
              <span className="text-2xl font-black tracking-tight">ShopEase</span>
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
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center cursor-pointer hover:bg-white hover:text-gray-900 transition-colors"><Globe size={18} /></div>
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center cursor-pointer hover:bg-white hover:text-gray-900 transition-colors"><MessageCircle size={18} /></div>
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center cursor-pointer hover:bg-white hover:text-gray-900 transition-colors"><Users size={18} /></div>
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center cursor-pointer hover:bg-white hover:text-gray-900 transition-colors"><Camera size={18} /></div>
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
                <Globe size={24} className="text-white" />
                <div className="text-left">
                  <p className="text-[10px] text-gray-400 leading-tight">Download on the</p>
                  <p className="text-sm font-bold text-white leading-tight">App Store</p>
                </div>
              </button>
              <button className="flex items-center gap-3 bg-gray-800 px-4 py-2.5 rounded-xl hover:bg-gray-700 transition w-full">
                <Package size={24} className="text-white" />
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
