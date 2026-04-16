import {
  BookOpen,
  Crown,
  Briefcase,
  MessageSquare,
  Users,
  Baby,
  Brain,
  Sparkles,
  GraduationCap,
  Shield,
  Landmark,
  Castle,
  Mountain,
  Feather,
  Cpu,
  Globe,
  Moon,
  Laptop,
  Eye,
  Dice5,
  Map,
  BookMarked,
  Mic,
  Headphones,
  Layers,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  // Top-level book categories
  "Power & Strategy": Crown,
  "Career & Presence": Briefcase,
  "Influence & Communication": MessageSquare,
  "Leadership & Organisations": Users,
  "Parenting": Baby,
  "Psychology & Behaviour": Brain,
  "Wisdom & Life Philosophy": Sparkles,
  "Thinking & Learning": GraduationCap,
  "Emotional Resilience": Shield,
  "Political Economy": Landmark,
  "British History": Castle,
  "Stoicism & Character": Mountain,
  "Robert Greene": Feather,
  "AI & Society": Cpu,
  "Civilisation & Collapse": Globe,
  "Islamic History": Moon,
  "Technology & Society": Laptop,

  // Lecture subcategories
  "Civilization": Globe,
  "Secret History": Eye,
  "Game Theory": Dice5,
  "Geo-Strategy": Map,
  "Great Books": BookMarked,

  // Podcast subcategories
  "Ryan Peterman": Mic,

  // Top-level content types (used elsewhere)
  "Lectures": GraduationCap,
  "Podcasts": Headphones,
  "Concepts": Layers,
};

export function getCategoryIcon(name: string): LucideIcon {
  return ICONS[name] ?? BookOpen;
}
