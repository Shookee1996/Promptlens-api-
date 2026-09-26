export interface I18nDict {
  sTitle: string;
  tagline: string;
  advBtn: string;
  kIntake: string;
  kStudio: string;
  kHist: string;
  qKicker: string;
  qTitle: string;
  qMp: string;
  qInput: string;
  qTarget: string;
  qUp: string;
  qMatch: string;
  qDown: string;
  qNote: Record<string, string>;
  dropTitle: string;
  dropSub: string;
  dropReplace: string;
  browse: string;
  formats: string;
  pasteHint: string;
  dropActive: string;
  batchHint: string;
  addMore: string;
  selectAll: string;
  exportBtn: string;
  deleteSelBtn: string;
  cancelSel: string;
  selSuffix: string;
  toastExported: string;
  toastNothing: string;
  toastDeleted: string;
  toastBatch: string;
  btnShare: string;
  shareTitle: string;
  shareSub: string;
  shareLinkLabel: string;
  copyLink: string;
  nativeShare: string;
  shareHint: string;
  sharedBadge: string;
  sharedFrom: string;
  toastLinkCopied: string;
  toastShareFail: string;
  aboutBtn: string;
  aboutKicker: string;
  aboutTitle: string;
  aboutMission: string;
  versionTxt: string;
  contactBtn: string;
  contactKicker: string;
  contactTitle: string;
  contactSub: string;
  ctName: string;
  ctEmail: string;
  ctSubject: string;
  ctMsg: string;
  ctSend: string;
  ctSending: string;
  ctSent: string;
  ctAgain: string;
  sampleLabel: string;
  mDims: string;
  mTier: string;
  mFormat: string;
  mSize: string;
  mOrient: string;
  mtBri: string;
  mtCon: string;
  mtSat: string;
  mtWarm: string;
  mtDetail: string;
  mtColor: string;
  mtDepth: string;
  mtText: string;
  advTitle: string;
  confLabel: string;
  advNone: string;
  cThirds: string;
  cSym: string;
  cBokeh: string;
  cVig: string;
  cComp: string;
  cAnalog: string;
  cMono: string;
  cHoriz: string;
  cVert: string;
  cDiag: string;
  cHigh: string;
  cLow: string;
  cSharp: string;
  cSoft: string;
  cTex: string;
  cTempW: string;
  cTempC: string;
  cDepth: string;
  cRich: string;
  cText: string;
  cDesign: string;
  cCentered: string;
  cDynamic: string;
  paletteTitle: string;
  studioTitle: string;
  statusIdle: string;
  statusQueued: string;
  statusAnalyzing: string;
  statusApi: string;
  statusEnhancing: string;
  statusDone: string;
  statusError: string;
  engineLocalShort: string;
  fmtLabel: string;
  fmtText: string;
  fmtJson: string;
  jsonValid: string;
  jsonInvalid: string;
  detailLabel: string;
  dConcise: string;
  dBalanced: string;
  dExhaustive: string;
  pLangLabel: string;
  enhanceLabel: string;
  outLabel: string;
  outPh: string;
  sWords: string;
  sChars: string;
  sTokens: string;
  btnEnhance: string;
  btnCopy: string;
  btnRegen: string;
  btnDownload: string;
  negTitle: string;
  btnCopyNeg: string;
  histTitle: string;
  histEmpty: string;
  btnClear: string;
  apiTitle: string;
  apiSub: string;
  engLocalT: string;
  engLocalD: string;
  engApiT: string;
  engApiD: string;
  apisTitle: string;
  addApi: string;
  apiFormTitle: string;
  keyLabel: string;
  btnSave: string;
  btnTest: string;
  toastSaved: string;
  toastDone: string;
  toastCopied: string;
  toastNeg: string;
  toastHex: string;
  urlPlaceholder: string;
  loadBtn: string;
  undo: string;
  redo: string;
  requeue: string;
  genTitle: string;
  genSub: string;
  genGenerate: string;
  genCancel: string;
  genCopyMj: string;
  genCopied: string;
  genNoPrompt: string;
  genApiMissing: string;
  genDone: string;
}

export const I18N: Record<'en' | 'ar' | 'fr' | 'es', { dir: 'ltr' | 'rtl'; s: I18nDict }> = {
  ar: {
    dir: 'rtl',
    s: {
      sTitle: 'Promptlens-api — حوّل صورك إلى برومبتات احترافية',
      tagline: 'محرّك تحليل الصور وتوليد البرومبتات · عدة واجهات API · خصائص متقدمة مترابطة · من 1K إلى 12K · تشفير AES-256',
      advBtn: 'خصائص متقدمة',
      kIntake: 'إدخال الصور',
      kStudio: 'التوليد',
      kHist: 'دفعة الصور',
      qKicker: 'محرك الجودة',
      qTitle: 'جودة الإخراج المستهدفة · 1K → 12K',
      qMp: 'ميجابكسل',
      qInput: 'الإدخال',
      qTarget: 'الهدف',
      qUp: 'رفع دقة',
      qMatch: 'تطابق أصلي',
      qDown: 'خفض دقة',
      qNote: { '1K': 'دقة عالية', '2K': 'دقة رباعية', '4K': 'فائقة الوضوح', '5K': 'فائقة التفصيل', '6K': 'درجة سينمائية', '8K': 'أقصى وضوح', '12K': 'دقة خارقة' },
      dropTitle: 'أفلت صورك هنا',
      dropSub: 'أو انقر لاختيار عدة صور من جهازك',
      dropReplace: 'أفلت صوراً جديدة للإضافة',
      browse: 'اختيار صور',
      formats: 'JPG · PNG · WEBP · GIF · BMP · AVIF · SVG',
      pasteHint: 'الصق مباشرة بـ',
      dropActive: 'أفلت الصور لبدء التحليل…',
      batchHint: 'إسقاط عدة صور دفعة واحدة · معالجة متزامنة ×2',
      addMore: 'إضافة المزيد من الصور',
      selectAll: 'الكل',
      exportBtn: 'تصدير',
      deleteSelBtn: 'حذف',
      cancelSel: 'إلغاء',
      selSuffix: 'محدد',
      toastExported: 'تم تصدير {n} برومبت ✓',
      toastNothing: 'لا توجد برومبتات جاهزة للتصدير',
      toastDeleted: 'تم حذف {n} صورة',
      toastBatch: 'تمت إضافة {n} صور إلى الدفعة',
      btnShare: 'مشاركة',
      shareTitle: 'مشاركة البرومبت',
      shareSub: 'أنشئ رابطاً يحتوي البرومبت وشاركه مع أي شخص — بدون خوادم، البرومبت مشفّر داخل الرابط.',
      shareLinkLabel: 'رابط المشاركة',
      copyLink: 'نسخ الرابط',
      nativeShare: 'مشاركة عبر الجهاز',
      shareHint: 'يعمل الرابط على أي جهاز: يُفكّ تشفير البرومبت محلياً فور فتح الرابط.',
      sharedBadge: 'برومبت مشترك',
      sharedFrom: 'تم استلام برومبت عبر رابط مشاركة',
      toastLinkCopied: 'تم نسخ رابط المشاركة ✓',
      toastShareFail: 'تعذّرت المشاركة',
      aboutBtn: 'عنا',
      aboutKicker: 'من نحن · ABOUT',
      aboutTitle: 'نبذة عن Promptlens-api',
      aboutMission: 'Promptlens-api أداة متخصصة تحلّل كل صورة بالتفصيل الكامل — الأسلوب، التخطيط، الألوان، الإضاءة، الخطوط، التكوين، وجودة التصميم الاحترافية — ثم تولّد برومبت ذكاء اصطناعي حديث ومتوافق مع جميع محركات التوليد.',
      versionTxt: 'الإصدار 3.0 · Promptlens-api © 2026 · تشفير AES-256-GCM',
      contactBtn: 'تواصل معنا',
      contactKicker: 'تواصل · CONTACT',
      contactTitle: 'تواصل معنا',
      contactSub: 'يسعدنا سماع رأيك! أرسل لنا ملاحظاتك أو اقتراحاتك أو استفساراتك.',
      ctName: 'الاسم',
      ctEmail: 'البريد الإلكتروني',
      ctSubject: 'الموضوع',
      ctMsg: 'رسالتك',
      ctSend: 'إرسال الرسالة',
      ctSending: 'جارٍ الإرسال…',
      ctSent: 'تم إرسال رسالتك بنجاح',
      ctAgain: 'إرسال رسالة أخرى',
      sampleLabel: 'أمثلة جاهزة:',
      mDims: 'الأبعاد',
      mTier: 'فئة الدقة',
      mFormat: 'الصيغة',
      mSize: 'الحجم',
      mOrient: 'الاتجاه',
      mtBri: 'الإضاءة',
      mtCon: 'التباين',
      mtSat: 'التشبع',
      mtWarm: 'الدفء',
      mtDetail: 'التفاصيل',
      mtColor: 'الثراء اللوني',
      mtDepth: 'تدرّج العمق',
      mtText: 'الكثافة النصية',
      advTitle: 'الكشف المتقدم',
      confLabel: 'دقة التحليل وثقة القياسات',
      advNone: 'صورة متوازنة — لا سمات حادة إضافية',
      cThirds: 'قاعدة الأثلاث',
      cSym: 'تناظر تام',
      cBokeh: 'بوكيه وعمق ميدان',
      cVig: 'فينييت سينمائي',
      cComp: 'ألوان متكاملة',
      cAnalog: 'ألوان متناغمة',
      cMono: 'درجات أحادية',
      cHoriz: 'خطوط أفقية ممتدة',
      cVert: 'خطوط عمودية شامخة',
      cDiag: 'خطوط قطرية ديناميكية',
      cHigh: 'إضاءة هاي-كي',
      cLow: 'إضاءة لو-كي',
      cSharp: 'حدّة فائقة',
      cSoft: 'تركيز ناعم',
      cTex: 'ملمس سطحي غني',
      cTempW: 'درجات دافئة',
      cTempC: 'درجات باردة',
      cDepth: 'تدرّج عمق واضح',
      cRich: 'ثراء لوني عالٍ',
      cText: 'نصوص/تايبوغرافي',
      cDesign: 'تصميم غرافيكي',
      cCentered: 'تكوين متمركز',
      cDynamic: 'تكوين ديناميكي',
      paletteTitle: 'لوحة الألوان السائدة',
      studioTitle: 'استوديو البرومبت',
      statusIdle: 'بانتظار صورة',
      statusQueued: 'في الانتظار',
      statusAnalyzing: 'جارٍ التحليل…',
      statusApi: 'جارٍ الاستعلام من النموذج…',
      statusEnhancing: 'جارٍ تحسين البرومبت…',
      statusDone: 'جاهز',
      statusError: 'خطأ',
      engineLocalShort: 'محرك محلي',
      fmtLabel: 'صيغة الإخراج',
      fmtText: 'نص',
      fmtJson: 'JSON',
      jsonValid: 'JSON صالح ✓',
      jsonInvalid: 'JSON غير صالح ✗',
      detailLabel: 'مستوى التفصيل',
      dConcise: 'موجز',
      dBalanced: 'متوازن',
      dExhaustive: 'مفصّل',
      pLangLabel: 'لغة البرومبت',
      enhanceLabel: 'معزّزات الجودة',
      outLabel: 'البرومبت الناتج',
      outPh: 'سيظهر البرومبت هنا فور اكتمال التحليل… يمكنك تعديله يدوياً.',
      sWords: 'كلمة',
      sChars: 'حرف',
      sTokens: 'رمز تقديري',
      btnEnhance: 'تحسين البرومبت',
      btnCopy: 'نسخ البرومبت',
      btnRegen: 'إعادة توليد',
      btnDownload: 'تنزيل الملف',
      negTitle: 'البرومبت السلبي',
      btnCopyNeg: 'نسخ',
      histTitle: 'إدارة الدفعة',
      histEmpty: 'الصور المحلَّلة ستظهر هنا — أسقط عدة صور دفعة واحدة لمعالجة متزامنة، وحدّدها للتصدير الجماعي.',
      btnClear: 'مسح الكل',
      apiTitle: 'محرك الذكاء الاصطناعي',
      apiSub: 'اختر بين التحليل المحلي الفوري داخل المتصفح، أو ربط عدة مفاتيح API لاستدعاء نماذج رؤية سحابية.',
      engLocalT: 'المحرك المحلي',
      engLocalD: 'تحليل طيفي وتركيبي متقدم داخل المتصفح — فوري، مجاني، وبدون إنترنت.',
      engApiT: 'محرك سحابي (API)',
      engApiD: 'استدعاء نماذج رؤية (Gemini / GPT-4o / Claude) — أساسي للتحليل المزدوج ودرجة الثقة.',
      apisTitle: 'واجهات API المحفوظة',
      addApi: 'إضافة API',
      apiFormTitle: 'إضافة / تعديل واجهة API',
      keyLabel: 'مفتاح API',
      btnSave: 'حفظ',
      btnTest: 'اختبار الاتصال',
      toastSaved: 'تم حفظ الإعدادات ✓',
      toastDone: 'اكتمل التحليل',
      toastCopied: 'تم نسخ البرومبت ✓',
      toastNeg: 'تم نسخ البرومبت السلبي ✓',
      toastHex: 'تم نسخ اللون',
      urlPlaceholder: 'ألصق رابط صورة هنا…',
      loadBtn: 'تحميل',
      undo: 'تراجع',
      redo: 'إعادة',
      requeue: 'إعادة تحليل',
      genTitle: 'توليد صورة',
      genSub: 'أرسل البرومبت مباشرة إلى نماذج توليد الصور مع إعدادات متقدمة.',
      genGenerate: '🚀 توليد الصورة',
      genCancel: 'إلغاء',
      genCopyMj: '📋 نسخ برومبت Midjourney',
      genCopied: 'تم نسخ برومبت Midjourney إلى الحافظة ✓',
      genNoPrompt: '⚠️ لا يوجد برومبت جاهز للتوليد.',
      genApiMissing: '⚠️ يرجى إدخال مفتاح API أو تفعيل محرك API في الإعدادات.',
      genDone: '✅ تم توليد الصورة بنجاح!',
    },
  },
  en: {
    dir: 'ltr',
    s: {
      sTitle: 'Promptlens-api — Turn images into precise prompts',
      tagline: 'Image analysis & prompt engine · Multi-API · interconnected advanced features · 1K to 12K · AES-256 encryption',
      advBtn: 'Advanced',
      kIntake: 'IMAGE INPUT',
      kStudio: 'GENERATION',
      kHist: 'IMAGE BATCH',
      qKicker: 'QUALITY ENGINE',
      qTitle: 'Target output quality · 1K → 12K',
      qMp: 'megapixels',
      qInput: 'Input',
      qTarget: 'Target',
      qUp: 'Upscaling',
      qMatch: 'Native match',
      qDown: 'Downscaling',
      qNote: { '1K': 'High definition', '2K': 'Quad HD', '4K': 'Ultra HD', '5K': 'Ultra detailed', '6K': 'Cinema grade', '8K': 'Ultra HD max', '12K': 'Hyper resolution' },
      dropTitle: 'Drop your images here',
      dropSub: 'or click to browse multiple images',
      dropReplace: 'Drop new images to add',
      browse: 'Browse images',
      formats: 'JPG · PNG · WEBP · GIF · BMP · AVIF · SVG',
      pasteHint: 'paste with',
      dropActive: 'Release to start analyzing…',
      batchHint: 'Drop multiple images at once · ×2 concurrent processing',
      addMore: 'Add more images',
      selectAll: 'All',
      exportBtn: 'Export',
      deleteSelBtn: 'Delete',
      cancelSel: 'Cancel',
      selSuffix: 'selected',
      toastExported: '{n} prompts exported ✓',
      toastNothing: 'No finished prompts to export',
      toastDeleted: '{n} image(s) deleted',
      toastBatch: '{n} images added to the batch',
      btnShare: 'Share',
      shareTitle: 'Share Prompt',
      shareSub: 'Generate a link containing the prompt and share it with anyone — serverless, encoded inside the link.',
      shareLinkLabel: 'Share link',
      copyLink: 'Copy link',
      nativeShare: 'Device share',
      shareHint: 'The link works on any device: the prompt is decoded locally the moment it is opened.',
      sharedBadge: 'Shared prompt',
      sharedFrom: 'A shared prompt was received via link',
      toastLinkCopied: 'Share link copied ✓',
      toastShareFail: 'Sharing failed',
      aboutBtn: 'About',
      aboutKicker: 'ABOUT US',
      aboutTitle: 'About Promptlens-api',
      aboutMission: 'Promptlens-api analyzes every image in complete detail — style, layout, colors, lighting, typography, composition and professional design quality — then generates a modern AI prompt ready for generation.',
      versionTxt: 'Version 3.0 · Promptlens-api © 2026 · AES-256-GCM',
      contactBtn: 'Contact',
      contactKicker: 'CONTACT US',
      contactTitle: 'Contact Us',
      contactSub: 'We would love to hear from you! Send us your feedback, suggestions or questions.',
      ctName: 'Name',
      ctEmail: 'Email',
      ctSubject: 'Subject',
      ctMsg: 'Your message',
      ctSend: 'Send message',
      ctSending: 'Sending…',
      ctSent: 'Your message was sent successfully',
      ctAgain: 'Send another message',
      sampleLabel: 'Try a sample:',
      mDims: 'Dimensions',
      mTier: 'Resolution tier',
      mFormat: 'Format',
      mSize: 'Size',
      mOrient: 'Orientation',
      mtBri: 'Brightness',
      mtCon: 'Contrast',
      mtSat: 'Saturation',
      mtWarm: 'Warmth',
      mtDetail: 'Detail',
      mtColor: 'Color richness',
      mtDepth: 'Depth falloff',
      mtText: 'Text density',
      advTitle: 'Advanced detection',
      confLabel: 'Analysis confidence',
      advNone: 'Balanced image — no strong extra traits',
      cThirds: 'Rule of thirds',
      cSym: 'Perfect symmetry',
      cBokeh: 'Bokeh & depth of field',
      cVig: 'Cinematic vignette',
      cComp: 'Complementary colors',
      cAnalog: 'Analogous tones',
      cMono: 'Monochromatic range',
      cHoriz: 'Sweeping horizontals',
      cVert: 'Towering verticals',
      cDiag: 'Dynamic diagonals',
      cHigh: 'High-key light',
      cLow: 'Low-key light',
      cSharp: 'Tack-sharp focus',
      cSoft: 'Soft focus',
      cTex: 'Rich surface texture',
      cTempW: 'Warm tones',
      cTempC: 'Cool tones',
      cDepth: 'Clear depth falloff',
      cRich: 'High color richness',
      cText: 'Typography present',
      cDesign: 'Graphic design',
      cCentered: 'Centered composition',
      cDynamic: 'Dynamic composition',
      paletteTitle: 'Dominant palette',
      studioTitle: 'Prompt Studio',
      statusIdle: 'Awaiting image',
      statusQueued: 'Queued',
      statusAnalyzing: 'Analyzing…',
      statusApi: 'Querying model…',
      statusEnhancing: 'Enhancing prompt…',
      statusDone: 'Ready',
      statusError: 'Error',
      engineLocalShort: 'Local engine',
      fmtLabel: 'Output format',
      fmtText: 'Text',
      fmtJson: 'JSON',
      jsonValid: 'Valid JSON ✓',
      jsonInvalid: 'Invalid JSON ✗',
      detailLabel: 'Detail level',
      dConcise: 'Concise',
      dBalanced: 'Balanced',
      dExhaustive: 'Exhaustive',
      pLangLabel: 'Prompt language',
      enhanceLabel: 'Quality boosters',
      outLabel: 'Generated prompt',
      outPh: 'Your prompt will appear here once analysis completes — fully editable.',
      sWords: 'words',
      sChars: 'chars',
      sTokens: 'est. tokens',
      btnEnhance: 'Enhance Prompt',
      btnCopy: 'Copy prompt',
      btnRegen: 'Regenerate',
      btnDownload: 'Download file',
      negTitle: 'Negative prompt',
      btnCopyNeg: 'Copy',
      histTitle: 'Batch Manager',
      histEmpty: 'Analyzed images appear here — drop several at once for concurrent processing (×2), then select them for batch export.',
      btnClear: 'Clear all',
      apiTitle: 'AI Engine',
      apiSub: 'Choose between instant on-device spectral analysis, or connect multiple API keys to call cloud vision models.',
      engLocalT: 'Local Engine',
      engLocalD: 'Advanced spectral & compositional analysis in your browser — instant, free, offline.',
      engApiT: 'Cloud API Engine',
      engApiD: 'Call vision models (Gemini / GPT-4o / Claude) — required for Two-Pass and Confidence.',
      apisTitle: 'Saved API interfaces',
      addApi: 'Add API',
      apiFormTitle: 'Add / Edit API interface',
      keyLabel: 'API key',
      btnSave: 'Save',
      btnTest: 'Test connection',
      toastSaved: 'Settings saved ✓',
      toastDone: 'Analysis complete',
      toastCopied: 'Prompt copied ✓',
      toastNeg: 'Negative prompt copied ✓',
      toastHex: 'Color copied',
      urlPlaceholder: 'Paste image URL here…',
      loadBtn: 'Load',
      undo: 'Undo',
      redo: 'Redo',
      requeue: 'Re-analyze',
      genTitle: 'Generate Image',
      genSub: 'Send the prompt directly to image generation models with advanced settings.',
      genGenerate: '🚀 Generate Image',
      genCancel: 'Cancel',
      genCopyMj: '📋 Copy Midjourney Prompt',
      genCopied: 'Midjourney prompt copied to clipboard ✓',
      genNoPrompt: '⚠️ No prompt ready for generation.',
      genApiMissing: '⚠️ Please enter an API key or enable API engine in settings.',
      genDone: '✅ Image generated successfully!',
    },
  },
  fr: {
    dir: 'ltr',
    s: {
      sTitle: 'Promptlens-api — Transformez vos images en prompts',
      tagline: "Moteur d'analyse d'image · Multi-API · fonctions avancées interconnectées · 1K à 12K · chiffrement AES-256",
      advBtn: 'Avancé',
      kIntake: 'ENTRÉE IMAGE',
      kStudio: 'GÉNÉRATION',
      kHist: "LOT D'IMAGES",
      qKicker: 'MOTEUR QUALITÉ',
      qTitle: 'Qualité de sortie cible · 1K → 12K',
      qMp: 'mégapixels',
      qInput: 'Entrée',
      qTarget: 'Cible',
      qUp: 'Rehaussement',
      qMatch: 'Correspondance native',
      qDown: 'Réduction',
      qNote: { '1K': 'Haute définition', '2K': 'Quad HD', '4K': 'Ultra HD', '5K': 'Ultra détaillé', '6K': 'Qualité cinéma', '8K': 'Ultra HD max', '12K': 'Hyper résolution' },
      dropTitle: 'Déposez vos images ici',
      dropSub: 'ou cliquez pour choisir plusieurs images',
      dropReplace: 'Déposez de nouvelles images à ajouter',
      browse: 'Parcourir',
      formats: 'JPG · PNG · WEBP · GIF · BMP · AVIF · SVG',
      pasteHint: 'collez avec',
      dropActive: "Relâchez pour lancer l'analyse…",
      batchHint: 'Déposez plusieurs images à la fois · ×2 en parallèle',
      addMore: 'Ajouter des images',
      selectAll: 'Tout',
      exportBtn: 'Exporter',
      deleteSelBtn: 'Suppr.',
      cancelSel: 'Annuler',
      selSuffix: 'sélectionné(s)',
      toastExported: '{n} prompts exportés ✓',
      toastNothing: 'Aucun prompt prêt à exporter',
      toastDeleted: '{n} image(s) supprimée(s)',
      toastBatch: '{n} images ajoutées au lot',
      btnShare: 'Partager',
      shareTitle: 'Partager le prompt',
      shareSub: "Générez un lien contenant le prompt et partagez-le avec n'importe qui.",
      shareLinkLabel: 'Lien de partage',
      copyLink: 'Copier le lien',
      nativeShare: 'Partage appareil',
      shareHint: 'Le lien fonctionne sur tout appareil.',
      sharedBadge: 'Prompt partagé',
      sharedFrom: 'Un prompt partagé a été reçu via lien',
      toastLinkCopied: 'Lien de partage copié ✓',
      toastShareFail: 'Échec du partage',
      aboutBtn: 'À propos',
      aboutKicker: 'À PROPOS',
      aboutTitle: 'À propos de Promptlens-api',
      aboutMission: "Promptlens-api analyse chaque image en détail complet — style, mise en page, couleurs, éclairage, typographie, composition et qualité de design professionnelle.",
      versionTxt: 'Version 3.0 · Promptlens-api © 2026 · AES-256-GCM',
      contactBtn: 'Contact',
      contactKicker: 'CONTACTEZ-NOUS',
      contactTitle: 'Contactez-nous',
      contactSub: "Nous serions ravis d'avoir de vos nouvelles ! Envoyez-nous vos retours.",
      ctName: 'Nom',
      ctEmail: 'E-mail',
      ctSubject: 'Sujet',
      ctMsg: 'Votre message',
      ctSend: 'Envoyer le message',
      ctSending: 'Envoi…',
      ctSent: 'Votre message a été envoyé avec succès',
      ctAgain: 'Envoyer un autre message',
      sampleLabel: 'Exemples :',
      mDims: 'Dimensions',
      mTier: 'Niveau de résolution',
      mFormat: 'Format',
      mSize: 'Taille',
      mOrient: 'Orientation',
      mtBri: 'Luminosité',
      mtCon: 'Contraste',
      mtSat: 'Saturation',
      mtWarm: 'Chaleur',
      mtDetail: 'Détail',
      mtColor: 'Richesse chromatique',
      mtDepth: 'Chute de profondeur',
      mtText: 'Densité de texte',
      advTitle: 'Détection avancée',
      confLabel: "Confiance de l'analyse",
      advNone: 'Image équilibrée — aucun trait fort supplémentaire',
      cThirds: 'Règle des tiers',
      cSym: 'Symétrie parfaite',
      cBokeh: 'Bokeh & profondeur',
      cVig: 'Vignettage cinéma',
      cComp: 'Couleurs complémentaires',
      cAnalog: 'Tons analogues',
      cMono: 'Plage monochrome',
      cHoriz: 'Horizontales amples',
      cVert: 'Verticales élancées',
      cDiag: 'Diagonales dynamiques',
      cHigh: 'Lumière high-key',
      cLow: 'Lumière low-key',
      cSharp: 'Netteté absolue',
      cSoft: 'Mise au point douce',
      cTex: 'Texture de surface riche',
      cTempW: 'Tons chauds',
      cTempC: 'Tons froids',
      cDepth: 'Chute de profondeur nette',
      cRich: 'Richesse chromatique élevée',
      cText: 'Typographie présente',
      cDesign: 'Design graphique',
      cCentered: 'Composition centrée',
      cDynamic: 'Composition dynamique',
      paletteTitle: 'Palette dominante',
      studioTitle: 'Studio de prompt',
      statusIdle: "En attente d'image",
      statusQueued: 'En file',
      statusAnalyzing: 'Analyse…',
      statusApi: 'Requête au modèle…',
      statusEnhancing: 'Amélioration du prompt…',
      statusDone: 'Prêt',
      statusError: 'Erreur',
      engineLocalShort: 'Moteur local',
      fmtLabel: 'Format de sortie',
      fmtText: 'Texte',
      fmtJson: 'JSON',
      jsonValid: 'JSON valide ✓',
      jsonInvalid: 'JSON invalide ✗',
      detailLabel: 'Niveau de détail',
      dConcise: 'Concis',
      dBalanced: 'Équilibré',
      dExhaustive: 'Exhaustif',
      pLangLabel: 'Langue du prompt',
      enhanceLabel: 'Boosters de qualité',
      outLabel: 'Prompt généré',
      outPh: "Le prompt apparaîtra ici après l'analyse.",
      sWords: 'mots',
      sChars: 'car.',
      sTokens: 'tokens est.',
      btnEnhance: 'Améliorer le prompt',
      btnCopy: 'Copier',
      btnRegen: 'Régénérer',
      btnDownload: 'Télécharger',
      negTitle: 'Prompt négatif',
      btnCopyNeg: 'Copier',
      histTitle: 'Gestion du lot',
      histEmpty: 'Les images analysées apparaîtront ici.',
      btnClear: 'Tout effacer',
      apiTitle: 'Moteur IA',
      apiSub: "Choisissez entre l'analyse locale instantanée ou les API cloud.",
      engLocalT: 'Moteur local',
      engLocalD: 'Analyse spectrale avancée dans le navigateur — instantané, gratuit, hors ligne.',
      engApiT: 'Moteur cloud (API)',
      engApiD: 'Modèles de vision (Gemini / GPT-4o / Claude).',
      apisTitle: 'Interfaces API enregistrées',
      addApi: 'Ajouter une API',
      apiFormTitle: 'Ajouter / modifier une interface API',
      keyLabel: 'Clé API',
      btnSave: 'Enregistrer',
      btnTest: 'Tester la connexion',
      toastSaved: 'Paramètres enregistrés ✓',
      toastDone: 'Analyse terminée',
      toastCopied: 'Prompt copié ✓',
      toastNeg: 'Prompt négatif copié ✓',
      toastHex: 'Couleur copiée',
      urlPlaceholder: "Collez l'URL de l'image…",
      loadBtn: 'Charger',
      undo: 'Annuler',
      redo: 'Refaire',
      requeue: 'Ré-analyser',
      genTitle: 'Générer une image',
      genSub: 'Envoyer le prompt directement aux modèles de génération.',
      genGenerate: "🚀 Générer l'image",
      genCancel: 'Annuler',
      genCopyMj: '📋 Copier le prompt Midjourney',
      genCopied: 'Prompt Midjourney copié dans le presse-papiers ✓',
      genNoPrompt: '⚠️ Aucun prompt prêt pour la génération.',
      genApiMissing: '⚠️ Veuillez entrer une clé API.',
      genDone: '✅ Image générée avec succès !',
    },
  },
  es: {
    dir: 'ltr',
    s: {
      sTitle: 'Promptlens-api — Convierte imágenes en prompts',
      tagline: 'Motor de análisis de imagen · Multi-API · funciones avanzadas interconectadas · 1K a 12K · cifrado AES-256',
      advBtn: 'Avanzado',
      kIntake: 'ENTRADA',
      kStudio: 'GENERACIÓN',
      kHist: 'LOTE DE IMÁGENES',
      qKicker: 'MOTOR DE CALIDAD',
      qTitle: 'Calidad de salida objetivo · 1K → 12K',
      qMp: 'megapíxeles',
      qInput: 'Entrada',
      qTarget: 'Objetivo',
      qUp: 'Reescalado',
      qMatch: 'Coincidencia nativa',
      qDown: 'Reducción',
      qNote: { '1K': 'Alta definición', '2K': 'Quad HD', '4K': 'Ultra HD', '5K': 'Ultra detallado', '6K': 'Grado cine', '8K': 'Ultra HD max', '12K': 'Hiperresolución' },
      dropTitle: 'Suelta tus imágenes aquí',
      dropSub: 'o haz clic para elegir varias imágenes',
      dropReplace: 'Suelta nuevas imágenes para añadir',
      browse: 'Explorar',
      formats: 'JPG · PNG · WEBP · GIF · BMP · AVIF · SVG',
      pasteHint: 'pega con',
      dropActive: 'Suelta para analizar…',
      batchHint: 'Suelta varias imágenes a la vez · ×2 en paralelo',
      addMore: 'Añadir más imágenes',
      selectAll: 'Todo',
      exportBtn: 'Exportar',
      deleteSelBtn: 'Eliminar',
      cancelSel: 'Cancelar',
      selSuffix: 'seleccionado(s)',
      toastExported: '{n} prompts exportados ✓',
      toastNothing: 'No hay prompts listos para exportar',
      toastDeleted: '{n} imagen(es) eliminada(s)',
      toastBatch: '{n} imágenes añadidas al lote',
      btnShare: 'Compartir',
      shareTitle: 'Compartir el prompt',
      shareSub: 'Genera un enlace que contiene el prompt y compártelo con cualquiera.',
      shareLinkLabel: 'Enlace para compartir',
      copyLink: 'Copiar enlace',
      nativeShare: 'Compartir del dispositivo',
      shareHint: 'El enlace funciona en cualquier dispositivo.',
      sharedBadge: 'Prompt compartido',
      sharedFrom: 'Se recibió un prompt compartido por enlace',
      toastLinkCopied: 'Enlace copiado ✓',
      toastShareFail: 'Error al compartir',
      aboutBtn: 'Acerca de',
      aboutKicker: 'SOBRE NOSOTROS',
      aboutTitle: 'Sobre Promptlens-api',
      aboutMission: 'Promptlens-api analiza cada imagen en detalle completo — estilo, maquetación, colores, iluminación, tipografía, composición y calidad de diseño profesional.',
      versionTxt: 'Versión 3.0 · Promptlens-api © 2026 · AES-256-GCM',
      contactBtn: 'Contacto',
      contactKicker: 'CONTÁCTANOS',
      contactTitle: 'Contáctanos',
      contactSub: '¡Nos encantaría saber de ti! Envíanos tus comentarios.',
      ctName: 'Nombre',
      ctEmail: 'Correo electrónico',
      ctSubject: 'Asunto',
      ctMsg: 'Su mensaje',
      ctSend: 'Enviar mensaje',
      ctSending: 'Enviando…',
      ctSent: 'Su mensaje fue enviado con éxito',
      ctAgain: 'Enviar otro mensaje',
      sampleLabel: 'Ejemplos:',
      mDims: 'Dimensiones',
      mTier: 'Nivel de resolución',
      mFormat: 'Formato',
      mSize: 'Tamaño',
      mOrient: 'Orientación',
      mtBri: 'Brillo',
      mtCon: 'Contraste',
      mtSat: 'Saturación',
      mtWarm: 'Calidez',
      mtDetail: 'Detalle',
      mtColor: 'Riqueza cromática',
      mtDepth: 'Caída de profundidad',
      mtText: 'Densidad de texto',
      advTitle: 'Detección avanzada',
      confLabel: 'Confianza del análisis',
      advNone: 'Imagen equilibrada — sin rasgos fuertes adicionales',
      cThirds: 'Regla de tercios',
      cSym: 'Simetría perfecta',
      cBokeh: 'Bokeh y profundidad',
      cVig: 'Viñeteado de cine',
      cComp: 'Colores complementarios',
      cAnalog: 'Tonos análogos',
      cMono: 'Rango monocromo',
      cHoriz: 'Horizontales amplias',
      cVert: 'Verticales esbeltas',
      cDiag: 'Diagonales dinámicas',
      cHigh: 'Luz high-key',
      cLow: 'Luz low-key',
      cSharp: 'Nitidez absoluta',
      cSoft: 'Enfoque suave',
      cTex: 'Textura superficial rica',
      cTempW: 'Tonos cálidos',
      cTempC: 'Tonos fríos',
      cDepth: 'Caída de profundidad clara',
      cRich: 'Alta riqueza cromática',
      cText: 'Tipografía presente',
      cDesign: 'Diseño gráfico',
      cCentered: 'Composición centrada',
      cDynamic: 'Composición dinámica',
      paletteTitle: 'Paleta dominante',
      studioTitle: 'Estudio de prompts',
      statusIdle: 'Esperando imagen',
      statusQueued: 'En cola',
      statusAnalyzing: 'Analizando…',
      statusApi: 'Consultando al modelo…',
      statusEnhancing: 'Mejorando el prompt…',
      statusDone: 'Listo',
      statusError: 'Error',
      engineLocalShort: 'Motor local',
      fmtLabel: 'Formato de salida',
      fmtText: 'Texto',
      fmtJson: 'JSON',
      jsonValid: 'JSON válido ✓',
      jsonInvalid: 'JSON inválido ✗',
      detailLabel: 'Nivel de detalle',
      dConcise: 'Conciso',
      dBalanced: 'Equilibrado',
      dExhaustive: 'Exhaustivo',
      pLangLabel: 'Idioma del prompt',
      enhanceLabel: 'Potenciadores de calidad',
      outLabel: 'Prompt generado',
      outPh: 'El prompt aparecerá aquí al terminar el análisis.',
      sWords: 'palabras',
      sChars: 'car.',
      sTokens: 'tokens est.',
      btnEnhance: 'Mejorar prompt',
      btnCopy: 'Copiar',
      btnRegen: 'Regenerar',
      btnDownload: 'Descargar',
      negTitle: 'Prompt negativo',
      btnCopyNeg: 'Copiar',
      histTitle: 'Gestor de lote',
      histEmpty: 'Las imágenes analizadas aparecerán aquí.',
      btnClear: 'Limpiar todo',
      apiTitle: 'Motor de IA',
      apiSub: 'Elige entre el análisis espectral local o conecta varias claves API.',
      engLocalT: 'Motor local',
      engLocalD: 'Análisis espectral avanzado en el navegador — instantáneo, gratis, sin conexión.',
      engApiT: 'Motor cloud (API)',
      engApiD: 'Modelos de visión (Gemini / GPT-4o / Claude).',
      apisTitle: 'Interfaces API guardadas',
      addApi: 'Añadir API',
      apiFormTitle: 'Añadir / editar interfaz API',
      keyLabel: 'Clave API',
      btnSave: 'Guardar',
      btnTest: 'Probar conexión',
      toastSaved: 'Ajustes guardados ✓',
      toastDone: 'Análisis completo',
      toastCopied: 'Prompt copiado ✓',
      toastNeg: 'Prompt negativo copiado ✓',
      toastHex: 'Color copiado',
      urlPlaceholder: 'Pega la URL de la imagen…',
      loadBtn: 'Cargar',
      undo: 'Deshacer',
      redo: 'Rehacer',
      requeue: 'Re-analizar',
      genTitle: 'Generar imagen',
      genSub: 'Envía el prompt directamente a modelos de generación.',
      genGenerate: '🚀 Generar imagen',
      genCancel: 'Cancelar',
      genCopyMj: '📋 Copiar prompt Midjourney',
      genCopied: 'Prompt Midjourney copiado al portapapeles ✓',
      genNoPrompt: '⚠️ No hay prompt listo para generar.',
      genApiMissing: '⚠️ Introduce una clave API.',
      genDone: '✅ ¡Imagen generada con éxito!',
    },
  },
};
