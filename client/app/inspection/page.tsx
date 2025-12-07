import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, CardContent, CardHeader, CardTitle,
  Button, Input, Label, Select, Badge
} from '../../components/ui-lib';
import {
  Camera, FileCheck,
  Loader2, Trash2, Plus, Image as ImageIcon,
  Wrench, ClipboardList, X, ZoomIn, ArrowRight
} from 'lucide-react';
import {
  ContainerType, FACE_LABELS,
  ContainerFaceKey, FaceData, DetectedDefect, ImageUpload
} from '../../types';
import { createInspection, analyzeDamage } from '../../lib/api';

const DEFAULT_FACES = Object.keys(FACE_LABELS).reduce((acc, key) => {
  acc[key as ContainerFaceKey] = {
    id: key,
    name: FACE_LABELS[key as ContainerFaceKey],
    images: [],
    defects: [],
    status: 'pending'
  };
  return acc;
}, {} as Record<ContainerFaceKey, FaceData>);

// --- Components ---

interface ImagePreviewModalProps {
  src: string | null;
  onClose: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ src, onClose }) => {
  if (!src) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 animate-fade-in" onClick={onClose}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
      >
        <X size={24} />
      </button>
      <div className="relative max-w-[90vw] max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <img src={src} alt="Preview" className="max-w-full max-h-[90vh] object-contain rounded shadow-2xl" />
      </div>
    </div>
  );
};

interface FaceCardProps {
  faceKey: ContainerFaceKey;
  label: string;
  face: FaceData;
  onTriggerUpload: (key: string) => void;
  onRemoveImage: (key: string, index: number) => void;
  onRemoveDefect: (key: string, defectId: string) => void;
  onAddDefect: (key: string) => void;
  onPreviewImage: (src: string) => void;
}

const FaceCard: React.FC<FaceCardProps> = ({
  faceKey,
  label,
  face,
  onTriggerUpload,
  onRemoveImage,
  onRemoveDefect,
  onAddDefect,
  onPreviewImage
}) => {
  const hasImages = face.images.length > 0;
  const isAnalyzing = face.status === 'analyzing';
  const defectCount = face.defects.length;

  return (
    <Card className={`flex flex-col h-full transition-all duration-200 ${hasImages ? 'border-blue-200 shadow-md' : 'border-slate-200 border-dashed'}`}>
      <CardHeader className="p-3 pb-2 bg-slate-50/50 border-b border-slate-100">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-sm text-slate-700">{label}</span>
          {defectCount > 0 && (
            <Badge variant="destructive" className="text-[10px] h-5 px-1.5">
              {defectCount} lỗi
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-3 flex-1 flex flex-col gap-3">
        {/* Image Area */}
        <div className="min-h-[120px] relative bg-slate-50 rounded-md overflow-hidden group border border-slate-100">
          {isAnalyzing && (
            <div className="absolute inset-0 z-20 bg-white/80 flex flex-col items-center justify-center text-blue-600">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <span className="text-xs font-medium animate-pulse">Đang phân tích...</span>
            </div>
          )}

          {hasImages ? (
            <div className="grid grid-cols-2 gap-2 p-2">
              {face.images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded overflow-hidden border border-slate-200 bg-black/5 cursor-zoom-in group/img"
                  onClick={() => onPreviewImage(img.previewUrl)}
                >
                  <img src={img.previewUrl} alt="preview" className="w-full h-full object-contain" />

                  <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                    <ZoomIn className="text-white drop-shadow-md" size={20} />
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); onRemoveImage(faceKey, idx); }}
                    className="absolute top-1 right-1 bg-white/90 text-red-500 rounded-full p-1 opacity-0 group-hover/img:opacity-100 transition-opacity shadow-sm hover:bg-red-50 z-10"
                    title="Xóa ảnh"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => onTriggerUpload(faceKey)}
                className="flex flex-col items-center justify-center border border-dashed border-slate-300 rounded aspect-square hover:bg-blue-50 hover:border-blue-400 transition-colors text-slate-400 hover:text-blue-500 bg-white"
                title="Thêm ảnh khác"
              >
                <Plus size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onTriggerUpload(faceKey)}
              className="w-full h-full flex flex-col items-center justify-center py-8 text-slate-400 hover:text-blue-500 hover:blue-50 transition-colors"
            >
              <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
              <span className="text-xs font-medium">Thêm ảnh</span>
            </button>
          )}
        </div>

        {defectCount > 0 && (
          <div className="space-y-1.5">
            {face.defects.map((d) => (
              <div key={d.id} className="flex items-start justify-between text-xs bg-red-50 p-1.5 rounded border border-red-100">
                <div className="flex-1">
                  <span className="font-bold text-red-700 mr-1">[{d.iiclCode}]</span>
                  <span className="text-slate-700 line-clamp-1" title={d.description}>{d.description}</span>
                </div>
                <button onClick={() => onRemoveDefect(faceKey, d.id)} className="text-slate-400 hover:text-red-500 ml-1">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-auto pt-2">
          {face.status === 'completed' && defectCount === 0 && (
            <div className="flex items-center justify-center p-2 bg-green-50 rounded text-xs text-green-700 border border-green-100 mb-2">
              <FileCheck className="h-3 w-3 mr-1.5" /> Không phát hiện lỗi
            </div>
          )}

          {(hasImages || face.status === 'completed') && (
            <button
              onClick={() => onAddDefect(faceKey)}
              className="w-full flex items-center justify-center px-2 py-1.5 text-xs border border-dashed border-slate-300 rounded text-slate-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all"
            >
              <Wrench className="h-3 w-3 mr-1.5" />
              Thêm lỗi thủ công
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const Inspection = () => {
  const navigate = useNavigate();
  const [uploadTarget, setUploadTarget] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzingGlobal, setIsAnalyzingGlobal] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [containerNo, setContainerNo] = useState('');
  const [containerType, setContainerType] = useState<ContainerType>(ContainerType.GP20);
  const [owner, setOwner] = useState('');
  const [faces, setFaces] = useState<Record<ContainerFaceKey, FaceData>>(DEFAULT_FACES);

  const allDefects = (Object.entries(faces) as [string, FaceData][]).flatMap(([key, face]) =>
    face.defects.map(d => ({
      ...d,
      faceName: FACE_LABELS[key as ContainerFaceKey],
      faceKey: key
    }))
  );

  const triggerUpload = (faceKey: string) => {
    setUploadTarget(faceKey);
    setTimeout(() => fileInputRef.current?.click(), 0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && uploadTarget) {
      const newImageUploads: ImageUpload[] = Array.from(files).map((file: File) => ({
        file,
        previewUrl: URL.createObjectURL(file as Blob)
      }));

      setFaces(prev => ({
        ...prev,
        [uploadTarget]: {
          ...prev[uploadTarget as ContainerFaceKey],
          images: [...prev[uploadTarget as ContainerFaceKey].images, ...newImageUploads],
          status: 'pending'
        }
      }));
    }
    if (e.target) e.target.value = '';
    setUploadTarget(null);
  };

  const removeImage = (faceKey: string, index: number) => {
    setFaces(prev => {
      const face = prev[faceKey as ContainerFaceKey];
      const newImages = [...face.images];
      const removedImage = newImages.splice(index, 1);
      // Revoke the object URL to prevent memory leaks
      if (removedImage.length > 0) {
        URL.revokeObjectURL(removedImage[0].previewUrl);
      }
      return {
        ...prev,
        [faceKey]: { ...face, images: newImages }
      };
    });
  };

  const removeDefect = (faceKey: string, defectId: string) => {
    setFaces(prev => ({
      ...prev,
      [faceKey]: {
        ...prev[faceKey as ContainerFaceKey],
        defects: prev[faceKey as ContainerFaceKey].defects.filter(d => d.id !== defectId)
      }
    }));
  };

  const handleAddDefect = (faceKey: string) => {
    const newDefect: DetectedDefect = {
      id: `manual_${Date.now()}`,
      iiclCode: 'MAN',
      description: 'Lỗi ghi nhận thủ công',
      location: 'Khác',
      severity: 'Vừa',
      confidence: 1.0
    };

    setFaces(prev => ({
      ...prev,
      [faceKey]: {
        ...prev[faceKey as ContainerFaceKey],
        status: 'completed',
        defects: [...prev[faceKey as ContainerFaceKey].defects, newDefect]
      }
    }));
  };

  const runGlobalAnalysis = async () => {
    setIsAnalyzingGlobal(true);
    const facesToAnalyze = Object.keys(faces).filter(key =>
      faces[key as ContainerFaceKey].images.length > 0 && faces[key as ContainerFaceKey].status !== 'completed'
    ) as ContainerFaceKey[];

    if (facesToAnalyze.length === 0) {
      alert("Vui lòng tải ảnh lên hoặc đảm bảo có mặt container chưa được phân tích.");
      setIsAnalyzingGlobal(false);
      return;
    }

    setFaces(prev => {
      const next = { ...prev };
      facesToAnalyze.forEach(key => {
        next[key] = { ...next[key], status: 'analyzing', defects: [] };
      });
      return next;
    });

    try {
      await Promise.all(facesToAnalyze.map(async (key) => {
        const face = faces[key as ContainerFaceKey];
        const files = face.images.map(img => img.file);

        try {
          const resultDefects = await analyzeDamage(files);

          // The AI might return an object with a "data" property, or just the array. Be flexible.
          const rawDefects = Array.isArray(resultDefects) ? resultDefects : [];

          const defects: DetectedDefect[] = rawDefects.map((d, index) => ({
            id: `ai_${key}_${Date.now()}_${index}`,
            iiclCode: d.type || 'OT',
            description: d.size, // Map size from AI to description for display
            location: d.location,
            severity: d.severity,
            confidence: d.confidence || 0.9, // Assign a default confidence if not provided
          }));

          setFaces(prev => ({
            ...prev,
            [key]: { ...prev[key], defects, status: 'completed' }
          }));
        } catch (error) {
          console.error(`Error analyzing face ${key}:`, error);
          setFaces(prev => ({
            ...prev,
            [key]: { ...prev[key], status: 'failed' } // Optional: Add a 'failed' status for better UI feedback
          }));
        }
      }));
    } catch (e) {
      console.error("Global analysis error", e);
      alert(`Đã xảy ra lỗi trong quá trình phân tích: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setIsAnalyzingGlobal(false);
    }
  };

  const handleSave = async () => {
    if (!containerNo) {
      alert("LƯU Ý: Vui lòng nhập 'Số Container' trước khi lưu kết quả.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('containerId', containerNo);
    formData.append('containerType', containerType);
    formData.append('owner', owner || 'Unknown');

    /* eslint-disable  no-explicit-any */
    const allDefects = Object.values(faces).flatMap(f => f.defects);
    const sanitizedDefects = allDefects.map(d => ({
      location: d.location,
      type: d.iiclCode,
      severity: d.severity,
      size: d.description, // Frontend's description is the AI's size
    }));
    formData.append('damages', JSON.stringify(sanitizedDefects));

    let imageCount = 0;
    for (const faceKey in faces) {
      const face = faces[faceKey as ContainerFaceKey];
      for (const image of face.images) {
        formData.append('images', image.file);
        imageCount++;
      }
    }

    if (imageCount === 0) {
      alert("Vui lòng tải lên ít nhất một hình ảnh.");
      setIsSubmitting(false);
      return;
    }

    try {
      const savedInspection = await createInspection(formData);
      console.log('Inspection saved successfully:', savedInspection);

      // TODO: Decide navigation logic. Do we still create a quotation draft automatically?
      // For now, navigate to history page on success.
      alert('Giám định đã được lưu thành công! Chuyển hướng đến trang tạo báo giá.');
      navigate(`/bao-gia/chi-tiet?inspectionId=${savedInspection._id}`);

    } catch (error) {
      console.error('Failed to save inspection:', error);
      alert(`Lỗi khi lưu giám định: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto p-4 space-y-6">
      <ImagePreviewModal src={previewImage} onClose={() => setPreviewImage(null)} />

      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm sticky top-[70px] z-40">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Giám định Container</h2>
          <p className="text-sm text-slate-500">Tải ảnh các mặt và chạy phân tích AI</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleFileChange}
          />

          <Button variant="outline" onClick={() => navigate('/')} disabled={isSubmitting}>Hủy</Button>

          <Button
            onClick={runGlobalAnalysis}
            disabled={isAnalyzingGlobal || isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isAnalyzingGlobal ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
            {isAnalyzingGlobal ? 'Đang giám định...' : 'Giám định'}
          </Button>

          <Button
            onClick={handleSave}
            disabled={isAnalyzingGlobal || isSubmitting || !containerNo}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
            {isSubmitting ? 'Đang lưu...' : 'Lưu & Hoàn tất'}
          </Button>
        </div>
      </div>

      {/* Container Info */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="mb-1 block text-xs uppercase text-slate-500 font-bold">Số Container <span className="text-red-500">*</span></Label>
              <Input
                value={containerNo}
                onChange={e => setContainerNo(e.target.value.toUpperCase())}
                placeholder="VD: MSKU1234567"
                className={`font-mono font-medium ${!containerNo ? 'border-red-300 focus-visible:ring-red-200' : ''}`}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label className="mb-1 block text-xs uppercase text-slate-500 font-bold">Loại</Label>
              <Select value={containerType} onChange={e => setContainerType(e.target.value as ContainerType)} disabled={isSubmitting}>
                {Object.values(ContainerType).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label className="mb-1 block text-xs uppercase text-slate-500 font-bold">Hãng tàu / Chủ khai thác</Label>
              <Input
                value={owner}
                onChange={e => setOwner(e.target.value)}
                placeholder="VD: MAERSK"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label className="mb-1 block text-xs uppercase text-slate-500 font-bold">Ngày giám định</Label>
              <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} disabled className="bg-slate-50" />
            </div>
          </div>
        </CardContent>
      </Card>

      {allDefects.length > 0 && (
        <Card className="border-orange-200 shadow-sm bg-orange-50/30 animate-fade-in">
          <CardHeader className="pb-2 border-b border-orange-100 bg-orange-50/50 rounded-t-xl">
            <CardTitle className="text-lg text-orange-800 flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Tóm tắt hư hỏng ({allDefects.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white text-slate-600 font-semibold border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-3 w-12 text-center">#</th>
                    <th className="px-4 py-3">Khu vực</th>
                    <th className="px-4 py-3 w-24">Mã IICL</th>
                    <th className="px-4 py-3">Mô tả hư hỏng</th>
                    <th className="px-4 py-3">Vị trí chi tiết</th>
                    <th className="px-4 py-3 w-32">Mức độ</th>
                    <th className="px-4 py-3 w-16 text-center">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {allDefects.map((d, idx) => (
                    <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-2 text-center text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-2 font-medium text-slate-700">{d.faceName}</td>
                      <td className="px-4 py-2 font-bold text-red-600">
                        <span className="bg-red-50 px-2 py-1 rounded border border-red-100 block w-fit">{d.iiclCode}</span>
                      </td>
                      <td className="px-4 py-2 text-slate-800">{d.description}</td>
                      <td className="px-4 py-2 text-slate-500 text-xs font-mono">{d.location}</td>
                      <td className="px-4 py-2">
                        <Badge variant={d.severity === 'Nặng' ? 'destructive' : d.severity === 'Vừa' ? 'warning' : 'default'}>
                          {d.severity}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => removeDefect(d.faceKey, d.id)}
                          className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded transition-colors"
                          title="Xóa lỗi này"
                          disabled={isSubmitting}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid Layout for Faces */}
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full inline-block"></span>
            Mặt Ngoài (External)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.keys(DEFAULT_FACES).filter(k => k.startsWith('ext_')).map(key => (
              <FaceCard
                key={key}
                faceKey={key as ContainerFaceKey}
                label={FACE_LABELS[key as ContainerFaceKey].replace('Ngoài - ', '')}
                face={faces[key as ContainerFaceKey]}
                onTriggerUpload={triggerUpload}
                onRemoveImage={removeImage}
                onRemoveDefect={removeDefect}
                onAddDefect={handleAddDefect}
                onPreviewImage={setPreviewImage}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full inline-block"></span>
            Mặt Trong (Internal)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.keys(DEFAULT_FACES).filter(k => k.startsWith('int_')).map(key => (
              <FaceCard
                key={key}
                faceKey={key as ContainerFaceKey}
                label={FACE_LABELS[key as ContainerFaceKey].replace('Trong - ', '')}
                face={faces[key as ContainerFaceKey]}
                onTriggerUpload={triggerUpload}
                onRemoveImage={removeImage}
                onRemoveDefect={removeDefect}
                onAddDefect={handleAddDefect}
                onPreviewImage={setPreviewImage}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inspection;