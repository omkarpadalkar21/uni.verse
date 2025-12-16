import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Github, Linkedin, Disc as Discord } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer id="about" className="bg-background border-t border-white/5 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src="/logo.svg" alt="UniVerse Logo" className="w-8 h-8" />
              <span className="text-2xl font-bold font-sans">
                Uni<span className="text-primary">Verse</span>
              </span>
            </Link>
            <p className="text-muted-foreground max-w-sm mb-6">
              The all-in-one platform for university events. Managing seat bookings, payments, and analytics so you can focus on the experience.
            </p>
            <div className="flex gap-4">
              {[Twitter, Github, Linkedin, Discord].map((Icon, i) => (
                <a 
                    key={i} 
                    href="#" 
                    className="p-2 rounded-full bg-white/5 hover:bg-primary/20 hover:text-primary transition-colors"
                >
                    <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {[
            {
              title: "Product",
              links: ["Features", "Pricing", "How It Works", "Roadmap"]
            },
            {
              title: "Resources",
              links: ["Documentation", "API Docs", "Blog", "Community"]
            },
            {
              title: "Company",
              links: ["About Us", "Careers", "Legal", "Contact"]
            }
          ].map((column, i) => (
            <div key={i}>
              <h4 className="font-bold mb-6">{column.title}</h4>
              <ul className="space-y-4">
                {column.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div>
                 &copy; 2025 UniVerse. Built with ☕ and Stardust.
            </div>
            <div className="flex gap-6">
                <a href="#" className="hover:text-foreground">Privacy Policy</a>
                <a href="#" className="hover:text-foreground">Terms of Service</a>
            </div>
        </div>
      </div>
    </footer>
  );
};
