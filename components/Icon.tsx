import React from 'react';
import type { LucideProps } from 'lucide-react';
import {
  AlertCircle,
  AlertTriangle,
  Aperture,
  ArrowLeft,
  BadgeCheck,
  Bell,
  BellOff,
  BookOpen,
  Bookmark,
  Bot,
  BrushCleaning,
  CameraOff,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Compass,
  Database,
  Download,
  FlaskConical,
  GraduationCap,
  Heart,
  History,
  Home,
  Image,
  Images,
  Lightbulb,
  Loader2,
  MessageCircle,
  MessagesSquare,
  MoreVertical,
  Palette,
  RefreshCw,
  Scan,
  Send,
  Settings,
  Share2,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  SwitchCamera,
  TimerReset,
  Trash,
  Trash2,
  User,
  UserCheck,
  X
} from 'lucide-react';

const ICONS: Record<string, React.ComponentType<LucideProps>> = {
  home: Home,
  smart_toy: Bot,
  star: Star,
  face: User,
  menu_book: BookOpen,
  verified: BadgeCheck,
  palette: Palette,
  notifications: Bell,
  verified_user: UserCheck,
  sd_storage: Database,
  arrow_back_ios_new: ChevronLeft,
  arrow_back: ArrowLeft,
  chat_bubble: MessageCircle,
  view_in_ar: Scan,
  bookmarks: Bookmark,
  more_vert: MoreVertical,
  science: FlaskConical,
  no_photography: CameraOff,
  flip_camera_ios: SwitchCamera,
  photo_library: Images,
  history: History,
  refresh: RefreshCw,
  auto_awesome: Sparkles,
  lightbulb: Lightbulb,
  school: GraduationCap,
  shutter_speed: Aperture,
  delete_sweep: BrushCleaning,
  delete: Trash,
  image: Image,
  close: X,
  favorite: Heart,
  forum: MessagesSquare,
  settings: Settings,
  send: Send,
  share: Share2,
  bookmark: Bookmark,
  check_circle: CheckCircle,
  error_outline: AlertCircle,
  explore: Compass,
  delete_forever: Trash2,
  gpp_good: ShieldCheck,
  auto_delete: TimerReset,
  file_download: Download,
  progress_activity: Loader2,
  chevron_right: ChevronRight,
  notifications_off: BellOff,
  error: AlertTriangle,
  shield: Shield
};

const SIZE_CLASS_PATTERN = /\btext-(?:\[|xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)\b/;
const LARGE_SIZE_PATTERN = /\btext-(?:\[|3xl|4xl|5xl|6xl|7xl|8xl|9xl)\b/;

export const Icon = ({
  name,
  size,
  className = '',
  strokeWidth
}: {
  name: string;
  size?: number | string;
  className?: string;
  strokeWidth?: number;
}) => {
  const LucideIcon = ICONS[name];
  if (!LucideIcon) return null;

  const resolvedSize =
    size ?? (SIZE_CLASS_PATTERN.test(className) ? '1em' : 20);
  const resolvedStrokeWidth =
    strokeWidth ?? (LARGE_SIZE_PATTERN.test(className) ? 1.6 : 1.9);

  return (
    <LucideIcon
      className={className}
      strokeWidth={resolvedStrokeWidth}
      style={{ width: resolvedSize, height: resolvedSize }}
      aria-hidden="true"
    />
  );
};
