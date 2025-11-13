"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Code2, Languages, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguageStore } from "@/hooks/use-language-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { language, setLanguage } = useLanguageStore();

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'he', label: 'עברית', flag: '🇮🇱' },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full sticky top-0 z-50 border-b bg-background"
    >
      <div className="h-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        {/* Left: Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Languages className="h-4 w-4" />
              <span className="hidden sm:inline">
                {languages.find(l => l.code === language)?.flag} {languages.find(l => l.code === language)?.label}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => setLanguage(lang.code as 'en' | 'he')}
                className={language === lang.code ? 'bg-accent' : ''}
              >
                <span className="mr-2">{lang.flag}</span>
                {lang.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Center: Navigation Links */}
        <div className="flex gap-2">
          <Link href="/pantam-lessons">
            <Button variant="ghost" size="sm" className="gap-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50">
              <Music className="h-4 w-4" />
              <span className="hidden sm:inline">Handpan Lessons</span>
            </Button>
          </Link>
        </div>

        {/* Right: Developer Portal */}
        <Link href="/dev-portal">
          <Button variant="ghost" size="sm" className="gap-2">
            <Code2 className="h-4 w-4" />
            <span className="hidden sm:inline">Developer Portal</span>
          </Button>
        </Link>
      </div>
    </motion.header>
  );
}
