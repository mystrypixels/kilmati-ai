import React, { useState, useEffect, useRef } from 'react';
import { WordRecord } from '../types';
import { 
  Sparkles, 
  Compass, 
  Wand2, 
  Volume2, 
  ShieldCheck, 
  HelpCircle, 
  Network, 
  Flame, 
  Maximize2, 
  Search, 
  Settings, 
  RefreshCw, 
  Zap, 
  Instagram, 
  Heart, 
  Brain, 
  CloudRain, 
  Share2, 
  Download, 
  Copy, 
  Check, 
  Award, 
  Star,
  Eye,
  CheckCircle2,
  Bookmark
} from 'lucide-react';

interface LinguisticNetworkProps {
  words: WordRecord[];
  onSelectWord: (word: WordRecord) => void;
}

interface Node {
  id: string;
  label: string;
  theme: string;
  record: WordRecord;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  targetR: number;
  pulse: number;
}

interface Link {
  source: string;
  target: string;
  color: string;
  strength: number;
}

export default function LinguisticNetwork({ words, onSelectWord }: LinguisticNetworkProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Active Category State
  // 'all' | 'word_of_the_day' | 'exquisite' | 'romantic' | 'philosophical' | 'sad'
  const [activeCategory, setActiveCategory] = useState<'all' | 'word_of_the_day' | 'exquisite' | 'romantic' | 'philosophical' | 'sad'>('all');

  // Interaction State
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [linkMode, setLinkMode] = useState<'theme' | 'letters' | 'none'>('theme');
  const [constellationTheme, setConstellationTheme] = useState<'cosmic' | 'emerald' | 'gold'>('cosmic');
  const [repulsionForce, setRepulsionForce] = useState<number>(35);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  
  // Share & Clipboard States
  const [isCopied, setIsCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareConfigType, setShareConfigType] = useState<'story' | 'post' | 'landscape'>('story');
  const [customShareColor, setCustomShareColor] = useState<string>('#0b0821');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Internal physics models
  const nodesRef = useRef<Node[]>([]);
  const linksRef = useRef<Link[]>([]);
  const animationFrameId = useRef<number | null>(null);
  const mouseRef = useRef<{ x: number; y: number; isDown: boolean; draggedNode: Node | null }>({
    x: 0,
    y: 0,
    isDown: false,
    draggedNode: null
  });

  // Get matching glow colors for themes
  const getThemeColor = (themeStr: string) => {
    switch (themeStr) {
      case 'ruby': return { main: '#e11d48', glow: 'rgba(225, 29, 72, 0.18)', bg: 'from-rose-50 to-rose-100/30', text: 'text-rose-700' };
      case 'sapphire': return { main: '#2563eb', glow: 'rgba(37, 99, 235, 0.18)', bg: 'from-blue-50 to-blue-100/30', text: 'text-blue-700' };
      case 'emerald': return { main: '#059669', glow: 'rgba(5, 150, 105, 0.18)', bg: 'from-emerald-50 to-emerald-100/30', text: 'text-emerald-700' };
      case 'onyx': return { main: '#525252', glow: 'rgba(82, 82, 82, 0.18)', bg: 'from-neutral-50 to-neutral-100/30', text: 'text-neutral-700' };
      case 'gold':
      default: return { main: '#c2410c', glow: 'rgba(194, 65, 12, 0.18)', bg: 'from-amber-50 to-amber-100/35', text: 'text-amber-800' };
    }
  };

  // Helper to obtain contrasting visible glow decoration colors for each dark preset
  const getEnvelopeAccentColor = (bgColor: string) => {
    switch (bgColor) {
      case '#0b0821': // Cosmic Dark
        return '#8b5cf6'; // Electric violet
      case '#012314': // Royal Green
        return '#10b981'; // Emerald Green
      case '#290a1b': // Velvet Pink
        return '#f43f5e'; // Velvet Rose
      case '#141414': // Matte Black
        return '#fbbf24'; // Amber Gold
      default:
        return '#ebd197'; // Fallback gold
    }
  };

  // Helper to get the darkest gradient blend color depending on selected background theme
  const getDarkestBlendColor = (bgColor: string) => {
    switch (bgColor) {
      case '#0b0821': // Cosmic Dark
        return '#04030d';
      case '#012314': // Royal Green
        return '#000603';
      case '#290a1b': // Velvet Pink
        return '#0b0006';
      case '#141414': // Matte Black
        return '#050505';
      default:
        return '#05030a';
    }
  };

  // Helper to obtain contrasting wax seal base colors for physical wax stamps
  const getWaxSealColor = (bgColor: string) => {
    switch (bgColor) {
      case '#0b0821': // Cosmic Dark
        return '#5b21b6'; // Velvet purple wax
      case '#012314': // Royal Green
        return '#047857'; // Deep emerald forest wax
      case '#290a1b': // Velvet Pink
        return '#be185d'; // Royal rosewine wax
      case '#141414': // Matte Black
        return '#dc2626'; // Historical authentic vermilion wax
      default:
        return '#b45309'; // Terracotta clay
    }
  };

  // Compute "Word of the Day" deterministically based on date (changes once every calendar day)
  const getWordOfTheDay = (): WordRecord | null => {
    if (words.length === 0) return null;
    const today = new Date();
    const hash = today.getFullYear() * 365 + (today.getMonth() + 1) * 31 + today.getDate();
    const index = hash % words.length;
    return words[index];
  };

  // Categorize or Filter words dataset based on dynamic user presets
  const getFilteredWords = (): WordRecord[] => {
    if (words.length === 0) return [];
    
    switch (activeCategory) {
      case 'word_of_the_day': {
        const wotd = getWordOfTheDay();
        return wotd ? [wotd] : words;
      }
      case 'exquisite': {
        // High luxury themes: gold, ruby and sapphire
        return words.filter(w => w.theme === 'gold' || w.theme === 'ruby' || w.theme === 'sapphire');
      }
      case 'romantic': {
        // Words with ruby theme, or emotional keywords
        const romanceKeywords = ['حب', 'عشق', 'قلب', 'شوق', 'شغف', 'وجد', 'حنين', 'غرام', 'دفء', 'محب', 'لهف', 'دمع', 'ود', 'روح'];
        return words.filter(w => 
          w.theme === 'ruby' || 
          romanceKeywords.some(kw => w.word.includes(kw) || w.meaning.includes(kw) || w.quote.includes(kw))
        );
      }
      case 'philosophical': {
        // Words with deep thought or cosmic, onyx, sapphire themes
        const philosophyKeywords = ['وجود', 'عقل', 'فكر', 'روح', 'ذات', 'سر', 'غيب', 'أزل', 'زمان', 'فلسف', 'أبد', 'يقين', 'علم', 'عالم', 'خلق'];
        return words.filter(w => 
          w.theme === 'sapphire' || 
          w.theme === 'onyx' ||
          philosophyKeywords.some(kw => w.word.includes(kw) || w.meaning.includes(kw) || w.quote.includes(kw))
        );
      }
      case 'sad': {
        // Nostalgic, sorrowful words, onyx themes
        const sorrowKeywords = ['حزن', 'ألم', 'شجن', 'فراق', 'دمع', 'مغيب', 'شج', 'وحشة', 'أسى', 'ليل', 'غربة', 'رحيل', 'فقد', 'نوى', 'وجد'];
        return words.filter(w => 
          w.theme === 'onyx' || 
          sorrowKeywords.some(kw => w.word.includes(kw) || w.meaning.includes(kw) || w.quote.includes(kw))
        );
      }
      case 'all':
      default:
        return words;
    }
  };

  const filteredWordsDataset = getFilteredWords();

  // Convert filtered dataset to physics nodes
  useEffect(() => {
    if (words.length === 0) return;

    const width = canvasRef.current?.width || 600;
    const height = canvasRef.current?.height || 400;

    // Build or update nodes based on active filtered dataset
    const freshNodes: Node[] = filteredWordsDataset.map((w, idx) => {
      const existing = nodesRef.current.find(n => n.id === w.id);
      if (existing) {
        existing.record = w;
        existing.label = w.word;
        existing.theme = w.theme;
        return existing;
      }

      // Golden Spiral placement
      const angle = idx * 0.9 + Math.PI;
      const radius = 30 + idx * 12;
      const cx = width / 2;
      const cy = height / 2;

      return {
        id: w.id,
        label: w.word,
        theme: w.theme,
        record: w,
        x: cx + Math.cos(angle) * Math.min(cx - 50, radius),
        y: cy + Math.sin(angle) * Math.min(cy - 50, radius),
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: 10,
        targetR: 10,
        pulse: Math.random() * Math.PI
      };
    });

    nodesRef.current = freshNodes;
    recalculateLinks(freshNodes, linkMode);

    // Automatically select the first node or Word of the Day node when category changes to keep screen clean
    if (freshNodes.length > 0) {
      if (activeCategory === 'word_of_the_day') {
        setSelectedNode(freshNodes[0]);
      } else {
        const found = freshNodes.find(n => n.id === selectedNode?.id);
        if (!found) {
          setSelectedNode(freshNodes[0]);
        }
      }
    } else {
      setSelectedNode(null);
    }
  }, [words, activeCategory, linkMode]);

  // Recalculate node link wires based on logic
  const recalculateLinks = (currentNodes: Node[], mode: 'theme' | 'letters' | 'none') => {
    if (mode === 'none') {
      linksRef.current = [];
      return;
    }

    const calculatedLinks: Link[] = [];

    for (let i = 0; i < currentNodes.length; i++) {
      for (let j = i + 1; j < currentNodes.length; j++) {
        const n1 = currentNodes[i];
        const n2 = currentNodes[j];
        let bind = false;
        let color = 'rgba(255, 255, 255, 0.1)';
        let strength = 0.5;

        if (mode === 'theme') {
          if (n1.theme === n2.theme) {
            bind = true;
            color = getThemeColor(n1.theme).glow;
            strength = 0.8;
          }
        } else if (mode === 'letters') {
          const letters1 = new Set(n1.label.replace(/[ًٌٍَُِّْـ\s]/g, '').split(''));
          const letters2 = new Set(n2.label.replace(/[ًٌٍَُِّْـ\s]/g, '').split(''));
          let commonCount = 0;
          letters1.forEach(char => {
            if (letters2.has(char)) commonCount++;
          });

          if (commonCount >= 1) {
            bind = true;
            color = 'rgba(217, 119, 6, 0.25)';
            strength = 0.4 + (commonCount * 0.15);
          }
        }

        if (bind) {
          calculatedLinks.push({
            source: n1.id,
            target: n2.id,
            color,
            strength
          });
        }
      }
    }

    linksRef.current = calculatedLinks;
  };

  // Audio resonance cue
  const playPerfectHarmonic = (word: WordRecord) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      let baseFreq = 261.63; // C4 default
      if (word.theme === 'ruby') baseFreq = 349.23; // F4 Rose
      else if (word.theme === 'sapphire') baseFreq = 440.00; // A4 Blue
      else if (word.theme === 'emerald') baseFreq = 392.00; // G4 Green
      else if (word.theme === 'onyx') baseFreq = 220.00; // A3 Dark
      else if (word.theme === 'gold') baseFreq = 311.13; // Eb4 Golden

      const osc = ctx.createOscillator();
      const overtone = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);

      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(baseFreq * 1.5, ctx.currentTime);

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc.connect(gainNode);
      overtone.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      overtone.start();
      osc.stop(ctx.currentTime + 1.3);
      overtone.stop(ctx.currentTime + 1.3);

      setIsSynthesizing(true);
      setTimeout(() => setIsSynthesizing(false), 800);
    } catch (e) {
      // Ignored browser context block
    }
  };

  // Run Canvas Simulation loop
  useEffect(() => {
    let active = true;

    const handleCanvasTick = () => {
      if (!active) return;

      const canvas = canvasRef.current;
      if (!canvas) {
        animationFrameId.current = requestAnimationFrame(handleCanvasTick);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animationFrameId.current = requestAnimationFrame(handleCanvasTick);
        return;
      }

      const w = canvas.width;
      const h = canvas.height;

      // Fill background (Light mode/bright sky matching brand style)
      if (constellationTheme === 'cosmic') {
        ctx.fillStyle = '#f5f7fa'; // light indigo sky
      } else if (constellationTheme === 'emerald') {
        ctx.fillStyle = '#f0fbf6'; // light sage sky
      } else {
        ctx.fillStyle = '#fdfcf7'; // light gold/sand sky
      }
      ctx.fillRect(0, 0, w, h);

      // Starry background noise (for a beautiful, light twinkling particles layout)
      ctx.fillStyle = 'rgba(120, 89, 37, 0.08)';
      for (let i = 0; i < 45; i++) {
        const starX = (Math.sin(i * 187.3) * 0.5 + 0.5) * w;
        const starY = (Math.cos(i * 93.4) * 0.5 + 0.5) * h;
        const starR = (Math.sin(starX * starY) * 0.5 + 0.5) * 1.5;
        ctx.beginPath();
        ctx.arc(starX, starY, starR, 0, Math.PI * 2);
        ctx.fill();
      }

      const nodes = nodesRef.current;
      const links = linksRef.current;

      const cx = w / 2;
      const cy = h / 2;
      const centerAttraction = 0.003;
      const forceRepel = repulsionForce * 0.12;

      // Update Node physics
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        if (mouseRef.current.draggedNode && mouseRef.current.draggedNode.id === n.id) {
          n.x += (mouseRef.current.x - n.x) * 0.3;
          n.y += (mouseRef.current.y - n.y) * 0.3;
          n.vx = 0;
          n.vy = 0;
          continue;
        }

        n.vx += (cx - n.x) * centerAttraction;
        n.vy += (cy - n.y) * centerAttraction;

        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          const other = nodes[j];
          const dx = n.x - other.x;
          const dy = n.y - other.y;
          const distSq = dx * dx + dy * dy || 1;
          const dist = Math.sqrt(distSq);

          if (dist < 160) {
            const force = (160 - dist) / 160 * forceRepel;
            n.vx += (dx / dist) * force;
            n.vy += (dy / dist) * force;
          }
        }

        n.x += n.vx;
        n.y += n.vy;
        n.vx *= 0.86;
        n.vy *= 0.86;

        n.x = Math.max(25, Math.min(w - 25, n.x));
        n.y = Math.max(25, Math.min(h - 25, n.y));
        n.pulse += 0.035;
      }

      // Draw active Link strings
      for (const link of links) {
        const sNode = nodes.find(n => n.id === link.source);
        const tNode = nodes.find(n => n.id === link.target);

        if (sNode && tNode) {
          const isHighlighted = 
            (selectedNode && (selectedNode.id === sNode.id || selectedNode.id === tNode.id)) ||
            (hoveredNode && (hoveredNode.id === sNode.id || hoveredNode.id === tNode.id));

          ctx.strokeStyle = link.color;
          ctx.lineWidth = isHighlighted ? 2.0 : 0.6;
          
          if (isHighlighted) {
            ctx.strokeStyle = selectedNode && (selectedNode.id === sNode.id || selectedNode.id === tNode.id) 
              ? getThemeColor(selectedNode.theme).main 
              : 'rgba(234, 179, 8, 0.7)';
          }

          ctx.beginPath();
          ctx.moveTo(sNode.x, sNode.y);
          ctx.lineTo(tNode.x, tNode.y);
          ctx.stroke();
        }
      }

      // Draw Node points + beautiful Arabic scripture labels
      for (const n of nodes) {
        const isSelected = selectedNode?.id === n.id;
        const isHovered = hoveredNode?.id === n.id;
        const searchMatches = searchTerm && n.label.includes(searchTerm);

        const colors = getThemeColor(n.theme);
        
        let finalR = n.r;
        if (isSelected) {
          finalR = 16;
        } else if (isHovered || searchMatches) {
          finalR = 13;
        } else {
          finalR = 7.5;
        }

        n.r += (finalR - n.r) * 0.18;

        if (isSelected || isHovered || searchMatches) {
          ctx.fillStyle = colors.glow;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r + 6 + Math.sin(n.pulse) * 4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = colors.main;
        if (isSelected) {
          ctx.strokeStyle = '#271b05';
          ctx.lineWidth = 2.5;
        } else {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isSelected 
          ? '#9c7717' 
          : (isHovered || searchMatches) ? '#0f172a' : '#57534e';

        ctx.font = isSelected 
          ? 'bold 13px sans-serif' 
          : '11px sans-serif';
        
        ctx.textAlign = 'center';
        ctx.fillText(n.label, n.x, n.y - n.r - 7);
      }

      animationFrameId.current = requestAnimationFrame(handleCanvasTick);
    };

    animationFrameId.current = requestAnimationFrame(handleCanvasTick);

    return () => {
      active = false;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [constellationTheme, repulsionForce, selectedNode, hoveredNode, searchTerm, activeCategory]);

  // Handle canvas sizing on container ref changes
  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      const parent = containerRef.current;
      if (canvas && parent) {
        canvas.width = parent.clientWidth;
        canvas.height = 360;
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    mouseRef.current.x = mx;
    mouseRef.current.y = my;
    mouseRef.current.isDown = true;

    let foundNode: Node | null = null;
    const nodes = nodesRef.current;
    for (const n of nodes) {
      const dx = n.x - mx;
      const dy = n.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < n.r + 10) {
        foundNode = n;
        break;
      }
    }

    if (foundNode) {
      mouseRef.current.draggedNode = foundNode;
      setSelectedNode(foundNode);
      playPerfectHarmonic(foundNode.record);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    mouseRef.current.x = mx;
    mouseRef.current.y = my;

    if (!mouseRef.current.draggedNode) {
      let hovered: Node | null = null;
      const nodes = nodesRef.current;
      for (const n of nodes) {
        const dx = n.x - mx;
        const dy = n.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < n.r + 8) {
          hovered = n;
          break;
        }
      }
      setHoveredNode(hovered);
    }
  };

  const handleCanvasMouseUp = () => {
    mouseRef.current.isDown = false;
    mouseRef.current.draggedNode = null;
  };

  // Select random node safely
  const drawRandomFateNode = () => {
    const nodes = nodesRef.current;
    if (nodes.length === 0) return;
    const randomIdx = Math.floor(Math.random() * nodes.length);
    const chosen = nodes[randomIdx];
    setSelectedNode(chosen);
    playPerfectHarmonic(chosen.record);

    chosen.vx = (Math.random() - 0.5) * 18;
    chosen.vy = (Math.random() - 0.5) * 18;
  };

  // Copy customized aesthetic Instagram bio text to clipboard
  const handleCopyInstagramBio = (word: WordRecord) => {
    const textToCopy = `✨ « ${word.word} » ✨\n\n📌 المعنى في ديوان كِلْمَتِي:\n${word.meaning}\n\n📜 شاهد أدبي:\n"${word.quote}"\n\n🔒 حيازة أدبية موثقة ومحمية بميثاق ملكية الكلمات باسم:\n👤 [ ${word.owner} ]\n\n🔗 احجز كلمتك الخاصة ووثّقها للأبد في ديوان كلمتي:\nhttps://kilmati.com`;
    
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Generate highly polished high-res sharing templates from standard Canvas 2D
  const downloadInstagramGraphic = (word: WordRecord) => {
    setIsGeneratingImage(true);
    
    const isStory = shareConfigType === 'story';
    const isLandscape = shareConfigType === 'landscape';
    const isSquare = shareConfigType === 'post';
    
    // Create an offscreen custom canvas with professional aspect ratio
    const shareCanvas = document.createElement('canvas');
    shareCanvas.width = isLandscape ? 1200 : 1080;
    shareCanvas.height = isStory ? 1920 : (isLandscape ? 675 : 1080);
    
    const sctx = shareCanvas.getContext('2d');
    if (!sctx) {
      setIsGeneratingImage(false);
      return;
    }

    const accentColor = getEnvelopeAccentColor(customShareColor);
    const darkestBg = getDarkestBlendColor(customShareColor);
    const waxColor = getWaxSealColor(customShareColor);
    
    // 1. Render Background Gradient
    const gradient = sctx.createRadialGradient(
      shareCanvas.width / 2, 
      shareCanvas.height / 2, 
      100, 
      shareCanvas.width / 2, 
      shareCanvas.height / 2, 
      Math.max(shareCanvas.width, shareCanvas.height) * 0.65
    );
    gradient.addColorStop(0, customShareColor);
    gradient.addColorStop(0.5, `${customShareColor}ee`);
    gradient.addColorStop(1, darkestBg);
    sctx.fillStyle = gradient;
    sctx.fillRect(0, 0, shareCanvas.width, shareCanvas.height);

    // Decorative Orbit Centers & Parameters
    let centerX = shareCanvas.width / 2;
    let centerY = isStory ? 710 : (isLandscape ? 337 : 410);

    if (isLandscape) {
      centerX = 350; // Place orbits in left column
    }
    
    // Large background glow centered around orbits
    const radialGlow = sctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, isLandscape ? 300 : 480);
    radialGlow.addColorStop(0, `${accentColor}3c`);
    radialGlow.addColorStop(1, 'transparent');
    sctx.fillStyle = radialGlow;
    sctx.beginPath();
    sctx.arc(centerX, centerY, isLandscape ? 320 : 450, 0, Math.PI * 2);
    sctx.fill();

    // Concentric Orbit Circle 1 (Dashed / Patterned effect)
    sctx.strokeStyle = `${accentColor}70`;
    sctx.lineWidth = isLandscape ? 3 : 4;
    sctx.setLineDash([18, 12]);
    sctx.beginPath();
    sctx.arc(centerX, centerY, isLandscape ? 210 : 320, 0, Math.PI * 2);
    sctx.stroke();

    // Concentric Orbit Circle 2 (Golden Orbit)
    sctx.strokeStyle = 'rgba(235, 209, 151, 0.35)'; // delicate gold touch
    sctx.lineWidth = 1.5;
    sctx.setLineDash([]); // Reset dash pattern
    sctx.beginPath();
    sctx.arc(centerX, centerY, isLandscape ? 150 : 240, 0, Math.PI * 2);
    sctx.stroke();

    // Concentric Orbit Circle 3 (Inner glowing core)
    sctx.fillStyle = `${accentColor}10`;
    sctx.beginPath();
    sctx.arc(centerX, centerY, isLandscape ? 90 : 150, 0, Math.PI * 2);
    sctx.fill();

    // Starry sparkles dust background (Symmetric distribution)
    sctx.setLineDash([]); // Reset dash pattern
    sctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
    for (let i = 0; i < (isLandscape ? 80 : 160); i++) {
      const sx = (Math.sin(i * 35.7) * 0.5 + 0.5) * shareCanvas.width;
      const sy = (Math.cos(i * 79.4) * 0.5 + 0.5) * shareCanvas.height;
      sctx.beginPath();
      sctx.arc(sx, sy, Math.random() * 1.8 + 0.6, 0, Math.PI * 2);
      sctx.fill();
    }

    // 2. Draw Premium Border frames
    const borderOffset = 40;
    const borderW = shareCanvas.width - borderOffset * 2;
    const borderH = shareCanvas.height - borderOffset * 2;
    
    // Outer golden frame
    sctx.strokeStyle = 'rgba(196, 154, 76, 0.38)';
    sctx.lineWidth = 4;
    sctx.strokeRect(borderOffset, borderOffset, borderW, borderH);

    // Inner hairline frame
    sctx.strokeStyle = 'rgba(196, 154, 76, 0.14)';
    sctx.lineWidth = 1.5;
    sctx.strokeRect(borderOffset + 15, borderOffset + 15, borderW - 30, borderH - 30);

    // Ornament corner dots
    const corners = [
      { x: borderOffset + 15, y: borderOffset + 15 },
      { x: borderOffset + borderW - 15, y: borderOffset + 15 },
      { x: borderOffset + 15, y: borderOffset + borderH - 15 },
      { x: borderOffset + borderW - 15, y: borderOffset + borderH - 15 }
    ];
    sctx.fillStyle = '#ebd197';
    for (const crn of corners) {
      sctx.beginPath();
      sctx.arc(crn.x, crn.y, 8, 0, Math.PI * 2);
      sctx.fill();
    }

    // Dynamic Wrapping Helper
    const wrapArabicLines = (text: string, maxWidth: number, fontFace: string): string[] => {
      sctx.font = fontFace;
      const wordsArr = text.split(' ');
      const lines: string[] = [];
      let currentLine = '';

      for (const w of wordsArr) {
        const testLine = currentLine ? `${currentLine} ${w}` : w;
        if (sctx.measureText(testLine).width > maxWidth) {
          lines.push(currentLine);
          currentLine = w;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }
      return lines;
    };

    // Realistic 3D simulated handmade wax seal drawing function
    const drawWaxSealOnCanvas = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, sealHexColor: string) => {
      ctx.save();
      
      // Shadow for real-life depth
      ctx.shadowColor = 'rgba(0, 0, 0, 0.48)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 5;
      
      // Outer organic squeezed wax contour (irregular shape using trig waves)
      ctx.fillStyle = sealHexColor;
      ctx.beginPath();
      for (let angle = 0; angle <= Math.PI * 2 + 0.1; angle += 0.05) {
        // High variation wave equations to simulate random hand pressure
        const wave = Math.sin(angle * 13) * 3 + Math.cos(angle * 5) * 2;
        const currentRadius = r + wave;
        const x = cx + Math.cos(angle) * currentRadius;
        const y = cy + Math.sin(angle) * currentRadius;
        if (angle === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      
      // Reset shadow for internal detail layers
      ctx.shadowColor = 'transparent';
      
      // 3D Inner pressed indentation recess shade
      const rimGlow = ctx.createRadialGradient(cx, cy, r * 0.6, cx, cy, r);
      rimGlow.addColorStop(0, 'rgba(0, 0, 0, 0.2)');
      rimGlow.addColorStop(0.8, 'rgba(0, 0, 0, 0.05)');
      rimGlow.addColorStop(1, 'rgba(255, 255, 255, 0.15)');
      ctx.fillStyle = rimGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, r - 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Highlight & shadows to define the pressed border rim (beveling)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r - 6, Math.PI * 0.9, Math.PI * 1.9); // light from top-left
      ctx.stroke();
      
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r - 6, Math.PI * 1.9, Math.PI * 0.9); // shadow at bottom-right
      ctx.stroke();

      // Additional concentric security ring
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, r - 13, 0, Math.PI * 2);
      ctx.stroke();
      
      // Inner stamp imprint symbol (Wax engraving)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.textAlign = 'center';
      
      // Elegant imprint typography
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('مَوْثُوق', cx, cy - 8);
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('KILMATI', cx, cy + 9);
      
      ctx.restore();
    };

    // Rendering layout systems by Aspect Ratio
    if (isLandscape) {
      // -------------------------------------------------------------
      // LANDSCAPE 16:9 SPLIT LAYOUT (Perfect for X/Twitter & TikTok widescreen feeds)
      // -------------------------------------------------------------
      
      // A. Drawing left column contents (centered inside orbits)
      // Core word (The Star)
      sctx.textAlign = 'center';
      sctx.fillStyle = '#ffffff';
      sctx.font = 'bold 88px sans-serif';
      sctx.fillText(`« ${word.word} »`, centerX, centerY - 20);

      // Owner tag under it
      sctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      sctx.font = '19px sans-serif';
      sctx.fillText('حيازة أدبية موثقة ومحمية بموجب ميثاق الملكية الأبدية', centerX, centerY + 55);
      
      sctx.fillStyle = '#ebd197';
      sctx.font = 'bold 26px sans-serif';
      sctx.fillText(`المالك الأدبي: ${word.owner}`, centerX, centerY + 105);

      // B. Fine vertical dotted golden divider axis line
      sctx.strokeStyle = 'rgba(196, 154, 76, 0.22)';
      sctx.lineWidth = 2;
      sctx.setLineDash([6, 10]);
      sctx.beginPath();
      sctx.moveTo(630, 90);
      sctx.lineTo(630, 585);
      sctx.stroke();
      sctx.setLineDash([]); // Reset

      // C. Drawing right column contents
      const rightX = 680;
      const rightW = 440;

      // Top branding logo
      sctx.textAlign = 'right';
      sctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      sctx.font = '20px sans-serif';
      sctx.fillText('صَكُّ المِلْكِيَّةِ الحَصْرِيُّ ✦ ديوان كِلْمَتِي', rightX + rightW, 105);

      sctx.fillStyle = '#ebd197';
      sctx.font = 'bold 30px sans-serif';
      sctx.fillText('K I L M A T I . C O M', rightX + rightW, 150);

      // Detail frosted box
      const boxY = 185;
      const boxH = 210;
      sctx.fillStyle = 'rgba(10, 8, 25, 0.85)';
      sctx.strokeStyle = 'rgba(196, 154, 76, 0.26)';
      sctx.lineWidth = 2;
      sctx.beginPath();
      sctx.roundRect(rightX, boxY, rightW, boxH, 18);
      sctx.fill();
      sctx.stroke();

      // Frosted Box Content
      sctx.fillStyle = '#ebd197';
      sctx.font = 'bold 21px sans-serif';
      sctx.fillText('الدرجة اللغوية ودلالة المعنى السّمائي:', rightX + rightW - 24, boxY + 45);

      // Meaning Arabic wrap
      const wrappedMeaningLines = wrapArabicLines(word.meaning, rightW - 48, '19px sans-serif');
      sctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
      sctx.font = '19px sans-serif';
      let currentMeaningY = boxY + 90;
      for (let j = 0; j < Math.min(wrappedMeaningLines.length, 3); j++) {
        sctx.fillText(wrappedMeaningLines[j], rightX + rightW - 24, currentMeaningY);
        currentMeaningY += 36;
      }

      // Word category
      sctx.fillStyle = '#f59e0b';
      sctx.font = 'bold 16px sans-serif';
      sctx.fillText(`الفئة الفنيّة: ${word.theme.toUpperCase()}`, rightX + rightW - 24, boxY + boxH - 24);

      // Poetic Witness (Quote)
      if (word.quote) {
        sctx.fillStyle = '#ebd59c';
        const wrappedQuoteLines = wrapArabicLines(`"${word.quote}"`, rightW - 40, 'italic 23px sans-serif');
        let currentQuoteY = 445;
        for (let k = 0; k < Math.min(wrappedQuoteLines.length, 2); k++) {
          sctx.fillText(wrappedQuoteLines[k], rightX + rightW - 20, currentQuoteY);
          currentQuoteY += 36;
        }
      }

      // Royal signature stamp Wax seal in bottom-right corner of the landscape layout
      const sealX = rightX + rightW - 55;
      const sealY = 535;
      drawWaxSealOnCanvas(sctx, sealX, sealY, 52, waxColor);

      // Bottom footer platform url
      sctx.textAlign = 'left';
      sctx.fillStyle = '#ebd197';
      sctx.font = 'bold 14px sans-serif';
      sctx.fillText('ديوان كلمتي لامتلاك وحيازة الكلمات الفخمة والأنيقة', rightX + 15, 525);
      sctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      sctx.font = '12px sans-serif';
      sctx.fillText('قم بحجز صك كلمتك الفريد عبر kilmati.com للأبد', rightX + 15, 550);

    } else {
      // -------------------------------------------------------------
      // CENTERED LAYOUT (Perfect for Story Aspect 9:16 & Feed Square Aspect 1:1)
      // -------------------------------------------------------------
      
      // A. Write header titles (centered)
      sctx.textAlign = 'center';
      sctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      sctx.font = '24px sans-serif';
      const headerTitleY = isStory ? 140 : 90;
      sctx.fillText('صَكُّ المِلْكِيَّةِ الحَصْرِيُّ ✦ ديوان كِلْمَتِي', 540, headerTitleY);

      sctx.fillStyle = '#ebd197';
      sctx.font = 'bold 36px sans-serif';
      const headerUrlY = isStory ? 195 : 140;
      sctx.fillText('K I L M A T I . C O M', 540, headerUrlY);

      // Divider line
      sctx.strokeStyle = 'rgba(196, 154, 76, 0.22)';
      sctx.lineWidth = 2;
      sctx.beginPath();
      const dividerY = isStory ? 235 : 175;
      sctx.moveTo(380, dividerY);
      sctx.lineTo(700, dividerY);
      sctx.stroke();

      // B. Core Word centered inside circular orbits
      const wordY = isStory ? 665 : 385;
      sctx.fillStyle = '#ffffff';
      sctx.font = 'bold 105px sans-serif';
      sctx.fillText(`« ${word.word} »`, 540, wordY);

      // Owner tag
      sctx.fillStyle = 'rgba(255, 255, 255, 0.52)';
      sctx.font = '21px sans-serif';
      sctx.fillText('حيازة أدبية موثقة ومحمية بموجب ميثاق ملكية الكلمات للأبد', 540, wordY + 80);
      
      sctx.fillStyle = '#f59e0b';
      sctx.font = 'bold 34px sans-serif';
      sctx.fillText(`الحائز والمالك الأدبي: ${word.owner}`, 540, wordY + 135);

      // C. Meaning details frosted box
      const boxY = isStory ? 1010 : 545;
      const boxH = isStory ? 340 : 225;
      const boxW = 820;
      const boxX = 130;
      
      sctx.fillStyle = 'rgba(10, 8, 25, 0.85)';
      sctx.strokeStyle = 'rgba(196, 154, 76, 0.28)';
      sctx.lineWidth = 2.5;
      sctx.beginPath();
      sctx.roundRect(boxX, boxY, boxW, boxH, 20);
      sctx.fill();
      sctx.stroke();

      sctx.fillStyle = '#ebd197';
      sctx.font = 'bold 26px sans-serif';
      sctx.textAlign = 'right';
      sctx.fillText('الدرجة اللغوية ودلالة المعنى السّمائي:', boxX + boxW - 50, boxY + 52);

      // Description lines wrapping
      const wrappedMeaningLines = wrapArabicLines(word.meaning, boxW - 100, '23px sans-serif');
      sctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
      sctx.font = '23px sans-serif';
      let currentMeaningY = boxY + 105;
      for (let j = 0; j < Math.min(wrappedMeaningLines.length, 3); j++) {
        sctx.fillText(wrappedMeaningLines[j], boxX + boxW - 50, currentMeaningY);
        currentMeaningY += 44;
      }

      // Word category
      sctx.fillStyle = '#f59e0b';
      sctx.font = 'bold 20px sans-serif';
      sctx.fillText(`الفئة الفنيّة: ${word.theme.toUpperCase()}`, boxX + boxW - 50, boxY + boxH - 32);

      // Poetic Witness (Quote)
      sctx.textAlign = 'center';
      if (word.quote) {
        const quoteY = isStory ? 1465 : 855;
        sctx.fillStyle = '#ebd59c';
        
        const wrappedQuoteLines = wrapArabicLines(`"${word.quote}"`, 800, 'italic 30px sans-serif');
        let currentQuoteY = quoteY;
        for (let k = 0; k < Math.min(wrappedQuoteLines.length, 2); k++) {
          sctx.fillText(wrappedQuoteLines[k], 540, currentQuoteY);
          currentQuoteY += 48;
        }
      }

      // Realistic 3D simulated handmade wax stamp centered at bottom
      const stampY = isStory ? 1665 : 935;
      drawWaxSealOnCanvas(sctx, 540, stampY, 60, waxColor);

      // Bottom branding statements
      sctx.fillStyle = '#ebd197';
      sctx.font = 'bold 22px sans-serif';
      sctx.fillText('المنصة الأولى عالمياً لامتلاك وحيازة الكلمات الأدبية الفخمة', 540, shareCanvas.height - 110);
      sctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      sctx.font = '18px sans-serif';
      sctx.fillText('قم بتوثيق كلمتك وحيازة صكك الأدبي عبر kilmati.com', 540, shareCanvas.height - 70);
    }

    // Process Download Action
    setTimeout(() => {
      try {
        const dataUrl = shareCanvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = dataUrl;
        downloadLink.download = `Kilmati-Certificate-${word.word}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      } catch (err) {
        console.error('Failed to export canvas image', err);
      } finally {
        setIsGeneratingImage(false);
      }
    }, 250);
  };

  const activeColorSet = selectedNode ? getThemeColor(selectedNode.theme) : { main: '#ca8a04', bg: 'from-amber-50 to-amber-100/10', text: 'text-amber-850' };
  const wotdWord = getWordOfTheDay();

  return (
    <div id="interactive-linguistic-atlas" className="bg-[#fcfbf9] border border-neutral-300 rounded-3xl p-6 md:p-8 space-y-6 text-right relative overflow-hidden shadow-xs">
      
      {/* Background radial glow */}
      <div 
        className="absolute inset-0 opacity-[0.03] transition-all duration-1000 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${activeColorSet.main} 0%, transparent 75%)`
        }}
      />

      {/* Headline Header Column */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between border-b border-neutral-200 pb-5 relative z-10 gap-4">
        
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-black text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-200 tracking-wide">
            <Network className="w-3.5 h-3.5 text-amber-700 animate-spin" style={{ animationDuration: '8s' }} />
            <span>أطلس الحروف الأبدي ✦ خريطة ذكية سحرية</span>
          </div>
          
          <h2 className="text-xl md:text-3.5xl font-black font-serif-arabic text-neutral-900 tracking-tight">
            المحاكاة النجمية التفاعلية للكلمات 🌌
          </h2>
          
          <p className="text-xs text-neutral-600 leading-relaxed font-sans max-w-3xl">
            نظام محاكاة ذكي يربط الكلمات بمشاعرها وحروفها. <span className="text-amber-800 font-bold">اضغط طويلاً واسحب النجوم</span> لتحسّ برنين السيمياء الصوتي الفخم، واستكشف الخواص التفاعلية التي تمّيز كل ممتلك!
          </p>
        </div>

        {/* Buttons Controls inside Header */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          
          {/* Quick random generator */}
          <button
            type="button"
            onClick={drawRandomFateNode}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-850 text-xs font-black rounded-xl cursor-pointer transition transform active:scale-95 border border-neutral-300 shadow-sm select-none"
          >
            <Wand2 className="w-4 h-4 text-amber-700 animate-pulse" />
            <span>القرعة اللفظية الذكية 🔮</span>
          </button>

          {/* Quick active Word of the Day selector */}
          {wotdWord && (
            <button
              type="button"
              onClick={() => {
                const found = nodesRef.current.find(n => n.id === wotdWord.id);
                if (found) {
                  setSelectedNode(found);
                  playPerfectHarmonic(found.record);
                } else {
                  // Fallback: Temporarily set active category to all to show Word of the Day
                  setActiveCategory('word_of_the_day');
                }
              }}
              className="flex items-center gap-1 px-3 py-2 bg-amber-50 text-amber-800 text-xs font-bold rounded-xl border border-amber-200 cursor-pointer hover:bg-amber-100/50 transition"
            >
              <Star className="w-3.5 h-3.5 text-amber-700 fill-amber-500" />
              <span>كلمة اليوم: « {wotdWord.word} »</span>
            </button>
          )}

        </div>

      </div>

      {/* Row of Premium Interactive Filter Ribbons - "ميزات تضرب السوق" */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-neutral-100 rounded-2xl border border-neutral-200 justify-start relative z-10">
        
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
            activeCategory === 'all' 
              ? 'bg-amber-700 text-white font-extrabold shadow-md' 
              : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/50'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>كل النفائس ({words.length})</span>
        </button>

        <button
          onClick={() => setActiveCategory('word_of_the_day')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
            activeCategory === 'word_of_the_day' 
              ? 'bg-amber-500 text-neutral-950 font-extrabold shadow-sm' 
              : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/50'
          }`}
        >
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>⭐ كلمة اليوم</span>
        </button>

        <button
          onClick={() => setActiveCategory('exquisite')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
            activeCategory === 'exquisite' 
              ? 'bg-gradient-to-r from-rose-500 to-amber-600 text-white font-extrabold shadow-md' 
              : 'text-neutral-600 hover:text-white hover:bg-neutral-200/50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>✨ أجمل الكلمات</span>
        </button>

        <button
          onClick={() => setActiveCategory('romantic')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
            activeCategory === 'romantic' 
              ? 'bg-rose-600 text-white font-extrabold shadow-md' 
              : 'text-neutral-600 hover:text-white hover:bg-neutral-200/50'
          }`}
        >
          <Heart className="w-3.5 h-3.5 fill-current" />
          <span>❤️ كلمات وجدانية رومانسية</span>
        </button>

        <button
          onClick={() => setActiveCategory('philosophical')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
            activeCategory === 'philosophical' 
              ? 'bg-blue-600 text-white font-extrabold shadow-md' 
              : 'text-neutral-600 hover:text-white hover:bg-neutral-200/50'
          }`}
        >
          <Brain className="w-3.5 h-3.5" />
          <span>🧠 فلسفية وعميقة</span>
        </button>

        <button
          onClick={() => setActiveCategory('sad')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
            activeCategory === 'sad'  
              ? 'bg-slate-600 text-white font-extrabold shadow-md' 
              : 'text-neutral-600 hover:text-white hover:bg-neutral-200/50'
          }`}
        >
          <CloudRain className="w-3.5 h-3.5" />
          <span>😢 كلمات شجية وحزينة</span>
        </button>

      </div>

      {/* Main Grid Interactive View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Left Area: Core Canvas & Filters block */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          
          <div className="bg-white rounded-2xl p-3 border border-neutral-200 flex flex-wrap gap-4 items-center justify-between text-xs my-0.5 shadow-xs">
            
            <div className="flex items-center gap-4 flex-wrap">
              {/* Force connection modes */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-neutral-500 font-bold">قرابة الربط:</span>
                <select
                  value={linkMode}
                  onChange={(e) => setLinkMode(e.target.value as any)}
                  className="bg-neutral-50 border border-neutral-300 text-neutral-800 rounded px-2 py-1 text-[10.5px] font-bold outline-none cursor-pointer focus:border-amber-500/40"
                >
                  <option value="theme">ترابط المشاعر (Same Theme)</option>
                  <option value="letters">ترابط الحروف (Shared letters)</option>
                  <option value="none">عزلة تامة (Isolated points)</option>
                </select>
              </div>

              {/* Theme color scheme of space */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-neutral-500">فضاء المعرض:</span>
                <div className="flex gap-1">
                  {(['cosmic', 'emerald', 'gold'] as const).map((thm) => (
                    <button
                      key={thm}
                      onClick={() => setConstellationTheme(thm)}
                      className={`text-[9.5px] px-2 py-1 rounded transition border capitalize ${
                        constellationTheme === thm 
                          ? 'bg-amber-100 text-amber-900 border-amber-300' 
                          : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                      }`}
                    >
                      {thm === 'cosmic' ? '🌌 كوني' : thm === 'emerald' ? '🌲 زمردي' : '✨ ذهبي'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gravity space factor */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-neutral-500">قوة التنافر:</span>
                <input
                  type="range"
                  min="5"
                  max="90"
                  value={repulsionForce}
                  onChange={(e) => setRepulsionForce(parseInt(e.target.value))}
                  className="w-18 accent-amber-600 h-1 bg-neutral-200 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Quick Filter Search Input */}
            <div className="relative w-full sm:w-auto">
              <Search className="absolute right-2.5 top-2 w-3.5 h-3.5 text-neutral-400" />
              <input
                type="text"
                placeholder="ابحث عن كلمة في الأطلس الحالي..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-neutral-50 border border-neutral-300 focus:border-amber-500/50 rounded-lg pr-7 pl-2.5 py-1 text-[11px] text-neutral-800 outline-none w-full sm:w-44 text-right placeholder-neutral-400"
              />
            </div>

          </div>

          {/* Interactive Core Canvas Container */}
          <div 
            ref={containerRef} 
            className="w-full bg-[#faf9f6] border border-neutral-200 rounded-2xl relative overflow-hidden cursor-grab min-h-[360px]"
          >
            <canvas
              ref={canvasRef}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              className="block w-full h-full"
            />

            {/* Micro instructional hints */}
            <div className="absolute bottom-2.5 right-3 px-2.5 py-1 bg-white/90 rounded-lg text-[9px] text-neutral-600 pointer-events-none select-none border border-neutral-200 font-sans relative-z-20 shadow-xs">
              🖱️ اسحب النجم طويلاً لتغيير مداره • انقر مزدوجاً لسماع السيمياء الصوتية
            </div>

            <div className="absolute top-2.5 left-3 px-2.5 py-1 bg-white/90 rounded-md text-[9px] text-neutral-600 pointer-events-none select-none border border-neutral-200 font-sans flex items-center gap-1.5 shadow-xs">
              <span className="inline-block w-1.5 h-1.5 bg-amber-550 rounded-full animate-ping" />
              <span>{filteredWordsDataset.length} نقاط ترتبط بالفلتر المحدّد</span>
            </div>
          </div>

        </div>

        {/* Right Area: Selected Word Detailed View with Premium Actions & Download Options */}
        <div className="lg:col-span-4 flex flex-col justify-between">
          
          <div className={`p-5 md:p-6 rounded-2xl bg-[#fafaf7] bg-gradient-to-br ${activeColorSet.bg} border border-[#e2d5b5]/30 space-y-4 flex flex-col h-full justify-between transition-all duration-700 shadow-xs`}>
            
            {selectedNode ? (
              <div className="space-y-4 text-right">
                
                {/* Visual Accent Category label */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-amber-900 tracking-wider bg-amber-100 border border-amber-200 font-black px-2.5 py-1 rounded leading-none uppercase">
                    صنف {selectedNode.record.theme.toUpperCase()}
                  </span>
                  
                  <button
                    type="button"
                    onClick={() => playPerfectHarmonic(selectedNode.record)}
                    className="text-[10.5px] font-bold text-amber-900 hover:text-amber-950 transition flex items-center gap-1 px-2.5 py-1 bg-amber-50 rounded-lg border border-amber-200 active:scale-95 shadow-xs"
                    disabled={isSynthesizing}
                  >
                    <Volume2 className={`w-3.5 h-3.5 text-amber-600 ${isSynthesizing ? 'animate-bounce' : ''}`} />
                    <span>سماع الرنين 🎵</span>
                  </button>
                </div>

                {/* Big Visual typography block */}
                <div className="py-1">
                  <div className="flex items-center justify-between">
                    <span className="block text-3.5xl font-black font-serif-arabic text-neutral-900 select-all leading-relaxed py-1">
                      « {selectedNode.label} »
                    </span>
                    <Bookmark className="w-5 h-5 text-amber-600 shrink-0 ml-1" />
                  </div>
                  
                  <span className="text-[10px] text-neutral-550 block font-sans mt-0.5 leading-relaxed">
                     توثيق ملكية أدبي: {new Date(selectedNode.record.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>

                {/* Meaning detailed box */}
                <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-1 text-right shadow-xs">
                  <span className="text-[10.5px] text-amber-800 block font-black">الدلالة والمعنى السّمائي:</span>
                  <p className="text-[12px] text-neutral-750 leading-relaxed font-sans select-all font-light">
                    {selectedNode.record.meaning}
                  </p>
                </div>

                {/* Witness Quote if present */}
                {selectedNode.record.quote && (
                  <blockquote className="text-[11.5px] italic text-[#614d1a] bg-[#fffdf5] p-3 rounded-lg border-r-4 border-amber-600/60 leading-relaxed font-serif-arabic select-all shadow-xs">
                    "{selectedNode.record.quote}"
                  </blockquote>
                )}

                {/* Owner Tag Card */}
                <div className="p-3 bg-white border border-neutral-200 rounded-xl flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="text-[10px] text-neutral-500 block font-sans">الحائز الحصري للكلمة:</span>
                      <span className="text-xs text-neutral-800 font-bold select-all">
                        {selectedNode.record.owner}
                      </span>
                    </div>
                  </div>
                  
                  {selectedNode.record.isGift && (
                    <span className="text-[9.5px] text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      🎁 إهداء فاخر
                    </span>
                  )}
                </div>

                {/* VIRAL SHARE BUTTON PANEL - "ميزات تضرب السوق" */}
                <div className="pt-2 border-t border-neutral-200 space-y-2">
                  <span className="text-[10px] text-neutral-500 block text-center font-bold">مشاركة متميزة لتلك الكلمة الفخمة:</span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {/* Copy beautiful text directly */}
                    <button
                      type="button"
                      onClick={() => handleCopyInstagramBio(selectedNode.record)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-150 hover:bg-neutral-200 text-neutral-800 rounded-lg text-[10.5px] font-black border border-neutral-350 active:scale-95 transition"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-neutral-600" />}
                      <span>{isCopied ? 'تم نسخ النص!' : 'نسخ النص للنشر 📋'}</span>
                    </button>

                    {/* Instagram Image Story Maker */}
                    <button
                      type="button"
                      onClick={() => setShowShareModal(true)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white rounded-lg text-[10.5px] font-black active:scale-95 transition shadow-sm cursor-pointer"
                    >
                      <Instagram className="w-3.5 h-3.5 text-white" />
                      <span>صورة المشاركة 📸</span>
                    </button>
                  </div>
                </div>

                {/* Primary Certificate Viewer button */}
                <div className="pt-1 select-none">
                  <button
                    onClick={() => onSelectWord(selectedNode.record)}
                    className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 active:scale-95 text-white text-xs font-black py-2.5 rounded-xl transition transform cursor-pointer shadow-md text-center block"
                  >
                    عرض الصك الملكي الفخم 📜
                  </button>
                </div>

              </div>
            ) : (
              <div className="py-24 text-center space-y-3 select-none h-full flex flex-col justify-center items-center">
                <Compass className="w-10 h-10 text-amber-500/20 animate-spin" style={{ animationDuration: '14s' }} />
                <p className="text-xs text-neutral-500 leading-relaxed font-sans max-w-xs">
                  اختر أي نجم من سماء الأطلس أو انقر على الفلاتر التفاعلية في الأعلى لعرض خصائص الكلمة النفيسة وتوليد بطاقة الانستقرام مباشرة!
                </p>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-neutral-200 text-[9.5px] text-neutral-450 font-sans text-center">
              ✦ يخضع الأطلس لنظام الفهرسة والتشفير الميثاقي ديوان كلمتي
            </div>

          </div>

        </div>

      </div>

      {/* DETAILED SOCIAL MEDIA GRAPHIC GENERATOR & DOWNLOAD OVERLAY DIALOG */}
      {showShareModal && selectedNode && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-55 overflow-y-auto">
          
          <div dir="rtl" className="bg-white border border-[#e2d5b5] rounded-3xl max-w-4xl w-full p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 text-right relative shadow-2xl my-4 sm:my-8 max-h-[96vh] sm:max-h-[92vh] flex flex-col overflow-y-auto scrollbar-thin">
            
            {/* Corner escape */}
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 left-4 text-neutral-400 hover:text-neutral-800 bg-neutral-100 hover:bg-neutral-200 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer font-bold text-sm transition z-10"
              type="button"
            >
              ✕
            </button>

            {/* Header Dialog */}
            <div className="border-b border-[#e2d5b5]/30 pb-3 sm:pb-4 shrink-0 pr-8 pl-4">
              <span className="text-[10px] text-amber-900 font-black bg-amber-100 px-2.5 py-1 rounded border border-amber-200 animate-pulse inline-block">
                تخصيص المظهر الشريفي ✦ ميزة تضرب السوق وتجذب المتابعين 📸
              </span>
              <h3 className="text-lg sm:text-2xl font-black font-serif-arabic text-neutral-900 mt-2">
                صانع بطاقات ومنشورات الشبكات الاجتماعية الفخمة
              </h3>
              <p className="text-[11px] sm:text-xs text-neutral-500 mt-1 leading-relaxed">
                اختر المظهر وصيغة التصدير المناسبة للإنستقرام، إكس (تويتر)، أو تيك توك لتوليد لوحة ممتازة عالية الدقة ومؤطرة بالذهب لنشرها مباشرة!
              </p>
            </div>

            {/* Main Content Side-By-Side / Stacked Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 items-stretch overflow-y-auto pr-1">
              
              {/* Right/First Column: Configuration Options & Social Sharing Controls */}
              <div className="lg:col-span-6 space-y-4 sm:space-y-5 flex flex-col justify-between">
                
                <div className="space-y-4">
                  {/* Option 1: Graphic size aspect ratios */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-neutral-700 block">صيغة منصة النشر والأبعاد:</label>
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                      <button
                        type="button"
                        onClick={() => setShareConfigType('story')}
                        className={`px-1.5 sm:px-2.5 py-2 sm:py-2.5 text-[9.5px] sm:text-[10.5px] rounded-xl border text-center font-bold transition flex flex-col items-center justify-center gap-1 leading-tight cursor-pointer ${
                          shareConfigType === 'story'
                            ? 'bg-amber-600 text-white border-amber-600 font-extrabold shadow-sm'
                            : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:text-neutral-900'
                        }`}
                      >
                        <span>أستوري جوال 📱</span>
                        <span className="text-[8px] sm:text-[9px] opacity-75">9:16 إنستغرام/تيكتوك</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShareConfigType('post')}
                        className={`px-1.5 sm:px-2.5 py-2 sm:py-2.5 text-[9.5px] sm:text-[10.5px] rounded-xl border text-center font-bold transition flex flex-col items-center justify-center gap-1 leading-tight cursor-pointer ${
                          shareConfigType === 'post'
                            ? 'bg-amber-600 text-white border-amber-600 font-extrabold shadow-sm'
                            : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:text-neutral-900'
                        }`}
                      >
                        <span>منشور مربع 🟩</span>
                        <span className="text-[8px] sm:text-[9px] opacity-75">1:1 إنستغرام/إكس</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShareConfigType('landscape')}
                        className={`px-1.5 sm:px-2.5 py-2 sm:py-2.5 text-[9.5px] sm:text-[10.5px] rounded-xl border text-center font-bold transition flex flex-col items-center justify-center gap-1 leading-tight cursor-pointer ${
                          shareConfigType === 'landscape'
                            ? 'bg-amber-600 text-white border-amber-600 font-extrabold shadow-sm'
                            : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:text-neutral-900'
                        }`}
                      >
                        <span>لوحة عريضة 🌐</span>
                        <span className="text-[8px] sm:text-[9px] opacity-75">16:9 إكس/تيكتوك feed</span>
                      </button>
                    </div>
                  </div>

                  {/* Option 2: Choose preset backgrounds */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-neutral-700 block">شكل ولون قالب الغلاف الدائري والمؤطّرات:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-1.5 sm:gap-2">
                      {[
                        { hex: '#0b0821', label: 'كوزميك داكن', ring: 'bg-purple-900/30' },
                        { hex: '#012314', label: 'أخضر ملكي', ring: 'bg-emerald-950/30' },
                        { hex: '#290a1b', label: 'وردي مخملي', ring: 'bg-pink-950/30' },
                        { hex: '#141414', label: 'أسود مطفي', ring: 'bg-stone-900/30' }
                      ].map((preset) => (
                        <button
                          key={preset.hex}
                          type="button"
                          onClick={() => setCustomShareColor(preset.hex)}
                          className={`px-2 sm:px-3 py-1.5 sm:py-2 text-[10.5px] sm:text-xs rounded-xl border flex items-center justify-start gap-1.5 sm:gap-2 transition cursor-pointer ${
                            customShareColor === preset.hex
                              ? 'border-amber-500 text-amber-900 bg-amber-50 font-bold'
                              : 'border-neutral-200 text-neutral-600 bg-neutral-50 hover:text-neutral-800'
                          }`}
                        >
                          <span className="w-3.5 h-3.5 rounded-full border border-white/10 shrink-0" style={{ backgroundColor: preset.hex }} />
                          <span className="truncate">{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Direct Social Media Share Section */}
                <div className="pt-4 border-t border-amber-500/10 space-y-2.5">
                  <div className="text-[11px] font-bold text-amber-700 text-right font-sans flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span>🔗 مشاركة وتوثيق فوري للديوان المنثور:</span>
                    <span className="text-[9.5px] text-stone-400 font-normal hidden sm:inline">(انقر للنشر كأديب مباشر)</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const text = `✨ « ${selectedNode.record.word} » ✨\n\n📌 المعنى في ديوان كِلْمَتِي:\n${selectedNode.record.meaning}\n\n📜 شاهد أدبي:\n"${selectedNode.record.quote}"\n\n🔒 حيازة أدبية موثقة بموجب ميثاق ملكية الكلمات للأبد باسم [ ${selectedNode.record.owner} ]\n\n🎨 وثّق كلمتك الفخمة الآن:\nhttps://kilmati.com`;
                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                      }}
                      className="flex items-center justify-center gap-1.5 px-2 py-2.5 bg-[#075e54]/10 hover:bg-[#075e54]/25 border border-[#075e54]/20 hover:border-[#075e54]/40 text-[#25d366] hover:text-[#1ebd5d] rounded-xl text-[10px] sm:text-[10.5px] font-bold transition cursor-pointer active:scale-95"
                    >
                      <span className="text-xs">💬</span>
                      <span className="truncate">واتساب</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const text = `✨ « ${selectedNode.record.word} » ✨\n\n📌 المعنى في ديوان كِلْمَتِي:\n${selectedNode.record.meaning}\n\n📜 شاهد أدبي:\n"${selectedNode.record.quote}"\n\n🔒 حيازة أدبية موثقة بموجب ميثاق ملكية الكلمات للأبد باسم [ ${selectedNode.record.owner} ]\n\n🎨 وثّق كلمتك الفخمة الآن:\nhttps://kilmati.com`;
                        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
                      }}
                      className="flex items-center justify-center gap-1.5 px-2 py-2.5 bg-neutral-900 hover:bg-black text-white rounded-xl text-[10px] sm:text-[10.5px] font-bold transition cursor-pointer active:scale-95"
                    >
                      <span className="inline-block font-sans transform scale-90">𝕏</span>
                      <span className="truncate">إكس / تويتر</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const text = `✨ « ${selectedNode.record.word} » ✨\n\n📌 المعنى في ديوان كِلْمَتِي:\n${selectedNode.record.meaning}\n\n📜 شاهد أدبي:\n"${selectedNode.record.quote}"\n\n🔒 حيازة أدبية موثقة بموجب ميثاق ملكية الكلمات للأبد باسم [ ${selectedNode.record.owner} ]\n\n🎨 وثّق كلمتك الفخمة الآن:\nhttps://kilmati.com`;
                        window.open(`https://t.me/share/url?url=${encodeURIComponent('https://kilmati.com')}&text=${encodeURIComponent(text)}`, '_blank');
                      }}
                      className="flex items-center justify-center gap-1.5 px-2.5 py-2.5 bg-sky-50 hover:bg-sky-100 border border-sky-150 text-sky-800 rounded-xl text-[10px] sm:text-[10.5px] font-bold transition cursor-pointer active:scale-95"
                    >
                      <span className="text-xs">✈️</span>
                      <span className="truncate">تيليجرام</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const text = `✨ « ${selectedNode.record.word} » ✨\n\n📌 المعنى في ديوان كِلْمَتِي:\n${selectedNode.record.meaning}\n\n📜 شاهد أدبي:\n"${selectedNode.record.quote}"\n\n🔒 حيازة أدبية موثقة بموجب ميثاق ملكية الكلمات للأبد باسم [ ${selectedNode.record.owner} ]\n\n🎨 وثّق كلمتك الفخمة الآن:\nhttps://kilmati.com`;
                        if (navigator.share) {
                          navigator.share({
                            title: `صك ملكية الكلمة « ${selectedNode.record.word} »`,
                            text: text,
                            url: 'https://kilmati.com',
                          }).catch((err) => console.log(err));
                        } else {
                          navigator.clipboard.writeText(text);
                          setIsCopied(true);
                          setTimeout(() => setIsCopied(false), 2000);
                        }
                      }}
                      className="flex items-center justify-center gap-1.5 px-2 py-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-xl text-[10px] sm:text-[10.5px] font-bold transition cursor-pointer active:scale-95 shadow-3xs"
                    >
                      <Share2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span className="truncate">مشاركة ذكية</span>
                    </button>
                  </div>
                </div>

                {/* Info label for safe publication guidance */}
                <p className="text-[10px] text-neutral-500 text-right leading-relaxed font-sans bg-neutral-50 p-3 rounded-xl border border-neutral-100/70 hidden lg:block">
                  💡 <strong>نصيحة للنشر:</strong> بعد تحميل صك التوثيق الفخم بالأبعاد المخصصة، انشره مباشرة كمظهر شريف في تيك توك أو ستوري إنستقرام لجذب التفاعل وإشعال قلوب الأدباء المعجبين بملكية الألفاظ.
                </p>

              </div>

              {/* Left/Second Column: Interactive Simulated Screen Mockup & Action Buttons */}
              <div className="lg:col-span-6 flex flex-col justify-between space-y-4 bg-neutral-50 p-3 sm:p-4 rounded-2xl border border-neutral-200">
                
                <div className="flex flex-col items-center space-y-3">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] text-amber-900 bg-amber-100/75 border border-amber-200 font-extrabold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 leading-none shadow-3xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                      معاينة حية ومباشرة لقالب الصك الراهن
                    </span>
                    
                    <span className="text-[9px] sm:text-[10px] text-neutral-400 font-bold font-sans">
                      {shareConfigType === 'story' ? 'مظهر رأسي (9:16)' : (shareConfigType === 'landscape' ? 'مظهر تغريدة (16:9)' : 'مظهر مربع (1:1)')}
                    </span>
                  </div>

                  {/* Visual Live Mobile Mockup Rendering on screen */}
                  <div className="bg-neutral-100/60 p-3 sm:p-5 rounded-xl border border-neutral-200/50 flex justify-center items-center overflow-hidden w-full lg:min-h-[340px]">
                    
                    <div 
                      className="transition-all duration-500 relative rounded-2xl border border-amber-500/25 shadow-lg overflow-hidden p-4 sm:p-5 flex flex-col justify-between w-full max-w-full"
                      style={{
                        background: `linear-gradient(135deg, ${customShareColor} 0%, ${getDarkestBlendColor(customShareColor)} 100%)`,
                        width: shareConfigType === 'story' ? '185px' : (shareConfigType === 'landscape' ? '100%' : '230px'),
                        maxWidth: shareConfigType === 'landscape' ? '380px' : '100%',
                        aspectRatio: shareConfigType === 'story' ? '9/16' : (shareConfigType === 'landscape' ? '16/9' : '1/1'),
                        minHeight: shareConfigType === 'story' ? '328px' : (shareConfigType === 'landscape' ? 'auto' : '230px')
                      }}
                    >
                      {/* Visual stars / glimmers effect */}
                      <div className="absolute top-1/4 left-1/3 w-1 h-1 bg-white rounded-full animate-ping opacity-40" />
                      <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-white rounded-full animate-pulse opacity-50" />
                      <div className="absolute top-1/10 right-1/10 w-20 h-20 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

                      {/* Concentric rings pattern */}
                      {shareConfigType !== 'landscape' ? (
                        <>
                          <div 
                            className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed opacity-25 animate-spin pointer-events-none"
                            style={{
                              width: '120px',
                              height: '120px',
                              borderColor: getEnvelopeAccentColor(customShareColor),
                              animationDuration: '30s'
                            }}
                          />
                          <div 
                            className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border opacity-10 pointer-events-none"
                            style={{
                              width: '80px',
                              height: '80px',
                              borderColor: 'rgba(235, 209, 151, 0.4)',
                              background: `radial-gradient(circle, ${getEnvelopeAccentColor(customShareColor)}40 0%, transparent 80%)`
                            }}
                          />
                        </>
                      ) : (
                        <>
                          {/* Ring aligned to left column inside landscape mode */}
                          <div 
                            className="absolute top-[50%] left-[30%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed opacity-25 animate-spin pointer-events-none"
                            style={{
                              width: '100px',
                              height: '100px',
                              borderColor: getEnvelopeAccentColor(customShareColor),
                              animationDuration: '30s'
                            }}
                          />
                          <div 
                            className="absolute top-[50%] left-[30%] -translate-x-1/2 -translate-y-1/2 rounded-full border opacity-10 pointer-events-none"
                            style={{
                              width: '70px',
                              height: '70px',
                              borderColor: 'rgba(235, 209, 151, 0.4)',
                              background: `radial-gradient(circle, ${getEnvelopeAccentColor(customShareColor)}40 0%, transparent 80%)`
                            }}
                          />
                        </>
                      )}

                      {/* Elegant borders mockup */}
                      <div className="absolute inset-1.5 border border-amber-500/15 rounded-xl pointer-events-none" />

                      {/* Check alignment layouts internally for mockup visual */}
                      {shareConfigType === 'landscape' ? (
                        // Landscape layout mockup visual split columns
                        <div className="grid grid-cols-12 gap-2 h-full relative z-10 text-right items-stretch py-0.5">
                          {/* Left Column: orbit and owner tag */}
                          <div className="col-span-7 flex flex-col justify-center items-center text-center">
                            <span className="block text-lg font-black text-white leading-tight">
                              « {selectedNode.label} »
                            </span>
                            <span className="block text-[6px] text-stone-400 mt-0.5 leading-none">
                              صك ملكية موثق ومحفوظ للأبد
                            </span>
                            <span className="block text-[8px] text-amber-400/90 font-bold mt-1 leading-none">
                              الحائز: {selectedNode.record.owner}
                            </span>
                          </div>

                          {/* Dotted divider line */}
                          <div className="col-span-1 border-r border-dashed border-amber-500/20 my-1 self-stretch" />

                          {/* Right Column: description box and stamp */}
                          <div className="col-span-4 flex flex-col justify-between text-right">
                            <div className="space-y-0.5 mt-0.5">
                              <div className="text-[6px] text-amber-350 font-bold leading-none">KILMATI.COM</div>
                              <div className="bg-black/45 p-1 rounded border border-white/5 text-[4.5px] leading-tight text-stone-300">
                                <strong>الدلالة:</strong> {selectedNode.record.meaning.substring(0, 20)}...
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-auto">
                              <span className="text-[5px] text-amber-500/55 font-mono">AUTHENTIC</span>
                              {/* Simulated Wax Seal element */}
                              <div 
                                className="w-5 h-5 rounded-full shadow-[0_1.5px_4px_rgba(0,0,0,0.5)] flex items-center justify-center text-[3.5px] font-bold text-white/95 shrink-0"
                                style={{
                                  backgroundColor: getWaxSealColor(customShareColor),
                                  border: '1px solid rgba(255,255,255,0.2)',
                                  borderRadius: '45% 55% 50% 50%'
                                }}
                              >
                                مَوْثُوق
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Centered portrait layouts (Square post or Portrait story)
                        <>
                          {/* Header Mockup */}
                          <div className="relative z-10 text-[6px] text-amber-400/80 font-black tracking-widest leading-none mt-0.5 text-center">
                            صَكُّ المِلْكِيَّةِ الحَصْرِيُّ ✦ ديوان كِلْمَتِي
                          </div>

                          {/* Main Core Word */}
                          <div className="relative z-10 my-auto py-1 text-center">
                            <span className="block text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-amber-300">
                              « {selectedNode.label} »
                            </span>
                            <span className="block text-[6px] text-stone-300 mt-0.5 leading-none opacity-85">
                              حيازة أدبية محمية بميثاق الملكية العربة
                            </span>
                            <span className="block text-[8px] text-amber-400 font-extrabold mt-1">
                              الحائز: {selectedNode.record.owner}
                            </span>
                          </div>

                          {/* Text meaning snippet preview */}
                          <div className="relative z-10 bg-black/45 p-1.5 rounded-lg border border-white/5 text-[7px] text-stone-300 leading-tight mx-0.5 text-right">
                            <p className="line-clamp-2">{selectedNode.record.meaning}</p>
                          </div>

                          {/* Simulated hand-pressed wax stamp right above bottom title */}
                          <div className="relative z-10 flex justify-center my-1">
                            <div 
                              className="w-7 h-7 rounded-full shadow-[0_1.5px_4.5px_rgba(0,0,0,0.5)] flex items-center justify-center text-[4.5px] font-black text-white/95"
                              style={{
                                backgroundColor: getWaxSealColor(customShareColor),
                                border: '1.5px solid rgba(255,255,255,0.2)',
                                borderRadius: '48% 52% 45% 55%'
                              }}
                            >
                              مَوْثُوق
                            </div>
                          </div>

                          {/* Footer text */}
                          <div className="relative z-10 text-[6px] text-amber-500/75 font-bold leading-none select-none text-center">
                            K I L M A T I . C O M
                          </div>
                        </>
                      )}

                    </div>

                  </div>
                </div>

                {/* Combined Save and Action triggers inside the same column */}
                <div className="space-y-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => downloadInstagramGraphic(selectedNode.record)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-black text-xs rounded-xl transform active:scale-95 transition shadow-sm cursor-pointer text-center"
                    disabled={isGeneratingImage}
                  >
                    {isGeneratingImage ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                        <span>جاري تلوين الغلاف وصياغة الأبعاد...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5 text-white" />
                        <span>
                          {shareConfigType === 'story' && "تحميل بطاقة الـ Story للأستوري (PNG) 📸"}
                          {shareConfigType === 'post' && "تحميل منشور الـ Feed المربع (PNG) 📸"}
                          {shareConfigType === 'landscape' && "تحميل منشور الـ X العريض (PNG) 📸"}
                        </span>
                      </>
                    )}
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyInstagramBio(selectedNode.record)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-[11px] font-bold border border-neutral-200 cursor-pointer active:scale-95 transition"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-neutral-500" />}
                      <span className="truncate">{isCopied ? 'تم نسخ النص!' : 'نسخ الصك مكتوباً 📋'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowShareModal(false)}
                      className="px-3 py-2.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 rounded-xl text-[11px] font-bold transition cursor-pointer text-center"
                    >
                      إلغاء وإغلاق
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
