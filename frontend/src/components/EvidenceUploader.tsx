import { useState } from 'react';
import { apiClient } from '../api/client';

interface EvidenceUploaderProps {
  caseId: string;
  onSuccess?: () => void;
}

export default function EvidenceUploader({ caseId, onSuccess }: EvidenceUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceType, setEvidenceType] = useState<'SCREENSHOT' | 'VIDEO' | 'REPLAY' | 'LOG' | 'OTHER'>('SCREENSHOT');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fileInput = e.currentTarget.file as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (!file || !title) {
      alert('File and title are required');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('evidenceType', evidenceType);
    formData.append('uploadedById', 'cmqhc0zF000pu0d84hsovsc0'); // ← replace with real logged-in user ID later

    try {
      await apiClient.uploadEvidence(caseId, formData);
      alert('Evidence uploaded successfully!');
      setTitle('');
      setDescription('');
      onSuccess?.();
    } catch (error) {
      console.error(error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <h3 className="font-semibold text-lg">Upload Evidence</h3>

      <input
        type="text"
        placeholder="Title *"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 border rounded h-24"
      />

      <select
        value={evidenceType}
        onChange={(e) => setEvidenceType(e.target.value as any)}
        className="w-full p-2 border rounded"
      >
        <option value="SCREENSHOT">Screenshot</option>
        <option value="VIDEO">Video</option>
        <option value="REPLAY">Replay</option>
        <option value="LOG">Log File</option>
        <option value="OTHER">Other</option>
      </select>

      <input type="file" name="file" accept="image/*,video/*" required />

      <button
        type="submit"
        disabled={uploading}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Upload Evidence'}
      </button>
    </form>
  );
}