
// Helper to create SVG data URIs
const svgToDataUri = (svgString: string) => 
  `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim().replace(/\s+/g, ' '))}`;

// 1. User Avatar (Cute Kid)
const avatarUserSvg = `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="#FF6B6B"/>
  <circle cx="50" cy="45" r="25" fill="#FFE66D"/>
  <circle cx="42" cy="42" r="3" fill="#2D3436"/>
  <circle cx="58" cy="42" r="3" fill="#2D3436"/>
  <path d="M40 55 Q50 65 60 55" stroke="#2D3436" stroke-width="3" fill="none"/>
  <path d="M20 90 Q50 70 80 90" fill="#FFF9F0"/>
</svg>`;

// 2. Bot Avatar (Cute Robot)
const avatarBotSvg = `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="#4ECDC4"/>
  <rect x="25" y="30" width="50" height="40" rx="10" fill="#FFF9F0"/>
  <circle cx="40" cy="45" r="5" fill="#2D3436"/>
  <circle cx="60" cy="45" r="5" fill="#2D3436"/>
  <rect x="45" y="60" width="10" height="5" rx="2" fill="#FF6B6B"/>
  <path d="M25 50 L15 40 M75 50 L85 40" stroke="#FFF9F0" stroke-width="5" stroke-linecap="round"/>
  <circle cx="15" cy="35" r="5" fill="#FFE66D"/>
  <circle cx="85" cy="35" r="5" fill="#FFE66D"/>
</svg>`;

// 3. Background: Sky (Blue Gradient with Clouds)
const bgSkySvg = `
<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#87CEEB"/>
  <circle cx="50" cy="50" r="30" fill="#FFFFFF" opacity="0.6"/>
  <circle cx="350" cy="80" r="40" fill="#FFFFFF" opacity="0.4"/>
  <circle cx="200" cy="150" r="20" fill="#FFFFFF" opacity="0.3"/>
</svg>`;

// 4. Background: Card Default (Abstract Pattern)
const bgCardSvg = `
<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#FFE66D"/>
  <circle cx="20" cy="20" r="10" fill="#FF6B6B" opacity="0.2"/>
  <circle cx="380" cy="280" r="20" fill="#4ECDC4" opacity="0.2"/>
  <rect x="100" y="50" width="200" height="200" rx="20" fill="none" stroke="#FFFFFF" stroke-width="5" opacity="0.3"/>
</svg>`;

// 5. Thumbnails (Vector Icons)
const thumbNatureSvg = `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="#6AB04C"/>
  <path d="M50 20 L20 80 L80 80 Z" fill="#FFF9F0"/>
</svg>`;

const thumbSpaceSvg = `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="#2D3436"/>
  <circle cx="50" cy="50" r="20" fill="#FFE66D"/>
  <circle cx="20" cy="20" r="2" fill="#FFF"/>
  <circle cx="80" cy="80" r="2" fill="#FFF"/>
</svg>`;

const thumbScienceSvg = `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="#5F27CD"/>
  <circle cx="50" cy="50" r="15" fill="#FFF9F0"/>
  <ellipse cx="50" cy="50" rx="30" ry="10" stroke="#FFF9F0" fill="none" transform="rotate(45 50 50)"/>
</svg>`;

// Export Assets using Data URIs
export const ASSETS = {
  avatar_user: svgToDataUri(avatarUserSvg),
  avatar_bot: svgToDataUri(avatarBotSvg),
  
  // Backgrounds
  bg_sky: svgToDataUri(bgSkySvg),
  bg_camera_fallback: svgToDataUri(bgSkySvg), // Reuse sky for fallback
  bg_ar_detail: svgToDataUri(bgCardSvg), // Reuse pattern
  bg_card_default: svgToDataUri(bgCardSvg),

  // Thumbnails
  thumb_blackhole: svgToDataUri(thumbSpaceSvg),
  thumb_cat: svgToDataUri(thumbNatureSvg),
  thumb_quantum: svgToDataUri(thumbScienceSvg),
  thumb_terracotta: svgToDataUri(bgCardSvg),

  // Illustrations
  il_tree: svgToDataUri(thumbNatureSvg),
  il_cubes: svgToDataUri(bgCardSvg),
  il_gears: svgToDataUri(thumbScienceSvg),
};
