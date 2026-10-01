import {
  Apple,
  Bean,
  Beef,
  Bird,
  Candy,
  Coffee,
  Droplet,
  Droplets,
  Egg,
  Filter,
  Fish,
  FlaskConical,
  Gauge,
  Layers,
  Leaf,
  Milk,
  MoonStar,
  Nut,
  PackageX,
  Repeat,
  Scale,
  ShieldCheck,
  Sprout,
  Timer,
  Wheat,
  type LucideIcon,
} from "lucide-react";

const registry: Record<string, LucideIcon> = {
  Apple, Bean, Beef, Bird, Candy, Coffee, Droplet, Droplets, Egg, Filter, Fish, FlaskConical,
  Gauge, Layers, Leaf, Milk, MoonStar, Nut, PackageX, Repeat, Scale, ShieldCheck, Sprout, Timer, Wheat,
};

/** Resolves a data-layer icon name to a Lucide component (falls back to Leaf). */
export function iconByName(name: string): LucideIcon {
  return registry[name] ?? Leaf;
}
