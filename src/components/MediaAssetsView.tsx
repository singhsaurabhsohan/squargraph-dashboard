import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Video,
  FileText,
  Trash2,
  Download,
  Copy,
  Check,
  Film,
  Sparkles,
  ExternalLink,
  Eye,
  Filter,
} from 'lucide-react';
import { MediaAsset } from '../types';

const INITIAL_MEDIA_ASSETS: MediaAsset[] = [
  {
    id: 'asset-1',
    name: 'film1.webp',
    url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
    type: 'image',
    sizeFormatted: '184 KB',
    uploadedAt: 'Today, 11:20 AM',
    uploadedBy: 'Saurabh Singh',
    dimensions: '1920 × 1080',
    mimeType: 'image/webp',
  },
  {
    id: 'asset-2',
    name: 'squargraph-brand-showreel.mp4',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    type: 'video',
    sizeFormatted: '4.2 MB',
    uploadedAt: 'Yesterday, 04:45 PM',
    uploadedBy: 'Studio Creative Lead',
    duration: '0:15',
    mimeType: 'video/mp4',
  },
  {
    id: 'asset-3',
    name: 'brand-guidelines-2026.pdf',
    url: 'https://squargraph.com/assets/brand-guidelines.pdf',
    type: 'document',
    sizeFormatted: '1.8 MB',
    uploadedAt: '12 Sep 2026',
    uploadedBy: 'Priya Verma',
    mimeType: 'application/pdf',
  },
  {
    id: 'asset-4',
    name: 'studio-architectural-series.webp',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    type: 'image',
    sizeFormatted: '290 KB',
    uploadedAt: '10 Sep 2026',
    uploadedBy: 'Saurabh Singh',
    dimensions: '2400 × 1600',
    mimeType: 'image/webp',
  },
];

interface MediaAssetsViewProps {
  onInsertAssetToSection?: (url: string) => void;
}

export const MediaAssetsView: React.FC<MediaAssetsViewProps> = ({ onInsertAssetToSection }) => {
  const [assets, setAssets] = useState<MediaAsset[]>(INITIAL_MEDIA_ASSETS);
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'document'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = assets.filter((a) => filterType === 'all' || a.type === filterType);

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newItems: MediaAsset[] = [];

    Array.from(files).forEach((file) => {
      const isVideo = file.type.startsWith('video');
      const isImg = file.type.startsWith('image');
      const type: MediaAsset['type'] = isVideo ? 'video' : isImg ? 'image' : 'document';
      const sizeKB = Math.round(file.size / 1024);
      const sizeFormatted = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;

      // Create blob preview URL
      const blobUrl = URL.createObjectURL(file);

      newItems.push({
        id: `asset-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: file.name,
        url: blobUrl,
        type,
        sizeFormatted,
        uploadedAt: 'Just now',
        uploadedBy: 'Saurabh Singh',
        mimeType: file.type || 'application/octet-stream',
        dimensions: isImg ? '1920 × 1080 (auto)' : undefined,
        duration: isVideo ? '0:30' : undefined,
      });
    });

    setAssets((prev) => [...newItems, ...prev]);
  };

  const handleCopyUrl = (asset: MediaAsset) => {
    navigator.clipboard.writeText(asset.url);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDelete = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
    if (previewAsset?.id === id) setPreviewAsset(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d0f0c] text-neutral-200 overflow-y-auto font-sans p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#232720]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Digital Media & Asset Storage</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-lime-950/70 text-lime-400 border border-lime-800/60 uppercase">
              Cloudflare R2 / S3 Storage
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Upload, optimize, and serve high-resolution imagery, brand videos, and documents to your edge sites.
          </p>
        </div>

        {/* Upload Button */}
        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileUpload(e.target.files)}
            multiple
            accept="image/*,video/*,application/pdf"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-lg font-bold text-xs text-black bg-[#e8ff75] hover:bg-[#dcfa5a] flex items-center gap-2 shadow-sm transition-all"
          >
            <Upload size={14} /> Upload Files / Video
          </button>
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFileUpload(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`mt-6 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-[#e8ff75] bg-lime-950/20'
            : 'border-[#262c20] hover:border-[#384230] bg-[#121510]'
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-[#1b2016] border border-[#2b3323] flex items-center justify-center mx-auto text-[#e8ff75] mb-3">
          <Upload size={20} />
        </div>
        <p className="text-sm font-semibold text-neutral-200">
          Drag and drop images, MP4 videos, or documents here, or click to browse
        </p>
        <p className="text-xs text-neutral-500 mt-1">
          Supports WebP, PNG, JPEG, SVG, MP4, MOV, and PDF (Max 100MB per file)
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mt-8 mb-4">
        {(['all', 'image', 'video', 'document'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
              filterType === type
                ? 'bg-[#e8ff75] text-black'
                : 'bg-[#161913] text-neutral-400 hover:text-white border border-[#232720]'
            }`}
          >
            {type}s
          </button>
        ))}
        <span className="text-xs text-neutral-500 ml-auto font-mono">
          Showing {filtered.length} asset{filtered.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Asset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((asset) => (
          <div
            key={asset.id}
            className="group relative rounded-xl border border-[#232720] bg-[#141712] overflow-hidden hover:border-[#3d4734] transition-all flex flex-col"
          >
            {/* Asset Preview Frame */}
            <div className="h-44 bg-[#0d0f0c] relative flex items-center justify-center overflow-hidden">
              {asset.type === 'image' ? (
                <img
                  src={asset.url}
                  alt={asset.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : asset.type === 'video' ? (
                <div className="w-full h-full bg-neutral-900 flex flex-col items-center justify-center p-4">
                  <Film size={36} className="text-[#e8ff75] mb-2" />
                  <span className="text-xs text-neutral-400 font-mono">{asset.duration || 'Video'}</span>
                </div>
              ) : (
                <div className="w-full h-full bg-neutral-900 flex flex-col items-center justify-center p-4">
                  <FileText size={36} className="text-blue-400 mb-2" />
                  <span className="text-xs text-neutral-400 font-mono">PDF Doc</span>
                </div>
              )}

              {/* Hover Overlay Controls */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => setPreviewAsset(asset)}
                  className="p-2 rounded-lg bg-black/80 text-white hover:bg-neutral-800 text-xs font-semibold"
                  title="View Preview"
                >
                  <Eye size={14} />
                </button>
                <button
                  onClick={() => handleCopyUrl(asset)}
                  className="p-2 rounded-lg bg-black/80 text-white hover:bg-neutral-800 text-xs font-semibold"
                  title="Copy Canonical URL"
                >
                  {copiedId === asset.id ? <Check size={14} className="text-lime-400" /> : <Copy size={14} />}
                </button>
                <button
                  onClick={() => handleDelete(asset.id)}
                  className="p-2 rounded-lg bg-rose-950/80 text-rose-300 hover:bg-rose-900 text-xs font-semibold"
                  title="Delete Asset"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Asset Info Card */}
            <div className="p-3 flex-1 flex flex-col justify-between">
              <div>
                <p className="font-semibold text-xs text-white truncate" title={asset.name}>
                  {asset.name}
                </p>
                <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-1 font-mono">
                  <span>{asset.sizeFormatted}</span>
                  <span>{asset.dimensions || asset.duration || 'File'}</span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-[#1f231b] flex items-center justify-between text-[10px] text-neutral-500">
                <span>{asset.uploadedAt}</span>
                <button
                  onClick={() => handleCopyUrl(asset)}
                  className="text-lime-400 hover:underline flex items-center gap-1 font-mono"
                >
                  {copiedId === asset.id ? 'Copied!' : 'Copy URL'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Preview */}
      {previewAsset && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setPreviewAsset(null)}
        >
          <div
            className="bg-[#141712] border border-[#2e3627] rounded-2xl max-w-3xl w-full p-6 text-neutral-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#232720]">
              <div>
                <h3 className="font-bold text-white text-base">{previewAsset.name}</h3>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">
                  {previewAsset.mimeType} · {previewAsset.sizeFormatted}
                </p>
              </div>
              <button
                onClick={() => setPreviewAsset(null)}
                className="text-neutral-400 hover:text-white text-sm"
              >
                ✕ Close
              </button>
            </div>

            <div className="my-6 max-h-[60vh] flex items-center justify-center bg-black/60 rounded-xl overflow-hidden p-2">
              {previewAsset.type === 'image' ? (
                <img
                  src={previewAsset.url}
                  alt={previewAsset.name}
                  className="max-h-[55vh] object-contain rounded-lg"
                />
              ) : previewAsset.type === 'video' ? (
                <video controls className="max-h-[55vh] w-full rounded-lg">
                  <source src={previewAsset.url} type={previewAsset.mimeType} />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="p-12 text-center">
                  <FileText size={48} className="text-blue-400 mx-auto mb-3" />
                  <p className="text-sm text-neutral-300">Document preview ready</p>
                  <a
                    href={previewAsset.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-lg bg-lime-400 text-black text-xs font-bold"
                  >
                    <ExternalLink size={13} /> Open in New Tab
                  </a>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-neutral-500 font-mono truncate max-w-md">
                {previewAsset.url}
              </span>
              <button
                onClick={() => handleCopyUrl(previewAsset)}
                className="px-4 py-2 rounded-lg bg-[#e8ff75] text-black text-xs font-bold hover:bg-[#dcfa5a]"
              >
                {copiedId === previewAsset.id ? 'Copied CDN Link!' : 'Copy CDN URL'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
