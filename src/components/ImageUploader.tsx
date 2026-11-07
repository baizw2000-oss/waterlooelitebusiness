import React, { useRef, useState } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Link2, 
  Trash2, 
  Building2, 
  User, 
  Check, 
  Sparkles 
} from 'lucide-react';
import { MerchantAvatar } from './MerchantAvatar';

interface ImageUploaderProps {
  value: string;
  onChange: (val: string) => void;
  entityType: 'company' | 'individual';
  onEntityTypeChange: (type: 'company' | 'individual') => void;
  name?: string;
}

// Preset photo options for individual and company
const INDIVIDUAL_PRESETS = [
  {
    name: '商务精英 1',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: '金融顾问 2',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: '资深经纪 3',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: '执业专家 4',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  },
];

const COMPANY_PRESETS = [
  {
    name: '金色徽标',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: '现代科技',
    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: '金融财富',
    url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: '卓越建筑',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=300&q=80',
  },
];

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  entityType,
  onEntityTypeChange,
  name = '商户',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [inputUrl, setInputUrl] = useState(value && value.startsWith('http') ? value : '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle local image file upload with client-side canvas compression (<80KB)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('请选择有效的图片文件（JPG, PNG, WebP）');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize to maximum 320x320 for ultra-crisp display and compact Firestore storage
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
        setErrorMsg('图片解析失败，请尝试其他图片');
        setIsProcessing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setErrorMsg('文件读取失败');
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
    <div className="space-y-3 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs">
      {/* 1. Entity Type Switcher */}
      <div>
        <label className="block text-slate-300 font-semibold mb-1.5 flex items-center justify-between">
          <span>商户性质与形象分类 *</span>
          <span className="text-[11px] font-normal text-slate-400">
            {isIndividual ? '个人将重点展示个人照片' : '企业将重点展示品牌Logo'}
          </span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onEntityTypeChange('company')}
            className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition-all ${
              !isIndividual
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold shadow-sm'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4 text-inherit" />
            <span>企业商户 (上传企业 Logo)</span>
          </button>

          <button
            type="button"
            onClick={() => onEntityTypeChange('individual')}
            className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition-all ${
              isIndividual
                ? 'bg-blue-500/20 border-blue-500/60 text-blue-300 font-bold shadow-sm'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4 text-inherit" />
            <span>个人 / 专家 (上传个人照片)</span>
          </button>
        </div>
      </div>

      {/* 2. Live Preview and Upload Tabs */}
      <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
        {/* Live Preview Box */}
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
          <MerchantAvatar
            merchant={{
              name,
              logo: value,
              entityType,
            }}
            size="lg"
            showBadge={true}
          />
          <span className="text-[10px] text-slate-400 font-medium">
            {isIndividual ? '个人照片预览' : '企业Logo预览'}
          </span>
        </div>

        {/* Upload Controls */}
        <div className="flex-1 w-full space-y-2">
          {/* Method Tabs */}
          <div className="flex items-center gap-1 border-b border-slate-800 pb-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                activeTab === 'upload'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-3 h-3" />
              本地相册/文件
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                activeTab === 'url'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Link2 className="w-3 h-3" />
              图片网络链接
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                activeTab === 'presets'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              精选图库预设
            </button>

            {value && (
              <button
                type="button"
                onClick={handleClearImage}
                className="ml-auto text-rose-400 hover:text-rose-300 p-1 flex items-center gap-0.5 text-[11px]"
                title="清除图片"
              >
                <Trash2 className="w-3 h-3" />
                <span>清除</span>
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
                className="flex items-center justify-center gap-2 w-full p-2.5 border border-dashed border-slate-700 hover:border-amber-400/70 rounded-xl bg-slate-900/80 cursor-pointer text-slate-300 hover:text-white transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-medium">
                  {isProcessing
                    ? '正在处理并自适应压缩图片...'
                    : value
                    ? `更换${isIndividual ? '个人照片' : '企业Logo'}`
                    : `点击选择${isIndividual ? '个人照片' : '企业Logo'} (JPG/PNG)`}
                </span>
              </label>
              <p className="text-[10px] text-slate-500 leading-tight">
                支持手机相册照片或电脑本地文件，系统自动进行高清无损压制与保全。
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
                placeholder={isIndividual ? "输入个人照片URL (https://...)" : "输入企业Logo URL (https://...)"}
                className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-xs"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs"
              >
                确定
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
                      ? 'border-amber-400 ring-2 ring-amber-400/40 bg-amber-950/30'
                      : 'border-slate-750 bg-slate-900 hover:border-slate-600'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className={`w-10 h-10 object-cover ${isIndividual ? 'rounded-full' : 'rounded-lg'}`}
                  />
                  <span className="text-[10px] text-slate-300 truncate w-full text-center">
                    {preset.name}
                  </span>
                  {value === preset.url && (
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[8px] font-bold">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {errorMsg && (
            <p className="text-[10px] text-rose-400 font-medium">{errorMsg}</p>
          )}
        </div>
      </div>
    </div>
  );
};
