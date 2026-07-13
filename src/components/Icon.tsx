import {
  BookOpen,
  HeartHandshake,
  Users,
  TrendingUp,
  Building2,
  HandCoins,
  GraduationCap,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  BookOpen,
  HeartHandshake,
  Users,
  TrendingUp,
  Building2,
  HandCoins,
  GraduationCap,
  Sparkles,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = MAP[name] ?? Sparkles;
  return <Cmp className={className} />;
}
