export interface SuggestionCategory {
  id: string;
  name: { ar: string; en: string; fr: string; es: string };
  icon: string;
  chips: string[];
}

export const SUGGESTION_CATEGORIES: SuggestionCategory[] = [
  {
    id: 'style',
    name: {
      ar: 'الأسلوب والجمالية',
      en: 'Style & Aesthetics',
      fr: 'Style & Esthétique',
      es: 'Estilo y Estética',
    },
    icon: '🎨',
    chips: [
      'Cyberpunk dystopian neon realism',
      'Dark Baroque chiaroscuro with dramatic shadows',
      'Analog 35mm Kodak Portra 400 film grain',
      'Minimalist Scandinavian editorial design',
      'Surrealistic dreamscape with ethereal glow',
      'Unreal Engine 5 Octane render with raytracing',
      'Japanese Ukiyo-e woodblock inspired modern digital art',
      'Vintage 1970s warm Polaroid snapshot aesthetic',
    ],
  },
  {
    id: 'lighting',
    name: {
      ar: 'الإضاءة والجو المحيط',
      en: 'Lighting & Atmosphere',
      fr: 'Éclairage & Ambiance',
      es: 'Iluminación y Atmósfera',
    },
    icon: '💡',
    chips: [
      'Volumetric god rays filtering through morning haze',
      'Moody cinematic rim light with deep chiaroscuro',
      'Bioluminescent underwater atmospheric glow',
      'Golden hour backlighting with soft chromatic flare',
      'Dual-tone studio softbox lighting in cyan and magenta',
      'Dappled sunlight through dense forest foliage',
      'Diffused overcast ambient light with low contrast',
    ],
  },
  {
    id: 'camera',
    name: {
      ar: 'الكاميرا والبصريات',
      en: 'Camera & Optics',
      fr: 'Caméra & Optique',
      es: 'Cámara y Óptica',
    },
    icon: '📷',
    chips: [
      'Shot on 85mm f/1.2 portrait lens with creamy bokeh',
      'Extreme macro 100mm lens revealing tactile micro-textures',
      'Ultra wide-angle 16mm dramatic dynamic perspective',
      'Tilt-shift miniature depth-of-field optical effect',
      'Cinematic anamorphic 2.39:1 widescreen lens flare',
      'Overhead flat lay architectural bird-eye framing',
    ],
  },
  {
    id: 'mood',
    name: {
      ar: 'المشاعر والمزاج العام',
      en: 'Mood & Emotion',
      fr: 'Humeur & Émotion',
      es: 'Estado de ánimo y Emoción',
    },
    icon: '🎭',
    chips: [
      'Hauntingly ethereal, serene, and mystical tranquility',
      'Tense noir mystery with high contrast shadow play',
      'Warm nostalgic sepia-toned retro intimacy',
      'Futuristic high-energy dynamism and adrenaline',
      'Contemplative solitary quietude with vast empty space',
      'Euphoric vivid dreamlike celebration of colors',
    ],
  },
  {
    id: 'quality',
    name: {
      ar: 'الرندرة وجودة التفاصيل',
      en: 'Rendering & Fidelity',
      fr: 'Rendu & Précision',
      es: 'Renderizado y Fidelidad',
    },
    icon: '✨',
    chips: [
      'Masterpiece, 8K UHD, pristine micro-contrast',
      'Tack-sharp eye focus with crystal reflections',
      'Subtle analog chromatic aberration and authentic grain',
      'Pristine editorial color grading with balanced skin tones',
      'Intricate hyper-detailed surface texture fidelity',
    ],
  },
];
