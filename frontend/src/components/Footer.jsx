import React from "react";
import { Package, Globe, MessageCircle, Users, Camera } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1f232d] text-gray-300 mt-auto">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 text-white mb-4">
              <Package size={32} />
              <span className="text-2xl font-bold">ShopEase.com</span>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              "Let's Shop Beyond Boundaries"
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center cursor-pointer hover:bg-white hover:text-gray-900 transition-colors"><Globe size={18} /></div>
              <div className="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center cursor-pointer hover:bg-white hover:text-gray-900 transition-colors"><MessageCircle size={18} /></div>
              <div className="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center cursor-pointer hover:bg-white hover:text-gray-900 transition-colors"><Users size={18} /></div>
              <div className="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center cursor-pointer hover:bg-white hover:text-gray-900 transition-colors"><Camera size={18} /></div>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6">ShopEase</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition">About Us</a></li>
              <li><a href="#" className="hover:text-white transition">Career</a></li>
              <li><a href="#" className="hover:text-white transition">With Blog</a></li>
              <li><a href="#" className="hover:text-white transition">B2B Digital</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6">Buy</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition">Bill & Top Up</a></li>
              <li><a href="#" className="hover:text-white transition">ShopEase COD</a></li>
              <li><a href="#" className="hover:text-white transition">Mitra Blog</a></li>
              <li><a href="#" className="hover:text-white transition">Promo</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6">Guide and Help</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition">ShopEase Care</a></li>
              <li><a href="#" className="hover:text-white transition">Terms and Condition</a></li>
              <li><a href="#" className="hover:text-white transition">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition">Mitra</a></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-gray-700 mt-16 pt-8 text-center text-sm text-gray-500">
          &copy; 2001 - {new Date().getFullYear()}, ShopEase.com
        </div>
      </div>
    </footer>
  );
}
