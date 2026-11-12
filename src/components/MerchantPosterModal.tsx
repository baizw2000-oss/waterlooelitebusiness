import React, { useState, useEffect, useRef } from 'react';
import { Merchant } from '../types';
import { 
  X, 
  Download, 
  Copy, 
  CheckCircle2, 
  Share2, 
  Sparkles, 
  Palette, 
  QrCode, 
  Award, 
  ShieldCheck, 
  Smartphone,
  RefreshCw
} from 'lucide-react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';

interface MerchantPosterModalProps {
  merchant: Merchant;
  onClose: () => void;
}

type PosterTheme = 'dark-gold' | 'tech-blue' | 'ivory-gold';

export const MerchantPosterModal: React.FC<MerchantPosterModalProps> = ({
  merchant,
  onClose,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<PosterTheme>('dark-gold');
  const [showContactInfo, setShowContactInfo] = useState<boolean>(true);
  const [showPrivilege, setShowPrivilege] = useState<boolean>(true);
  const [posterDataUrl, setPosterDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [copiedImage, setCopiedImage] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate the poster on canvas
  useEffect(() => {
    let isCancelled = false;

    const generatePoster = async () => {
      setIsGenerating(true);
      try {
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 1280;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Base share url
        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://waterloobusiness.ca';
        const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
        const shareUrl = `${origin}${pathname}?merchant=${merchant.id}`;

        // Generate QR code data URL
        const qrDataUrl = await QRCode.toDataURL(shareUrl, {
          margin: 1,
          width: 240,
          color: {
            dark: selectedTheme === 'ivory-gold' ? '#0f172a' : '#090d16',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'H',
        });

        const qrImg = new Image();
        qrImg.crossOrigin = 'anonymous';
        await new Promise((resolve) => {
          qrImg.onload = resolve;
          qrImg.onerror = resolve;
          qrImg.src = qrDataUrl;
        });

        if (isCancelled) return;

        // Helper: draw rounded rect
        const drawRoundRect = (
          x: number,
          y: number,
          w: number,
          h: number,
          r: number,
          fillColor?: string | CanvasGradient,
          strokeColor?: string,
          lineWidth: number = 1
        ) => {
          ctx.beginPath();
          ctx.moveTo(x + r, y);
          ctx.arcTo(x + w, y, x + w, y + h, r);
          ctx.arcTo(x + w, y + h, x, y + h, r);
          ctx.arcTo(x, y + h, x, y, r);
          ctx.arcTo(x, y, x + w, y, r);
          ctx.closePath();
          if (fillColor) {
            ctx.fillStyle = fillColor;
            ctx.fill();
          }
          if (strokeColor) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = lineWidth;
            ctx.stroke();
          }
        };

        // Helper: text wrapping
        const drawWrappedText = (
          text: string,
          x: number,
          y: number,
          maxWidth: number,
          lineHeight: number,
          maxLines: number = 4
        ) => {
          const chars = Array.from(text);
          let currentLine = '';
          let currentY = y;
          let lineCount = 0;

          for (let i = 0; i < chars.length; i++) {
            const testLine = currentLine + chars[i];
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && currentLine.length > 0) {
              lineCount++;
              if (lineCount >= maxLines) {
                ctx.fillText(currentLine.slice(0, -1) + '...', x, currentY);
                return currentY + lineHeight;
              }
              ctx.fillText(currentLine, x, currentY);
              currentLine = chars[i];
              currentY += lineHeight;
            } else {
              currentLine = testLine;
            }
          }
          if (currentLine) {
            ctx.fillText(currentLine, x, currentY);
            currentY += lineHeight;
          }
          return currentY;
        };

        // 1. Background Fill according to theme
        if (selectedTheme === 'dark-gold') {
          const bgGrad = ctx.createLinearGradient(0, 0, 800, 1280);
          bgGrad.addColorStop(0, '#090d16');
          bgGrad.addColorStop(0.3, '#0b1120');
          bgGrad.addColorStop(0.7, '#111827');
          bgGrad.addColorStop(1, '#1c150c');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, 800, 1280);

          // Subtle ambient glows
          const radialGold = ctx.createRadialGradient(720, 120, 10, 720, 120, 360);
          radialGold.addColorStop(0, 'rgba(245, 158, 11, 0.16)');
          radialGold.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.fillStyle = radialGold;
          ctx.fillRect(0, 0, 800, 600);

          const radialBlue = ctx.createRadialGradient(80, 1180, 10, 80, 1180, 380);
          radialBlue.addColorStop(0, 'rgba(14, 165, 233, 0.12)');
          radialBlue.addColorStop(1, 'rgba(14, 165, 233, 0)');
          ctx.fillStyle = radialBlue;
          ctx.fillRect(0, 600, 800, 680);
        } else if (selectedTheme === 'tech-blue') {
          const bgGrad = ctx.createLinearGradient(0, 0, 800, 1280);
          bgGrad.addColorStop(0, '#020617');
          bgGrad.addColorStop(0.4, '#08142c');
          bgGrad.addColorStop(0.8, '#0b1e3d');
          bgGrad.addColorStop(1, '#020d1e');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, 800, 1280);

          const radialCyan = ctx.createRadialGradient(700, 200, 10, 700, 200, 400);
          radialCyan.addColorStop(0, 'rgba(6, 182, 212, 0.2)');
          radialCyan.addColorStop(1, 'rgba(6, 182, 212, 0)');
          ctx.fillStyle = radialCyan;
          ctx.fillRect(0, 0, 800, 700);
        } else {
          // ivory-gold
          const bgGrad = ctx.createLinearGradient(0, 0, 800, 1280);
          bgGrad.addColorStop(0, '#faf8f5');
          bgGrad.addColorStop(0.5, '#f4ece1');
          bgGrad.addColorStop(1, '#ebdcc7');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, 800, 1280);

          const radialWarm = ctx.createRadialGradient(680, 150, 10, 680, 150, 350);
          radialWarm.addColorStop(0, 'rgba(217, 119, 6, 0.1)');
          radialWarm.addColorStop(1, 'rgba(217, 119, 6, 0)');
          ctx.fillStyle = radialWarm;
          ctx.fillRect(0, 0, 800, 600);
        }

        // 2. Poster Outer Luxury Double Borders
        const borderColor = selectedTheme === 'ivory-gold' ? 'rgba(180, 83, 9, 0.4)' : 'rgba(245, 158, 11, 0.45)';
        const innerBorderColor = selectedTheme === 'ivory-gold' ? 'rgba(180, 83, 9, 0.2)' : 'rgba(245, 158, 11, 0.18)';
        drawRoundRect(28, 28, 744, 1224, 28, undefined, borderColor, 2);
        drawRoundRect(36, 36, 728, 1208, 22, undefined, innerBorderColor, 1);

        // Corner luxury accents
        const cornerColor = selectedTheme === 'ivory-gold' ? '#b45309' : '#f59e0b';
        ctx.fillStyle = cornerColor;
        [
          [48, 48],
          [752, 48],
          [48, 1232],
          [752, 1232],
        ].forEach(([cx, cy]) => {
          ctx.beginPath();
          ctx.arc(cx, cy, 3, 0, Math.PI * 2);
          ctx.fill();
        });

        // 3. Chamber Official Header
        // Draw the golden square logo with character "融"
        const logoGrad = ctx.createLinearGradient(60, 65, 110, 115);
        logoGrad.addColorStop(0, '#fde68a');
        logoGrad.addColorStop(0.5, '#f59e0b');
        logoGrad.addColorStop(1, '#b45309');
        drawRoundRect(60, 65, 52, 52, 14, logoGrad, 'rgba(251, 191, 36, 0.6)', 1.5);

        // Inside logo character
        ctx.fillStyle = '#090d16';
        drawRoundRect(63, 68, 46, 46, 11, '#090d16');
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 26px "Noto Serif SC", Songti SC, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('融', 86, 92);

        // Chamber Name Texts
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.font = 'bold 22px "Plus Jakarta Sans", "Noto Sans SC", sans-serif';
        ctx.fillStyle = selectedTheme === 'ivory-gold' ? '#0f172a' : '#ffffff';
        ctx.fillText('滑铁卢融商汇', 124, 68);

        // WBCA badge next to text
        const badgeBg = selectedTheme === 'ivory-gold' ? 'rgba(180, 83, 9, 0.15)' : 'rgba(245, 158, 11, 0.2)';
        const badgeBorder = selectedTheme === 'ivory-gold' ? 'rgba(180, 83, 9, 0.4)' : 'rgba(245, 158, 11, 0.5)';
        drawRoundRect(275, 70, 62, 22, 6, badgeBg, badgeBorder, 1);
        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = selectedTheme === 'ivory-gold' ? '#92400e' : '#fde68a';
        ctx.textAlign = 'center';
        ctx.fillText('WBCA', 306, 74);

        ctx.textAlign = 'left';
        ctx.font = '500 11px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = selectedTheme === 'ivory-gold' ? '#78350f' : 'rgba(251, 191, 36, 0.85)';
        ctx.fillText('Waterloo Business Convergence Alliance · 官方实名认证公信名片', 124, 96);

        // Header Divider
        const dividerGrad = ctx.createLinearGradient(60, 134, 740, 134);
        dividerGrad.addColorStop(0, 'rgba(245, 158, 11, 0)');
        dividerGrad.addColorStop(0.5, selectedTheme === 'ivory-gold' ? 'rgba(180, 83, 9, 0.5)' : 'rgba(245, 158, 11, 0.6)');
        dividerGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.strokeStyle = dividerGrad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(60, 134);
        ctx.lineTo(740, 134);
        ctx.stroke();

        // 4. Main Merchant Profile Box
        const mainCardBg = selectedTheme === 'ivory-gold'
          ? 'rgba(255, 255, 255, 0.85)'
          : selectedTheme === 'tech-blue'
            ? 'rgba(15, 23, 42, 0.75)'
            : 'rgba(15, 23, 42, 0.8)';
        const mainCardBorder = selectedTheme === 'ivory-gold'
          ? 'rgba(180, 83, 9, 0.25)'
          : 'rgba(245, 158, 11, 0.25)';
        drawRoundRect(56, 154, 688, 430, 24, mainCardBg, mainCardBorder, 1);

        // Try drawing Merchant Avatar (Image or Emoji Badge)
        let imageDrawn = false;
        if (merchant.logo && (merchant.logo.startsWith('http') || merchant.logo.startsWith('data:image'))) {
          try {
            const logoImg = new Image();
            logoImg.crossOrigin = 'anonymous';
            await new Promise((resolve, reject) => {
              logoImg.onload = resolve;
              logoImg.onerror = reject;
              logoImg.src = merchant.logo;
            });
            ctx.save();
            ctx.beginPath();
            ctx.arc(128, 230, 48, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(logoImg, 80, 182, 96, 96);
            ctx.restore();

            // Avatar border ring
            ctx.beginPath();
            ctx.arc(128, 230, 48, 0, Math.PI * 2);
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 3;
            ctx.stroke();
            imageDrawn = true;
          } catch (e) {
            imageDrawn = false;
          }
        }

        if (!imageDrawn) {
          // Draw Handsome Avatar Badge with Emoji or Initial
          const avGrad = ctx.createLinearGradient(80, 182, 176, 278);
          avGrad.addColorStop(0, '#fef08a');
          avGrad.addColorStop(1, '#d97706');
          ctx.beginPath();
          ctx.arc(128, 230, 48, 0, Math.PI * 2);
          ctx.fillStyle = avGrad;
          ctx.fill();
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 3;
          ctx.stroke();

          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const symbol = merchant.entityType === 'individual' ? '👤' : (merchant.logo && merchant.logo.length <= 2 ? merchant.logo : '🏢');
          ctx.font = '42px sans-serif';
          ctx.fillText(symbol, 128, 232);
        }

        // Merchant Name & Category
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.font = 'bold 30px "Plus Jakarta Sans", "Noto Sans SC", sans-serif';
        ctx.fillStyle = selectedTheme === 'ivory-gold' ? '#0f172a' : '#ffffff';
        
        // Truncate name if too long
        let mName = merchant.name;
        if (ctx.measureText(mName).width > 420) {
          mName = mName.substring(0, 13) + '...';
        }
        ctx.fillText(mName, 196, 182);

        // English Name / Tag
        ctx.font = '500 14px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = selectedTheme === 'ivory-gold' ? '#64748b' : '#94a3b8';
        ctx.fillText(merchant.nameEn || merchant.category, 196, 222);

        // Row of Badges
        let badgeX = 196;
        const drawPill = (txt: string, bg: string, border: string, textCol: string) => {
          ctx.font = 'bold 12px "Noto Sans SC", sans-serif';
          const w = ctx.measureText(txt).width + 18;
          drawRoundRect(badgeX, 248, w, 26, 13, bg, border, 1);
          ctx.fillStyle = textCol;
          ctx.textAlign = 'center';
          ctx.fillText(txt, badgeX + w / 2, 254);
          badgeX += w + 8;
        };

        drawPill(
          merchant.entityType === 'individual' ? '👤 执业专家会员' : '🏢 企业认证商户',
          selectedTheme === 'ivory-gold' ? 'rgba(30, 58, 138, 0.1)' : 'rgba(59, 130, 246, 0.2)',
          'rgba(59, 130, 246, 0.4)',
          selectedTheme === 'ivory-gold' ? '#1d4ed8' : '#93c5fd'
        );

        drawPill(
          merchant.category,
          selectedTheme === 'ivory-gold' ? 'rgba(180, 83, 9, 0.1)' : 'rgba(245, 158, 11, 0.18)',
          'rgba(245, 158, 11, 0.45)',
          selectedTheme === 'ivory-gold' ? '#92400e' : '#fde68a'
        );

        drawPill(
          `★ ${merchant.credibilityScore}分·AAA级`,
          selectedTheme === 'ivory-gold' ? 'rgba(5, 150, 105, 0.1)' : 'rgba(16, 185, 129, 0.2)',
          'rgba(16, 185, 129, 0.4)',
          selectedTheme === 'ivory-gold' ? '#047857' : '#6ee7b7'
        );

        // Tagline quote box
        const quoteBg = selectedTheme === 'ivory-gold'
          ? 'rgba(241, 245, 249, 0.95)'
          : 'rgba(15, 23, 42, 0.9)';
        const quoteBorder = selectedTheme === 'ivory-gold'
          ? 'rgba(203, 213, 225, 0.8)'
          : 'rgba(51, 65, 85, 0.7)';
        drawRoundRect(80, 298, 640, 68, 14, quoteBg, quoteBorder, 1);
        
        ctx.textAlign = 'left';
        ctx.font = 'italic 15px "Noto Sans SC", sans-serif';
        ctx.fillStyle = selectedTheme === 'ivory-gold' ? '#334155' : '#e2e8f0';
        drawWrappedText(`“${merchant.tagline}”`, 100, 318, 600, 22, 2);

        // Services & Capabilities
        ctx.textAlign = 'left';
        ctx.font = 'bold 13px "Noto Sans SC", sans-serif';
        ctx.fillStyle = selectedTheme === 'ivory-gold' ? '#78350f' : '#fbbf24';
        ctx.fillText('核心服务与优势领域：', 80, 386);

        ctx.font = '13px "Noto Sans SC", sans-serif';
        ctx.fillStyle = selectedTheme === 'ivory-gold' ? '#1e293b' : '#cbd5e1';
        const serviceList = merchant.services && merchant.services.length > 0 
          ? merchant.services.slice(0, 4) 
          : ['深度产业协同', '本地化专业服务', '高净值客群支持', '商会信用互保'];
        
        let sY = 412;
        serviceList.forEach((s) => {
          ctx.fillText(`•  ${s}`, 90, sY);
          sY += 24;
        });

        // Representative & Location info
        const repText = `法定代表 / 负责人: ${merchant.repName || '商会实名会员'} · ${merchant.repTitle || '商务代表'} | 驻地: ${merchant.address || 'Waterloo, ON'}`;
        ctx.font = '500 12px "Noto Sans SC", sans-serif';
        ctx.fillStyle = selectedTheme === 'ivory-gold' ? '#64748b' : '#94a3b8';
        ctx.fillText(repText, 80, 524);

        if (showContactInfo && (merchant.phone || merchant.email)) {
          ctx.font = '500 12px monospace';
          ctx.fillStyle = selectedTheme === 'ivory-gold' ? '#0369a1' : '#38bdf8';
          const contactStr = `📞 ${merchant.phone || ''}   ✉️ ${merchant.email || ''}`.trim();
          ctx.fillText(contactStr, 80, 548);
        }

        // 5. Member Privilege Highlight Box
        let nextBlockY = 604;
        if (showPrivilege && merchant.memberPrivilege) {
          const privBg = selectedTheme === 'ivory-gold'
            ? 'rgba(254, 243, 199, 0.7)'
            : 'rgba(245, 158, 11, 0.12)';
          const privBorder = selectedTheme === 'ivory-gold'
            ? 'rgba(217, 119, 6, 0.45)'
            : 'rgba(245, 158, 11, 0.4)';
          drawRoundRect(56, nextBlockY, 688, 92, 18, privBg, privBorder, 1.5);

          ctx.textAlign = 'left';
          ctx.font = 'bold 14px "Noto Sans SC", sans-serif';
          ctx.fillStyle = selectedTheme === 'ivory-gold' ? '#b45309' : '#f59e0b';
          ctx.fillText('🎁 滑铁卢融商汇 · 会员专属尊享礼遇', 80, nextBlockY + 16);

          ctx.font = '13px "Noto Sans SC", sans-serif';
          ctx.fillStyle = selectedTheme === 'ivory-gold' ? '#451a03' : '#fef3c7';
          drawWrappedText(merchant.memberPrivilege, 80, nextBlockY + 42, 640, 20, 2);

          nextBlockY += 112;
        }

        // 6. Enterprise Overview Snippet Box
        const descBoxHeight = showPrivilege && merchant.memberPrivilege ? 190 : 280;
        const descBg = selectedTheme === 'ivory-gold'
          ? 'rgba(255, 255, 255, 0.75)'
          : 'rgba(15, 23, 42, 0.65)';
        const descBorder = selectedTheme === 'ivory-gold'
          ? 'rgba(203, 213, 225, 0.6)'
          : 'rgba(51, 65, 85, 0.6)';
        drawRoundRect(56, nextBlockY, 688, descBoxHeight, 20, descBg, descBorder, 1);

        ctx.textAlign = 'left';
        ctx.font = 'bold 14px "Noto Sans SC", sans-serif';
        ctx.fillStyle = selectedTheme === 'ivory-gold' ? '#0f172a' : '#ffffff';
        ctx.fillText('关于该商企 / 机构简介：', 80, nextBlockY + 18);

        ctx.font = '13px "Noto Sans SC", sans-serif';
        ctx.fillStyle = selectedTheme === 'ivory-gold' ? '#334155' : '#cbd5e1';
        drawWrappedText(
          merchant.description || '扎根加拿大滑铁卢科技走廊核心腹地，秉承诚信合规经营，致力为本地社区及华商网络提供卓越品质与专业服务。',
          80,
          nextBlockY + 48,
          640,
          24,
          showPrivilege && merchant.memberPrivilege ? 5 : 8
        );

        // 7. Bottom QR Code & Deep Link Section
        const qrSectionY = 940;
        const qrCardBg = selectedTheme === 'ivory-gold'
          ? 'rgba(255, 255, 255, 0.92)'
          : selectedTheme === 'tech-blue'
            ? 'rgba(15, 23, 42, 0.9)'
            : 'rgba(11, 17, 32, 0.92)';
        const qrCardBorder = selectedTheme === 'ivory-gold'
          ? 'rgba(180, 83, 9, 0.35)'
          : 'rgba(245, 158, 11, 0.35)';
        drawRoundRect(56, qrSectionY, 688, 230, 24, qrCardBg, qrCardBorder, 1.5);

        // Draw QR Code Image (Clean & Crisp with white background padding)
        drawRoundRect(80, qrSectionY + 20, 190, 190, 16, '#ffffff', 'rgba(245, 158, 11, 0.5)', 2);
        ctx.drawImage(qrImg, 90, qrSectionY + 30, 170, 170);

        // Text beside QR Code
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.font = 'bold 18px "Noto Sans SC", sans-serif';
        ctx.fillStyle = selectedTheme === 'ivory-gold' ? '#0f172a' : '#ffffff';
        ctx.fillText('扫码直达商户专属公信档案', 290, qrSectionY + 32);

        // Deep link address badge
        const urlBadgeBg = selectedTheme === 'ivory-gold' ? 'rgba(3, 105, 161, 0.12)' : 'rgba(6, 182, 212, 0.15)';
        const urlBadgeBorder = selectedTheme === 'ivory-gold' ? 'rgba(3, 105, 161, 0.35)' : 'rgba(6, 182, 212, 0.4)';
        drawRoundRect(290, qrSectionY + 66, 420, 32, 8, urlBadgeBg, urlBadgeBorder, 1);
        ctx.font = 'bold 13px monospace';
        ctx.fillStyle = selectedTheme === 'ivory-gold' ? '#0369a1' : '#67e8f9';
        ctx.fillText(`?merchant=${merchant.id} · 独立索引参数直通`, 304, qrSectionY + 74);

        ctx.font = '13px "Noto Sans SC", sans-serif';
        ctx.fillStyle = selectedTheme === 'ivory-gold' ? '#475569' : '#94a3b8';
        ctx.fillText('• 微信或浏览器扫码，直接跳过检索唤起企业主页', 290, qrSectionY + 114);
        ctx.fillText('• 支持线上预约咨询、深度商信背书与商机互助响应', 290, qrSectionY + 140);

        // Security Anti-counterfeiting Tag
        ctx.font = '11px monospace';
        ctx.fillStyle = selectedTheme === 'ivory-gold' ? '#92400e' : '#fbbf24';
        ctx.fillText(`[WBCA-SEAL-VERIFIED] 编号: WBCA-ID-${String(merchant.id).padStart(4, '0')}`, 290, qrSectionY + 172);

        // 8. Footer Legal & Organization Line
        ctx.textAlign = 'center';
        ctx.font = '500 11px "Noto Sans SC", sans-serif';
        ctx.fillStyle = selectedTheme === 'ivory-gold' ? '#64748b' : 'rgba(148, 163, 184, 0.8)';
        ctx.fillText('加拿大滑铁卢融商汇 (WBCA) · 智汇滑铁卢 · 融商聚势 · 诚信合规数字保全', 400, 1195);
        ctx.font = '400 10px monospace';
        ctx.fillText(`© ${new Date().getFullYear()} Waterloo Business Convergence Alliance. All rights reserved.`, 400, 1214);

        const dataUrl = canvas.toDataURL('image/png', 1.0);
        setPosterDataUrl(dataUrl);
      } catch (err) {
        console.error('Failed to generate merchant poster:', err);
      } finally {
        setIsGenerating(false);
      }
    };

    generatePoster();

    return () => {
      isCancelled = true;
    };
  }, [merchant, selectedTheme, showContactInfo, showPrivilege]);

  // Handle Download PNG
  const handleDownload = () => {
    if (!posterDataUrl) return;
    const a = document.createElement('a');
    a.href = posterDataUrl;
    a.download = `${merchant.name}-融商汇专属名片海报.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  // Handle Copy Image or Link
  const handleCopyImage = async () => {
    if (!posterDataUrl) return;

    try {
      // Fetch the data URL as blob
      const res = await fetch(posterDataUrl);
      const blob = await res.blob();
      
      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2500);
        return;
      }
    } catch (e) {
      console.warn('Direct image clipboard copy not supported in this browser, falling back to link copy:', e);
    }

    // Fallback: copy link
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const shareUrl = `${origin}${pathname}?merchant=${merchant.id}`;
    navigator.clipboard?.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in overflow-y-auto">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                生成独立名片分享海报
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  ?merchant={merchant.id}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                高清 Canvas 渲染 · 专属实名防伪二维码 · 完美适配微信朋友圈与小红书
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Left Controls, Right Preview */}
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-y-auto flex-1">
          {/* Left Column: Visual Customizer Controls */}
          <div className="md:col-span-5 space-y-5">
            {/* Theme Selector */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-amber-400" />
                选择海报视觉主题 (Themes)
              </label>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'dark-gold', label: '经典黑金', desc: '大气庄重' },
                  { id: 'tech-blue', label: '科技蔚蓝', desc: '现代极客' },
                  { id: 'ivory-gold', label: '典雅白金', desc: '清新雅致' },
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setSelectedTheme(th.id as PosterTheme)}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      selectedTheme === th.id
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md ring-1 ring-amber-400/40'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-xs font-bold">{th.label}</span>
                    <span className="text-[10px] text-slate-400">{th.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Options */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 text-xs">
              <label className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                信息卡片自定义选项
              </label>

              <div className="space-y-2.5">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showContactInfo}
                    onChange={(e) => setShowContactInfo(e.target.checked)}
                    className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span>包含电话与邮箱联系方式 (Contact Info)</span>
                </label>

                {merchant.memberPrivilege && (
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showPrivilege}
                      onChange={(e) => setShowPrivilege(e.target.checked)}
                      className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                    />
                    <span>展示滑铁卢融商汇会员专享礼遇高亮</span>
                  </label>
                )}
              </div>
            </div>

            {/* Poster Info Card */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs text-amber-200">
              <div className="font-bold flex items-center gap-1.5 text-amber-300">
                <Award className="w-4 h-4" />
                <span>实名商企背书 · 传播赋能价值</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-200/90">
                海报由 HTML5 Canvas 实时离线高保真绘制，二维码内置专属 <strong>?merchant={merchant.id}</strong> 深度直通参数。海报图片可直接保存并发至微信群或朋友圈，合作方扫码即刻直通企业实名主页。
              </p>
            </div>

            {/* Mobile usage tip */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-sky-400 flex-shrink-0" />
              <span>手机端在右侧海报图片上<strong>长按</strong>，亦可直接选择“保存到手机相册”。</span>
            </div>
          </div>

          {/* Right Column: Live Poster Preview & Action Bar */}
          <div className="md:col-span-7 flex flex-col items-center justify-center space-y-4">
            <div className="w-full flex items-center justify-between px-1 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                <QrCode className="w-4 h-4 text-amber-400" />
                海报实时效果预览 (800 × 1280 高清)
              </span>
              {isGenerating ? (
                <span className="flex items-center gap-1 text-amber-400 text-[11px]">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  正在渲染 Canvas...
                </span>
              ) : (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 已完成高保真绘制
                </span>
              )}
            </div>

            {/* Canvas / Image Display Card */}
            <div className="relative w-full max-w-[360px] aspect-[800/1280] rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-2xl bg-slate-950 flex items-center justify-center group">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
                  <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
                  <span>正在生成专属名片海报...</span>
                </div>
              ) : posterDataUrl ? (
                <img
                  src={posterDataUrl}
                  alt={`${merchant.name} 专属名片海报`}
                  className="w-full h-full object-contain"
                />
              ) : null}
            </div>

            {/* Download & Copy Buttons */}
            <div className="w-full max-w-[360px] flex flex-col gap-2 pt-1">
              <button
                onClick={handleDownload}
                disabled={isGenerating || !posterDataUrl}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                <span>保存高清海报图片 (PNG 下载)</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleCopyImage}
                  disabled={isGenerating || !posterDataUrl}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    copiedImage
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                  title="复制图片到剪贴板或复制名片直达链接"
                >
                  {copiedImage ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>已复制海报图片!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>复制海报图片</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    const origin = typeof window !== 'undefined' ? window.location.origin : '';
                    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
                    const shareUrl = `${origin}${pathname}?merchant=${merchant.id}`;
                    navigator.clipboard?.writeText(shareUrl);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    copiedLink
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                >
                  {copiedLink ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>已复制链接!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>复制直达链接</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
