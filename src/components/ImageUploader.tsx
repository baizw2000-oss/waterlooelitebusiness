import React, { useRef, useState } from 'react';
import { 
  Upload, 
  Link2, 
  Trash2, 
  Building2, 
  User, 
  Sparkles 
} from 'lucide-react';
import { MerchantAvatar } from './MerchantAvatar';
import { useLanguage } from '../i18n/LanguageContext';

interface ImageUploaderProps {
  value: string;
  onChange: (val: string) => void;
  entityType: 'company' | 'individual';
  onEntityTypeChange: (type: 'company' | 'individual') => void;
  name?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  entityType,
  onEntityTypeChange,
  name,
}) => {
  const { isEn, t } = useLanguage();
  const displayName = name || t('商户', 'Enterprise');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [inputUrl, setInputUrl] = useState(value && value.startsWith('http') ? value : '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const INDIVIDUAL_PRESETS = [
    {
      name: t('商务精英 1', 'Executive 1'),
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: t('金融顾问 2', 'Advisor 2'),
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: t('资深经纪 3', 'Director 3'),
      url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: t('执业专家 4', 'Partner 4'),
      url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    },
  ];

  const COMPANY_PRESETS = [
    {
      name: t('金色徽标', 'Gold Emblem'),
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: t('现代科技', 'Modern Tech'),
      url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: t('金融财富', 'Wealth & Capital'),
      url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: t('卓越建筑', 'Architecture'),
      url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=300&q=80',
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg(t('请选择有效的图片文件（JPG, PNG, WebP）', 'Please select a valid image file (JPG, PNG, WebP).'));
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 320;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          onChange(compressedDataUrl);
          setIsProcessing(false);
        } else {
          onChange(event.target?.result as string);
          setIsProcessing(false);
        }
      };
      img.onerror = () => {
        setErrorMsg(t('图片解析失败，请尝试其他图片', 'Failed to decode image. Please try another file.'));
        setIsProcessing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setErrorMsg(t('文件读取失败', 'Unable to read selected file.'));
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    onChange(inputUrl.trim());
  };

  const handleClearImage = () => {
    onChange('');
    setInputUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isIndividual = entityType === 'individual';
  const presets = isIndividual ? INDIVIDUAL_PRESETS : COMPANY_PRESETS;

  return (
    <div className="space-y-3 p-4 rounded-2xl bg-[#F7F7F5] border border-[#E8E6DF] text-xs text-[#0F172A]">
      {/* 1. Entity Type Switcher */}
      <div>
        <label className="block text-[#0F172A] font-bold mb-1.5 flex items-center justify-between gap-2 flex-wrap">
          <span>{t('商户性质与形象分类 *', 'Entity Classification & Visual Identity *')}</span>
          <span className="text-[11px] font-normal text-slate-500">
            {isIndividual
              ? t('个人将重点展示个人照片', 'Profiles display executive portrait')
              : t('企业将重点展示品牌Logo', 'Profiles display corporate logo')}
          </span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onEntityTypeChange('company')}
            className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition-all ${
              !isIndividual
                ? 'bg-[#0F172A] border-[#C5A059] text-[#DFBA73] font-bold shadow-sm'
                : 'bg-white border-[#E8E6DF] text-slate-600 hover:border-[#C5A059]/60 hover:text-[#0F172A]'
            }`}
          >
            <Building2 className="w-4 h-4 text-inherit" />
            <span>{t('企业商户 (上传企业 Logo)', 'Corporate (Brand Logo)')}</span>
          </button>

          <button
            type="button"
            onClick={() => onEntityTypeChange('individual')}
            className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition-all ${
              isIndividual
                ? 'bg-[#0F172A] border-[#C5A059] text-[#DFBA73] font-bold shadow-sm'
                : 'bg-white border-[#E8E6DF] text-slate-600 hover:border-[#C5A059]/60 hover:text-[#0F172A]'
            }`}
          >
            <User className="w-4 h-4 text-inherit" />
            <span>{t('个人 / 专家 (上传个人照片)', 'Practitioner (Portrait)')}</span>
          </button>
        </div>
      </div>

      {/* 2. Live Preview and Upload Tabs */}
      <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
        {/* Live Preview Box */}
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
          <MerchantAvatar
            merchant={{
              name: displayName,
              logo: value,
              entityType,
            }}
            size="lg"
            showBadge={true}
          />
          <span className="text-[10px] text-slate-500 font-medium">
            {isIndividual
              ? t('个人照片预览', 'Portrait Preview')
              : t('企业Logo预览', 'Logo Preview')}
          </span>
        </div>

        {/* Upload Controls */}
        <div className="flex-1 w-full space-y-2">
          {/* Method Tabs */}
          <div className="flex items-center gap-1 border-b border-[#E8E6DF] pb-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                activeTab === 'upload'
                  ? 'bg-[#0F172A] text-[#DFBA73] border border-[#0F172A]'
                  : 'text-slate-600 hover:text-[#0F172A] hover:bg-white'
              }`}
            >
              <Upload className="w-3 h-3" />
              {t('本地相册/文件', 'Upload File')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                activeTab === 'url'
                  ? 'bg-[#0F172A] text-[#DFBA73] border border-[#0F172A]'
                  : 'text-slate-600 hover:text-[#0F172A] hover:bg-white'
              }`}
            >
              <Link2 className="w-3 h-3" />
              {t('图片网络链接', 'Image URL')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                activeTab === 'presets'
                  ? 'bg-[#0F172A] text-[#DFBA73] border border-[#0F172A]'
                  : 'text-slate-600 hover:text-[#0F172A] hover:bg-white'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              {t('精选图库预设', 'Presets')}
            </button>

            {value && (
              <button
                type="button"
                onClick={handleClearImage}
                className="ml-auto text-rose-600 hover:text-rose-700 p-1 flex items-center gap-0.5 text-[11px] font-medium"
                title={t('清除图片', 'Remove image')}
              >
                <Trash2 className="w-3 h-3" />
                <span>{t('清除', 'Clear')}</span>
              </button>
            )}
          </div>

          {/* Tab 1: Local File Upload */}
          {activeTab === 'upload' && (
            <div className="space-y-1.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="merchant-image-upload"
              />
              <label
                htmlFor="merchant-image-upload"
                className="flex items-center justify-center gap-2 w-full p-2.5 border border-dashed border-[#D6D3C9] hover:border-[#C5A059] rounded-xl bg-white cursor-pointer text-[#0F172A] hover:bg-[#FDFCF9] transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-[#9E7425]" />
                <span className="text-xs font-medium">
                  {isProcessing
                    ? t('正在处理并自适应压缩图片...', 'Optimizing image...')
                    : value
                    ? isIndividual
                      ? t('更换个人照片', 'Replace Portrait')
                      : t('更换企业Logo', 'Replace Logo')
                    : isIndividual
                    ? t('点击选择个人照片 (JPG/PNG)', 'Select Executive Portrait (JPG/PNG)')
                    : t('点击选择企业Logo (JPG/PNG)', 'Select Corporate Logo (JPG/PNG)')}
                </span>
              </label>
              <p className="text-[10px] text-slate-500 leading-tight">
                {t(
                  '支持手机相册照片或电脑本地文件，系统自动进行高清无损压制与保全。',
                  'Automatically optimized for crisp high-DPI display and cloud storage.'
                )}
              </p>
            </div>
          )}

          {/* Tab 2: Image URL input */}
          {activeTab === 'url' && (
            <form onSubmit={handleApplyUrl} className="flex gap-1.5">
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder={
                  isIndividual
                    ? t('输入个人照片URL (https://...)', 'Portrait image URL (https://...)')
                    : t('输入企业Logo URL (https://...)', 'Corporate logo URL (https://...)')
                }
                className="flex-1 px-3 py-1.5 bg-white border border-[#E8E6DF] rounded-lg text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059] text-xs"
              />
              <button
                type="submit"
                className="px-3 py-1.5 gold-gradient text-[#0F172A] font-bold rounded-lg text-xs shadow-sm"
              >
                {t('确定', 'Apply')}
              </button>
            </form>
          )}

          {/* Tab 3: Presets */}
          {activeTab === 'presets' && (
            <div className="grid grid-cols-4 gap-1.5">
              {presets.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => onChange(preset.url)}
                  className={`relative p-1 rounded-xl border overflow-hidden flex flex-col items-center gap-1 transition-all ${
                    value === preset.url
                      ? 'border-[#C5A059] ring-2 ring-[#C5A059]/30 bg-[#FFFDF7]'
                      : 'border-[#E8E6DF] bg-white hover:border-[#C5A059]/50'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className={`w-10 h-10 object-cover ${isIndividual ? 'rounded-full' : 'rounded-lg'}`}
                  />
                  <span className="text-[10px] text-[#0F172A] truncate w-full text-center font-medium">
                    {preset.name}
                  </span>
                  {value === preset.url && (
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#C5A059] text-[#0F172A] flex items-center justify-center text-[8px] font-bold">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {errorMsg && (
            <p className="text-[10px] text-rose-600 font-medium">{errorMsg}</p>
          )}
        </div>
      </div>
    </div>
  );
};
