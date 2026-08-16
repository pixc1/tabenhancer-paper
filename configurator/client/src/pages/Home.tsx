/**
 * DESIGN: Command Studio — a dark, editorial developer workbench with Copper Signal (#D48A3B).
 * Principles: live preview first, practical controls, asymmetric editor/preview split, restrained motion.
 */
import JSZip from "jszip";
import {
  Check,
  ChevronDown,
  Code2,
  Copy,
  Download,
  FileArchive,
  Github,
  Globe2,
  Info,
  Languages,
  Loader2,
  Menu,
  Monitor,
  PackageCheck,
  Palette,
  Plus,
  RefreshCw,
  Server,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  TerminalSquare,
  Users,
  Wifi,
  X,
} from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const isGitHubPages = typeof window !== "undefined" && window.location.hostname === "pixc1.github.io";
const ASSET_ROOT = isGitHubPages ? "/tabenhancer-paper/assets/images" : "/manus-storage";
const PLUGIN_URL = isGitHubPages ? "/tabenhancer-paper/releases/tab-enhancer-1.1.0.jar" : "/manus-storage/tab-enhancer-1.1.0_8efeb5a9.jar";
const GITHUB_URL = "https://github.com/pixc1/tabenhancer-paper";

function assetUrl(name: string) {
  return `${ASSET_ROOT}/${name}`;
}

type SiteLanguage = "ar" | "en";
type ContentLanguage = "ar" | "en";
type Mode = "survival" | "creative" | "adventure" | "spectator";

type ConfigState = {
  serverName: string;
  header: string[];
  footer: string[];
  showHeaderFooter: boolean;
  showPrefix: boolean;
  showPing: boolean;
  interval: number;
  prefixColors: Record<Mode, string>;
  labelColors: Record<Mode, string>;
  labels: Record<Mode, string>;
};

const modeMeta: Record<Mode, { icon: string; fallback: string }> = {
  survival: { icon: "◆", fallback: "Survival" },
  creative: { icon: "✦", fallback: "Creative" },
  adventure: { icon: "◈", fallback: "Adventure" },
  spectator: { icon: "◌", fallback: "Spectator" },
};

const legacyPalette = [
  { code: "&0", name: "Black", color: "#111111" },
  { code: "&8", name: "Dark Gray", color: "#555555" },
  { code: "&7", name: "Gray", color: "#aaaaaa" },
  { code: "&f", name: "White", color: "#ffffff" },
  { code: "&b", name: "Aqua", color: "#55ffff" },
  { code: "&a", name: "Green", color: "#55ff55" },
  { code: "&e", name: "Yellow", color: "#ffff55" },
  { code: "&d", name: "Pink", color: "#ff55ff" },
  { code: "&c", name: "Red", color: "#ff5555" },
  { code: "&6", name: "Gold", color: "#ffaa00" },
];

const minecraftColors: Record<string, string> = {
  "0": "#111111", "1": "#0000aa", "2": "#00aa00", "3": "#00aaaa", "4": "#aa0000", "5": "#aa00aa",
  "6": "#ffaa00", "7": "#aaaaaa", "8": "#555555", "9": "#5555ff", a: "#55ff55", b: "#55ffff",
  c: "#ff5555", d: "#ff55ff", e: "#ffff55", f: "#ffffff",
};

const initialConfig = (language: ContentLanguage): ConfigState => {
  const arabic = language === "ar";
  return {
    serverName: arabic ? "سيرفري" : "TEST SERVER",
    header: ["&8&m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", arabic ? "&b&lسيرفري" : "&b&lTEST SERVER", arabic ? "&7أهلًا، &f%player%" : "&7Welcome, &f%player%", ""],
    footer: ["", arabic ? "&7اللاعبون: &f%online%&7/&f%max%" : "&7Players: &f%online%&7/&f%max%", arabic ? "&7وضعك: %gamemode% &8| &7البينق: &f%ping%ms" : "&7Your mode: %gamemode% &8| &7Your ping: &f%ping%ms", "&8&m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"],
    showHeaderFooter: true,
    showPrefix: true,
    showPing: true,
    interval: 20,
    prefixColors: { survival: "&a", creative: "&d", adventure: "&e", spectator: "&b" },
    labelColors: { survival: "&a", creative: "&d", adventure: "&e", spectator: "&b" },
    labels: arabic
      ? { survival: "البقاء", creative: "الإبداع", adventure: "المغامرة", spectator: "المشاهدة" }
      : { survival: "Survival", creative: "Creative", adventure: "Adventure", spectator: "Spectator" },
  };
};

const copy = {
  ar: {
    dir: "rtl", brand: "TabEnhancer", navConfigurator: "المُخصِّص", navCompatibility: "التوافق", navGithub: "GitHub",
    eyebrow: "TABENHANCER  ·  CONFIG STUDIO", hero: "اضبط TAB كما يراه لاعبوك.", heroAccent: "لا كما يبدو داخل YAML.",
    heroText: "خصّص العناوين والألوان واللغة والـ Ping، ثم حمّل حزمة جاهزة تضعها مباشرة داخل مجلد plugins.",
    openStudio: "ابدأ التخصيص", downloadPlugin: "تنزيل البلوقن", compatible: "متوافق مع Paper 1.8.8 → 1.21.x",
    stepOne: "خصّص", stepTwo: "عاين", stepThree: "حمّل", editorLabel: "لوحة التخصيص", editorTitle: "إعدادات الـ TAB", editorDesc: "كل تعديل يحدث في المعاينة مباشرة.",
    contentLanguage: "لغة المحتوى", english: "English", arabic: "العربية", quickTheme: "نمط سريع", reset: "استرجاع الافتراضي",
    headerFooter: "Header و Footer", headerFooterHint: "النص الظاهر أعلى وأسفل قائمة TAB.", headerLines: "سطور العنوان", footerLines: "سطور التذييل",
    placeholders: "المتغيرات المدعومة", behavior: "سلوك القائمة", showHeaderFooter: "إظهار Header وFooter", showPrefix: "عرض بادئة الوضع", showPing: "عرض Ping بجانب الاسم", interval: "معدل التحديث", ticks: "ticks", ticksHint: "20 ticks = ثانية واحدة.",
    modeStyles: "ألوان أوضاع اللعب", modeStylesHint: "ألوان بادئة اللاعب واسم وضعه.", previewLabel: "معاينة حيّة", previewTitle: "هكذا ستظهر قائمة TAB", previewHint: "هذه معاينة مرئية. تحل القيم التجريبية محل المتغيرات عند اللعب.", online: "متصل", ping: "Ping", player: "PIXC1", server: "SERVER STATUS",
    generated: "يُنشئ الملف", configFile: "ملف config.yml", configDesc: "إعداد مخصص لنسخه في plugins/TabEnhancer/.", downloadConfig: "تنزيل config.yml", packageFile: "حزمة ZIP جاهزة", packageDesc: "تتضمن البلوقن وإعدادك المخصص وتعليمات التثبيت.", downloadPackage: "تنزيل الحزمة", generating: "جاري تجهيز الحزمة…", install: "التثبيت", installText: "فك الضغط ثم انسخ محتويات مجلد plugins إلى سيرفرك. شغّل /tabreload بعد استبدال الإعداد.",
    why: "لماذا هذا المُخصِّص؟", whyDesc: "يتحدث موقعك مع ملف الإعداد الحقيقي للبلوقن، لا مع قالب تقريبي.", point1Title: "إعدادات مطابقة", point1: "يصدر نفس المفاتيح التي يقرأها TabEnhancer v1.1.0.", point2Title: "تنزيل مباشر", point2: "اختر تنزيل الإعداد فقط أو حزمة البلوقن الكاملة.", point3Title: "متوافق بملف واحد", point3: "JAR مبني على Java 8 وPaperSpigot 1.8.8 API.", footerText: "بُني لمالكي سيرفرات Minecraft الذين يريدون تحكمًا واضحًا.", supported: "إصدارات Paper المدعومة", downloaded: "تم تجهيز التنزيل", copied: "تم النسخ", copy: "نسخ", menu: "القائمة", close: "إغلاق",
    ghLabel: "شاهد المشروع على GitHub", noHeader: "Header و Footer متوقفان", manualColor: "استخدم أكواد Minecraft مثل &b أو &a.", defaultMode: "وضع اللاعب", colors: "أكواد الألوان", jarOnly: "تنزيل JAR فقط", starting: "جاري بدء التنزيل…", bundleReady: "حزمة TabEnhancer جاهزة.", configReady: "ملف config.yml جاهز.",
  },
  en: {
    dir: "ltr", brand: "TabEnhancer", navConfigurator: "Configurator", navCompatibility: "Compatibility", navGithub: "GitHub",
    eyebrow: "TABENHANCER  ·  CONFIG STUDIO", hero: "Shape TAB the way players see it.", heroAccent: "Not the way YAML looks.",
    heroText: "Set the copy, language, colors and Ping visibility, then download a ready-to-install package for your plugins folder.",
    openStudio: "Start customizing", downloadPlugin: "Download plugin", compatible: "Paper 1.8.8 → 1.21.x compatible",
    stepOne: "Customize", stepTwo: "Preview", stepThree: "Download", editorLabel: "Configurator", editorTitle: "TAB settings", editorDesc: "Every edit appears in the preview immediately.",
    contentLanguage: "Content language", english: "English", arabic: "Arabic", quickTheme: "Quick theme", reset: "Reset defaults",
    headerFooter: "Header & Footer", headerFooterHint: "The text shown above and below the TAB list.", headerLines: "Header lines", footerLines: "Footer lines",
    placeholders: "Supported placeholders", behavior: "List behavior", showHeaderFooter: "Show Header & Footer", showPrefix: "Show game mode prefix", showPing: "Show Ping next to name", interval: "Refresh interval", ticks: "ticks", ticksHint: "20 ticks = one second.",
    modeStyles: "Game mode colors", modeStylesHint: "Colors used for player prefixes and game-mode labels.", previewLabel: "Live preview", previewTitle: "Your TAB list, rendered", previewHint: "This is a visual preview; sample values replace placeholders while playing.", online: "online", ping: "Ping", player: "PIXC1", server: "SERVER STATUS",
    generated: "Generated output", configFile: "config.yml file", configDesc: "A custom config ready for plugins/TabEnhancer/.", downloadConfig: "Download config.yml", packageFile: "Ready ZIP package", packageDesc: "Includes the plugin, your config and install notes.", downloadPackage: "Download package", generating: "Building package…", install: "Install", installText: "Unzip and copy the plugins folder into your server. Run /tabreload after replacing the configuration.",
    why: "Why use this configurator?", whyDesc: "The controls map to the plugin’s real configuration keys—not an approximate template.", point1Title: "Config-accurate", point1: "Exports the same keys read by TabEnhancer v1.1.0.", point2Title: "Direct download", point2: "Download the config only or a complete plugin package.", point3Title: "One-file compatible", point3: "JAR built for Java 8 and the PaperSpigot 1.8.8 API.", footerText: "Built for Minecraft server owners who want clear control.", supported: "Supported Paper versions", downloaded: "Download prepared", copied: "Copied", copy: "Copy", menu: "Menu", close: "Close",
    ghLabel: "View the project on GitHub", noHeader: "Header & Footer are disabled", manualColor: "Use Minecraft codes such as &b or &a.", defaultMode: "Player mode", colors: "Color codes", jarOnly: "Download JAR only", starting: "Starting download…", bundleReady: "Your TabEnhancer bundle is ready.", configReady: "Your config.yml is ready.",
  },
} as const;

function escapeYaml(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function quoteYaml(value: string) {
  return `"${escapeYaml(value)}"`;
}

function configToYaml(config: ConfigState) {
  const prefix = (mode: Mode) => `&8[${config.prefixColors[mode]}${config.labels[mode].toUpperCase()}&8] &f`;
  const label = (mode: Mode) => `${config.labelColors[mode]}${config.labels[mode]}`;
  return [
    "# TabEnhancer configuration generated by TabEnhancer Configurator",
    "# Use Minecraft legacy color codes such as &b, &a and &l.",
    "",
    "header:",
    ...config.header.map((line) => `  - ${quoteYaml(line)}`),
    "",
    "footer:",
    ...config.footer.map((line) => `  - ${quoteYaml(line)}`),
    "",
    "settings:",
    `  update-interval-ticks: ${Math.max(1, Math.round(config.interval))}`,
    `  show-status-prefix: ${config.showPrefix}`,
    `  show-ping: ${config.showPing}`,
    `  show-header-footer: ${config.showHeaderFooter}`,
    "",
    "prefixes:",
    `  survival: ${quoteYaml(prefix("survival"))}`,
    `  creative: ${quoteYaml(prefix("creative"))}`,
    `  adventure: ${quoteYaml(prefix("adventure"))}`,
    `  spectator: ${quoteYaml(prefix("spectator"))}`,
    `  unknown: ${quoteYaml("&8[&7PLAYER&8] &f")}`,
    "",
    "gamemode-labels:",
    `  survival: ${quoteYaml(label("survival"))}`,
    `  creative: ${quoteYaml(label("creative"))}`,
    `  adventure: ${quoteYaml(label("adventure"))}`,
    `  spectator: ${quoteYaml(label("spectator"))}`,
    `  unknown: ${quoteYaml("&7Unknown")}`,
    "",
  ].join("\n");
}

function expandPreview(value: string, config: ConfigState, activeMode: Mode) {
  return value
    .replace(/%player%/g, "PIXC1")
    .replace(/%online%/g, "18")
    .replace(/%max%/g, "100")
    .replace(/%gamemode%/g, `${config.labelColors[activeMode]}${config.labels[activeMode]}`)
    .replace(/%ping%/g, "42");
}

function LegacyText({ value, className = "" }: { value: string; className?: string }) {
  const nodes: { text: string; color: string; bold: boolean; strike: boolean; underline: boolean }[] = [];
  let color = "#f5f5f4";
  let bold = false;
  let strike = false;
  let underline = false;
  let text = "";
  const push = () => { if (text) nodes.push({ text, color, bold, strike, underline }); text = ""; };
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] === "&" && index + 1 < value.length) {
      const code = value[index + 1].toLowerCase();
      if (minecraftColors[code]) { push(); color = minecraftColors[code]; bold = false; strike = false; underline = false; index += 1; continue; }
      if (code === "l") { push(); bold = true; index += 1; continue; }
      if (code === "m") { push(); strike = true; index += 1; continue; }
      if (code === "n") { push(); underline = true; index += 1; continue; }
      if (code === "r") { push(); color = "#f5f5f4"; bold = false; strike = false; underline = false; index += 1; continue; }
    }
    text += value[index];
  }
  push();
  return <>{nodes.map((node, index) => <span key={`${node.text}-${index}`} className={className} style={{ color: node.color, fontWeight: node.bold ? 800 : 500, textDecoration: `${node.strike ? "line-through" : ""} ${node.underline ? "underline" : ""}`.trim() }}>{node.text}</span>)}</>;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[#89918d]">{children}</label>;
}

function Toggle({ checked, onChange, label, id }: { checked: boolean; onChange: (checked: boolean) => void; label: string; id: string }) {
  return <label htmlFor={id} className="flex min-h-12 cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 transition duration-200 hover:border-[#d48a3b]/35 hover:bg-[#d48a3b]/[0.035]">
    <span className="text-sm font-medium text-[#edf1ed]">{label}</span>
    <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-[#d48a3b]" : "bg-[#48504c]"}`}>
      <input id={id} type="checkbox" className="peer sr-only" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition duration-200 ${checked ? "start-6" : "start-1"}`} />
    </span>
  </label>;
}

function LineEditor({ value, onChange, placeholder }: { value: string[]; onChange: (next: string[]) => void; placeholder: string }) {
  const updateLine = (index: number, next: string) => onChange(value.map((line, current) => current === index ? next : line));
  const removeLine = (index: number) => onChange(value.filter((_, current) => current !== index));
  return <div className="space-y-2">
    {value.map((line, index) => <div className="flex items-center gap-2" key={`line-${index}`}>
      <span className="grid h-9 w-7 shrink-0 place-items-center font-mono text-xs text-[#6b746f]">{index + 1}</span>
      <input value={line} onChange={(event) => updateLine(index, event.target.value)} aria-label={`${placeholder} ${index + 1}`} placeholder={placeholder} className="min-w-0 flex-1 rounded-lg border border-white/[0.08] bg-[#0b100e] px-3 py-2 font-mono text-sm text-[#e4e9e5] outline-none transition placeholder:text-[#4d5550] focus:border-[#d48a3b] focus:ring-2 focus:ring-[#d48a3b]/20" />
      <button type="button" aria-label="Remove line" onClick={() => removeLine(index)} disabled={value.length === 1} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[#79817c] transition hover:bg-red-400/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-30"><X size={15} /></button>
    </div>)}
    <button type="button" onClick={() => onChange([...value, ""])} className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-[#c8915b] transition hover:bg-[#d48a3b]/10"><Plus size={15} /> Add line</button>
  </div>;
}

export default function Home() {
  const [siteLanguage, setSiteLanguage] = useState<SiteLanguage>("ar");
  const [contentLanguage, setContentLanguage] = useState<ContentLanguage>("en");
  const [config, setConfig] = useState<ConfigState>(() => initialConfig("en"));
  const [activeMode, setActiveMode] = useState<Mode>("survival");
  const [isBuilding, setIsBuilding] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const t = copy[siteLanguage];
  const direction = t.dir;
  const yaml = useMemo(() => configToYaml(config), [config]);
  const update = (changes: Partial<ConfigState>) => setConfig((current) => ({ ...current, ...changes }));

  useEffect(() => { document.documentElement.lang = siteLanguage; document.documentElement.dir = direction; }, [siteLanguage, direction]);

  const setContent = (language: ContentLanguage) => {
    setContentLanguage(language);
    setConfig((current) => ({ ...initialConfig(language), showHeaderFooter: current.showHeaderFooter, showPrefix: current.showPrefix, showPing: current.showPing, interval: current.interval }));
  };

  const downloadBlob = (content: BlobPart, fileName: string, type: string) => {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const downloadConfig = () => {
    downloadBlob(yaml, "config.yml", "text/yaml;charset=utf-8");
    toast.success(t.configReady);
  };

  const downloadJar = () => {
    const anchor = document.createElement("a");
    anchor.href = PLUGIN_URL;
    anchor.download = "tab-enhancer-1.1.0.jar";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    toast.success(t.starting);
  };

  const downloadPackage = async () => {
    setIsBuilding(true);
    try {
      const response = await fetch(PLUGIN_URL);
      if (!response.ok) throw new Error("Plugin download unavailable");
      const jar = await response.blob();
      const zip = new JSZip();
      zip.file("plugins/tab-enhancer-1.1.0.jar", jar);
      zip.file("plugins/TabEnhancer/config.yml", yaml);
      zip.file("INSTALL.txt", [
        "TabEnhancer custom package",
        "",
        "1. Copy the plugins folder into your Paper server directory.",
        "2. Start or restart the server.",
        "3. After changing config.yml later, run /tabreload.",
        "",
        "Compatibility target: Paper 1.8.8 to 1.21.x.",
      ].join("\n"));
      const bundle = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
      downloadBlob(bundle, "tabenhancer-custom-package.zip", "application/zip");
      toast.success(t.bundleReady);
    } catch (error) {
      downloadConfig();
      toast.error("Could not bundle the JAR, so your config.yml was downloaded instead.");
    } finally {
      setIsBuilding(false);
    }
  };

  const copyYaml = async () => {
    await navigator.clipboard.writeText(yaml);
    setCopied(true);
    toast.success(t.copied);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const featureItems: Array<{ Icon: typeof Sparkles; title: string; description: string }> = [
    { Icon: Sparkles, title: t.point1Title, description: t.point1 },
    { Icon: Download, title: t.point2Title, description: t.point2 },
    { Icon: Globe2, title: t.point3Title, description: t.point3 },
  ];
  const workflowItems: Array<{ number: string; label: string; Icon: typeof Settings2 }> = [
    { number: "01", label: t.stepOne, Icon: Settings2 },
    { number: "02", label: t.stepTwo, Icon: Monitor },
    { number: "03", label: t.stepThree, Icon: FileArchive },
  ];

  return <div className="min-h-screen overflow-x-hidden bg-[#0c1210] text-[#edf1ed] selection:bg-[#d48a3b] selection:text-[#111613]" dir={direction}>
    <div className="site-grain pointer-events-none fixed inset-0 z-0 opacity-[0.17]" style={{ backgroundImage: `url(${assetUrl("tabenhancer-texture-grid_2aa70ba7.png")})` }} />
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0c1210]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[74px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <a href="#top" className="group flex items-center gap-3" aria-label="TabEnhancer home"><img src={assetUrl("tabenhancer-mark_f5be5a61.png")} alt="" className="h-10 w-10 object-contain transition duration-200 group-hover:scale-105" /><span className="font-display text-lg font-bold tracking-tight text-white">Tab<span className="text-[#d48a3b]">Enhancer</span></span></a>
        <nav className="hidden items-center gap-7 lg:flex" aria-label={t.menu}><a href="#studio" className="text-sm font-semibold text-[#aeb6b1] transition hover:text-white">{t.navConfigurator}</a><a href="#compatibility" className="text-sm font-semibold text-[#aeb6b1] transition hover:text-white">{t.navCompatibility}</a><a href={GITHUB_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-[#aeb6b1] transition hover:text-white"><Github size={16} /> {t.navGithub}</a></nav>
        <div className="flex items-center gap-2">
          <div className="hidden items-center rounded-lg border border-white/[0.08] bg-white/[0.03] p-1 sm:flex"><button onClick={() => setSiteLanguage("ar")} className={`min-h-8 rounded-md px-2.5 text-xs font-bold transition ${siteLanguage === "ar" ? "bg-[#d48a3b] text-[#171815]" : "text-[#9ca59f] hover:text-white"}`}>ع</button><button onClick={() => setSiteLanguage("en")} className={`min-h-8 rounded-md px-2.5 text-xs font-bold transition ${siteLanguage === "en" ? "bg-[#d48a3b] text-[#171815]" : "text-[#9ca59f] hover:text-white"}`}>EN</button></div>
          <button aria-label={isMenuOpen ? t.close : t.menu} onClick={() => setIsMenuOpen(!isMenuOpen)} className="grid h-11 w-11 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-[#d7ddd9] lg:hidden">{isMenuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>
      {isMenuOpen && <div className="border-t border-white/[0.06] bg-[#101713] px-5 py-4 lg:hidden"><div className="flex flex-col gap-2"><a onClick={() => setIsMenuOpen(false)} href="#studio" className="rounded-lg px-3 py-3 text-sm font-semibold text-[#c7cfca] hover:bg-white/[0.05]">{t.navConfigurator}</a><a onClick={() => setIsMenuOpen(false)} href="#compatibility" className="rounded-lg px-3 py-3 text-sm font-semibold text-[#c7cfca] hover:bg-white/[0.05]">{t.navCompatibility}</a><a href={GITHUB_URL} target="_blank" rel="noreferrer" className="rounded-lg px-3 py-3 text-sm font-semibold text-[#c7cfca] hover:bg-white/[0.05]">{t.navGithub}</a><div className="mt-2 flex gap-2"><button onClick={() => setSiteLanguage("ar")} className="rounded-lg border border-white/[0.09] px-3 py-2 text-sm">العربية</button><button onClick={() => setSiteLanguage("en")} className="rounded-lg border border-white/[0.09] px-3 py-2 text-sm">English</button></div></div></div>}
    </header>

    <main id="top" className="relative z-10">
      <section className="relative isolate overflow-hidden border-b border-white/[0.07]">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#0c1210_0%,#0c1210_37%,rgba(12,18,16,0.68)_58%,rgba(12,18,16,0.1)_100%)]" />
        <img src={assetUrl("tabenhancer-hero-studio_ff18992d.png")} alt="Abstract TabEnhancer configuration studio" className="absolute inset-0 -z-20 h-full w-full object-cover object-[68%_center] opacity-90" />
        <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-36"><div className="max-w-2xl"><p className="mb-5 flex items-center gap-2 font-mono text-[0.66rem] font-bold tracking-[0.2em] text-[#d6a16c]"><span className="h-px w-8 bg-[#d48a3b]" /> {t.eyebrow}</p><h1 className="font-display text-4xl font-bold leading-[1.05] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">{t.hero}<br /><span className="text-[#d48a3b]">{t.heroAccent}</span></h1><p className="mt-7 max-w-xl text-base leading-8 text-[#c4ccc7] sm:text-lg">{t.heroText}</p><div className="mt-9 flex flex-col gap-3 sm:flex-row"><a href="#studio" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#d48a3b] px-5 text-sm font-extrabold text-[#161a17] shadow-[0_12px_35px_rgba(212,138,59,0.22)] transition duration-200 hover:bg-[#e29a51] active:scale-[0.97]"><SlidersHorizontal size={17} /> {t.openStudio}</a><button onClick={downloadJar} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/[0.13] bg-black/15 px-5 text-sm font-bold text-[#edf1ed] backdrop-blur-md transition duration-200 hover:border-[#d48a3b]/60 hover:bg-white/[0.07] active:scale-[0.97]"><Download size={17} /> {t.downloadPlugin}</button></div><p className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#4b6954]/50 bg-[#1c2d20]/60 px-3.5 py-2 text-xs font-semibold text-[#abd3b3]"><Check size={14} /> {t.compatible}</p></div></div>
      </section>

      <section className="border-b border-white/[0.06] bg-[#111814]" aria-label="Workflow"><div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-3 px-5 py-4 sm:px-8 lg:px-12"><div className="mr-3 hidden font-mono text-xs font-bold uppercase tracking-[0.14em] text-[#7e8982] md:block">Workflow</div>{workflowItems.map(({ number, label, Icon: StepIcon }, index) => <div key={number} className="flex items-center gap-3"><div className="flex items-center gap-2 rounded-lg bg-white/[0.04] px-3 py-2"><span className="font-mono text-xs text-[#d48a3b]">{number}</span><StepIcon size={15} className="text-[#abb5ae]" /><span className="text-sm font-bold text-[#e7ece8]">{label}</span></div>{index < 2 && <span className="hidden h-px w-6 bg-white/10 sm:block" />}</div>)}</div></section>

      <section id="studio" className="scroll-mt-24 bg-[#0e1512] py-14 sm:py-20"><div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12"><div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="section-kicker">{t.editorLabel}</p><h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.035em] text-white sm:text-4xl">{t.editorTitle}</h2><p className="mt-3 text-[#9ea9a1]">{t.editorDesc}</p></div><button onClick={() => { setConfig(initialConfig(contentLanguage)); toast.success(t.reset); }} className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-lg border border-white/[0.09] px-4 text-sm font-bold text-[#c7cfca] transition hover:border-[#d48a3b]/50 hover:text-white md:self-auto"><RefreshCw size={15} /> {t.reset}</button></div>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_minmax(360px,0.82fr)]">
          <div className="space-y-5">
            <section className="panel-panel p-5 sm:p-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><FieldLabel>{t.contentLanguage}</FieldLabel><p className="mt-1 text-sm text-[#7f8982]">{t.manualColor}</p></div><div className="inline-flex rounded-lg border border-white/[0.08] bg-[#0a0f0d] p-1"><button onClick={() => setContent("en")} className={`min-h-10 rounded-md px-4 text-sm font-bold transition ${contentLanguage === "en" ? "bg-[#d48a3b] text-[#171815]" : "text-[#9aa49e] hover:text-white"}`}>{t.english}</button><button onClick={() => setContent("ar")} className={`min-h-10 rounded-md px-4 text-sm font-bold transition ${contentLanguage === "ar" ? "bg-[#d48a3b] text-[#171815]" : "text-[#9aa49e] hover:text-white"}`}>{t.arabic}</button></div></div><div className="mt-6"><FieldLabel>{t.quickTheme}</FieldLabel><div className="mt-3 flex flex-wrap gap-2">{legacyPalette.map((swatch) => <button key={swatch.code} onClick={() => update({ header: config.header.map((line, index) => index === 1 ? `${swatch.code}&l${config.serverName}` : line) })} title={swatch.name} className="group inline-flex h-10 items-center gap-2 rounded-lg border border-white/[0.08] bg-[#0b100e] px-2.5 transition hover:border-white/25"><span className="h-4 w-4 rounded-sm shadow-inner" style={{ background: swatch.color }} /><span className="font-mono text-xs text-[#aeb7b0] group-hover:text-white">{swatch.code}</span></button>)}</div></div></section>

            <section className="panel-panel p-5 sm:p-6"><div className="flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#d48a3b]/10 text-[#dba05f]"><TerminalSquare size={19} /></div><div><h3 className="font-display text-lg font-bold text-white">{t.headerFooter}</h3><p className="mt-1 text-sm leading-6 text-[#8e9991]">{t.headerFooterHint}</p></div></div><div className="mt-6 grid gap-7"><div><div className="mb-3 flex items-center justify-between"><FieldLabel>{t.headerLines}</FieldLabel><span className="font-mono text-xs text-[#6d7770]">header:</span></div><LineEditor value={config.header} onChange={(header) => update({ header })} placeholder="&b&lYOUR SERVER" /></div><div className="border-t border-white/[0.07] pt-6"><div className="mb-3 flex items-center justify-between"><FieldLabel>{t.footerLines}</FieldLabel><span className="font-mono text-xs text-[#6d7770]">footer:</span></div><LineEditor value={config.footer} onChange={(footer) => update({ footer })} placeholder="&7Players: &f%online%" /></div></div><div className="mt-6 border-t border-white/[0.07] pt-5"><FieldLabel>{t.placeholders}</FieldLabel><div className="mt-3 flex flex-wrap gap-2">{["%player%", "%online%", "%max%", "%gamemode%", "%ping%"].map((item) => <button key={item} onClick={() => navigator.clipboard.writeText(item).then(() => toast.success(`${item} ${t.copied}`))} className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-[#d48a3b]/20 bg-[#d48a3b]/[0.06] px-2.5 font-mono text-xs text-[#e4b077] transition hover:bg-[#d48a3b]/[0.14]"><Copy size={12} /> {item}</button>)}</div></div></section>

            <section className="panel-panel p-5 sm:p-6"><div className="flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#39b981]/10 text-[#67d5a5]"><SlidersHorizontal size={19} /></div><div><h3 className="font-display text-lg font-bold text-white">{t.behavior}</h3><p className="mt-1 text-sm leading-6 text-[#8e9991]">{t.ticksHint}</p></div></div><div className="mt-6 grid gap-2"><Toggle id="header-footer" label={t.showHeaderFooter} checked={config.showHeaderFooter} onChange={(showHeaderFooter) => update({ showHeaderFooter })} /><Toggle id="prefix" label={t.showPrefix} checked={config.showPrefix} onChange={(showPrefix) => update({ showPrefix })} /><Toggle id="ping" label={t.showPing} checked={config.showPing} onChange={(showPing) => update({ showPing })} /></div><div className="mt-6 border-t border-white/[0.07] pt-5"><div className="flex items-center justify-between"><FieldLabel>{t.interval}</FieldLabel><output className="rounded-md bg-[#d48a3b]/10 px-2.5 py-1 font-mono text-sm font-bold text-[#e6b477]">{config.interval} {t.ticks}</output></div><input type="range" min="1" max="100" step="1" value={config.interval} onChange={(event) => update({ interval: Number(event.target.value) })} className="copper-range mt-4 w-full" /></div></section>

            <section className="panel-panel p-5 sm:p-6"><div className="flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#55ffff]/10 text-[#80f4f4]"><Palette size={19} /></div><div><h3 className="font-display text-lg font-bold text-white">{t.modeStyles}</h3><p className="mt-1 text-sm leading-6 text-[#8e9991]">{t.modeStylesHint}</p></div></div><div className="mt-6 grid gap-3 sm:grid-cols-2">{(Object.keys(modeMeta) as Mode[]).map((mode) => <div key={mode} className="rounded-xl border border-white/[0.08] bg-[#0b100e] p-4"><div className="mb-3 flex items-center justify-between"><span className="font-mono text-xs uppercase tracking-[0.1em] text-[#b3bcb5]">{modeMeta[mode].icon} {mode}</span><button onClick={() => setActiveMode(mode)} className={`text-xs font-bold ${activeMode === mode ? "text-[#d48a3b]" : "text-[#69736c] hover:text-white"}`}>{t.defaultMode}</button></div><input value={config.labels[mode]} onChange={(event) => update({ labels: { ...config.labels, [mode]: event.target.value } })} aria-label={`${mode} label`} className="mb-2 w-full rounded-md border border-white/[0.08] bg-[#111814] px-2.5 py-2 text-sm text-white outline-none focus:border-[#d48a3b]" /><div className="grid grid-cols-2 gap-2"><input value={config.prefixColors[mode]} onChange={(event) => update({ prefixColors: { ...config.prefixColors, [mode]: event.target.value } })} aria-label={`${mode} prefix color`} className="min-w-0 rounded-md border border-white/[0.08] bg-[#111814] px-2.5 py-2 font-mono text-sm text-[#cfd7d1] outline-none focus:border-[#d48a3b]" /><input value={config.labelColors[mode]} onChange={(event) => update({ labelColors: { ...config.labelColors, [mode]: event.target.value } })} aria-label={`${mode} label color`} className="min-w-0 rounded-md border border-white/[0.08] bg-[#111814] px-2.5 py-2 font-mono text-sm text-[#cfd7d1] outline-none focus:border-[#d48a3b]" /></div></div>)}</div></section>
          </div>

          <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
            <section className="preview-shell overflow-hidden"><div className="relative min-h-[545px] overflow-hidden p-5 sm:p-7"><img src={assetUrl("tabenhancer-preview-vignette_19f08066.png")} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-[0.15]" /><div className="relative"><div className="flex items-center justify-between"><div><p className="section-kicker">{t.previewLabel}</p><h3 className="mt-2 font-display text-xl font-bold text-white">{t.previewTitle}</h3></div><span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#64c890]/30 bg-[#50ba7a]/10 text-[#7ce2a9]"><Wifi size={16} /></span></div><p className="mt-3 max-w-sm text-sm leading-6 text-[#9aa59e]">{t.previewHint}</p>
              <div className="mt-8 border border-white/[0.12] bg-[#121211]/95 p-4 shadow-2xl backdrop-blur-md sm:p-5"><div className="mb-4 flex items-center justify-between border-b border-white/[0.08] pb-3"><span className="font-mono text-[0.65rem] font-bold tracking-[0.12em] text-[#aab3ad]">{t.server}</span><span className="inline-flex items-center gap-1.5 font-mono text-xs text-[#8fdaab]"><span className="h-1.5 w-1.5 rounded-full bg-[#52d187]" />18 {t.online}</span></div>
                {config.showHeaderFooter ? <div className="min-h-24 border-b border-white/[0.06] pb-4 text-center font-mono text-sm leading-5"><div className="space-y-0.5">{config.header.map((line, index) => <div key={`header-${index}`} className="min-h-5"><LegacyText value={expandPreview(line, config, activeMode)} /></div>)}</div></div> : <div className="grid min-h-24 place-items-center border-b border-white/[0.06] pb-4 text-center text-xs font-medium text-[#69736c]">{t.noHeader}</div>}
                <div className="space-y-3 py-5">{["PIXC1", "JaxCraft", "MinaByte", "Raven_X"].map((player, index) => { const currentMode = ([activeMode, "creative", "adventure", "spectator"] as Mode[])[index]; const prefix = `&8[${config.prefixColors[currentMode]}${config.labels[currentMode].toUpperCase()}&8] &f`; return <div key={player} className="flex items-center justify-between gap-3 font-mono text-sm"><span className="min-w-0 truncate">{config.showPrefix ? <LegacyText value={`${prefix}${player}`} /> : <span className="text-white">{player}</span>}</span>{config.showPing && <span className="shrink-0 text-[#9ca69f]"><span className="text-[#747e77]">{t.ping}: </span><span className={index === 0 ? "text-[#80e4a7]" : "text-[#e2cc82]"}>{[42, 58, 73, 96][index]}ms</span></span>}</div>; })}</div>
                {config.showHeaderFooter && <div className="border-t border-white/[0.06] pt-4 text-center font-mono text-sm leading-5"><div className="space-y-0.5">{config.footer.map((line, index) => <div key={`footer-${index}`} className="min-h-5"><LegacyText value={expandPreview(line, config, activeMode)} /></div>)}</div></div>}
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center"><div className="rounded-lg border border-white/[0.07] bg-black/15 p-3"><Users size={15} className="mx-auto text-[#d48a3b]" /><span className="mt-1.5 block font-mono text-xs text-[#c8d0cb]">18 / 100</span></div><div className="rounded-lg border border-white/[0.07] bg-black/15 p-3"><Wifi size={15} className="mx-auto text-[#d48a3b]" /><span className="mt-1.5 block font-mono text-xs text-[#c8d0cb]">42 ms</span></div><div className="rounded-lg border border-white/[0.07] bg-black/15 p-3"><Server size={15} className="mx-auto text-[#d48a3b]" /><span className="mt-1.5 block font-mono text-xs text-[#c8d0cb]">Paper</span></div></div>
            </div></div></section>
            <section className="panel-panel p-5 sm:p-6"><div className="flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#d48a3b]/10 text-[#dba05f]"><Code2 size={18} /></div><div><p className="section-kicker">YAML</p><h3 className="mt-1 font-display text-lg font-bold text-white">{t.configFile}</h3></div><button aria-label={t.copy} onClick={copyYaml} className="ml-auto grid h-10 w-10 place-items-center rounded-lg border border-white/[0.09] text-[#aeb7b1] transition hover:border-[#d48a3b]/50 hover:text-white">{copied ? <Check size={16} className="text-[#74dba0]" /> : <Copy size={16} />}</button></div><pre className="yaml-scroll mt-4 max-h-56 overflow-auto rounded-lg border border-white/[0.07] bg-[#080c0a] p-3 font-mono text-[0.68rem] leading-5 text-[#bbc6be]">{yaml}</pre></section>
          </aside>
        </div></div></section>

      <section id="compatibility" className="scroll-mt-24 border-y border-white/[0.07] bg-[#111814] py-14 sm:py-20"><div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12"><div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]"><div><p className="section-kicker">{t.generated}</p><h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.035em] text-white sm:text-4xl">{t.downloaded}</h2><p className="mt-4 max-w-md leading-7 text-[#9ca69f]">{t.installText}</p><div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#3b6d4c]/50 bg-[#1b3221] px-3 py-2 text-xs font-bold text-[#a9dbb8]"><PackageCheck size={14} /> {t.supported}: 1.8.8 — 1.21.x</div></div><div className="grid gap-4 md:grid-cols-2"><article className="download-card"><div className="flex items-start justify-between"><div className="grid h-11 w-11 place-items-center rounded-xl bg-white/[0.06] text-[#b9c5bd]"><Code2 size={21} /></div><span className="font-mono text-xs text-[#6f7a72]">01</span></div><h3 className="mt-6 font-display text-xl font-bold text-white">{t.configFile}</h3><p className="mt-2 min-h-12 text-sm leading-6 text-[#98a29b]">{t.configDesc}</p><button onClick={downloadConfig} className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-white/[0.11] text-sm font-bold text-[#dde3de] transition hover:border-[#d48a3b]/65 hover:bg-[#d48a3b]/[0.06] active:scale-[0.98]"><Download size={16} /> {t.downloadConfig}</button></article><article className="download-card copper-card"><div className="flex items-start justify-between"><div className="grid h-11 w-11 place-items-center rounded-xl bg-[#d48a3b]/15 text-[#e6ae71]"><FileArchive size={21} /></div><span className="font-mono text-xs text-[#d7a773]">02</span></div><h3 className="mt-6 font-display text-xl font-bold text-white">{t.packageFile}</h3><p className="mt-2 min-h-12 text-sm leading-6 text-[#b8a68f]">{t.packageDesc}</p><button disabled={isBuilding} onClick={downloadPackage} className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#d48a3b] text-sm font-extrabold text-[#161a17] transition hover:bg-[#e39d56] disabled:cursor-wait disabled:opacity-70 active:scale-[0.98]">{isBuilding ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}{isBuilding ? t.generating : t.downloadPackage}</button></article></div></div></div></section>

      <section className="bg-[#0e1512] py-14 sm:py-20"><div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12"><div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]"><div><p className="section-kicker">TabEnhancer v1.1.0</p><h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.035em] text-white sm:text-4xl">{t.why}</h2><p className="mt-4 max-w-md leading-7 text-[#9ca69f]">{t.whyDesc}</p></div><div className="grid gap-3 sm:grid-cols-3">{featureItems.map(({ Icon: FeatureIcon, title, description }) => <article key={title} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-5 transition hover:-translate-y-0.5 hover:border-[#d48a3b]/35"><FeatureIcon size={19} className="text-[#d48a3b]" /><h3 className="mt-5 font-display font-bold text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-[#8f9992]">{description}</p></article>)}</div></div></div></section>
    </main>
    <footer className="relative z-10 border-t border-white/[0.06] bg-[#09100d]"><div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-5 py-7 text-sm text-[#849087] sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12"><div className="flex items-center gap-3"><img src={assetUrl("tabenhancer-mark_f5be5a61.png")} alt="" className="h-7 w-7 object-contain" /><span>{t.footerText}</span></div><a href={GITHUB_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-semibold text-[#c5ccc7] transition hover:text-[#e2a462]"><Github size={16} /> {t.ghLabel}</a></div></footer>
  </div>;
}
