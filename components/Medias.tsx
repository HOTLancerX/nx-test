"use client"
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Dialog } from '@headlessui/react';

interface MediasProps {
  multiple?: boolean;
  value?: string | string[];
  onChange?: (e: { target: { value: string | string[] } }) => void;
  children?: React.ReactNode;
}

export default function Medias({ multiple = false, value, onChange, children }: MediasProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'upload' | 'url'>('list');
  const [selectedMedias, setSelectedMedias] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const searchParams = useSearchParams();
  const postId = searchParams.get('id');

  useEffect(() => {
    if (value) {
      setSelectedMedias(Array.isArray(value) ? value : [value]);
    }
  }, [value]);

  useEffect(() => {
    if (isOpen) {
      fetchMediaList();
    }
  }, [searchTerm, isOpen]);

  const fetchMediaList = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/media?search=${searchTerm}`);
      const data = await res.json();
      setMediaList(data.media);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectMedia = (url: string) => {
    if (multiple) {
      setSelectedMedias(prev => 
        prev.includes(url) 
          ? prev.filter(item => item !== url) 
          : [...prev, url]
      );
    } else {
      setSelectedMedias([url]);
    }
  };

  const handleInsertMedia = () => {
    if (onChange) {
      onChange({
        target: {
          value: multiple ? selectedMedias : selectedMedias[0] || ''
        }
      });
    }
    setIsOpen(false);
  };

  const handleUrlUpload = async () => {
    if (!urlInput.trim()) return;
    
    const urls = urlInput.split('\n').filter(url => url.trim());
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          urls,
          postId: postId || undefined 
        }),
      });
      
      if (res.ok) {
        setUrlInput('');
        fetchMediaList();
        setActiveTab('list');
      }
    } catch (error) {
      console.error('Error uploading URLs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleFileUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsLoading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      const validFiles = [];
      
      // Validate files before upload
      for (const file of selectedFiles) {
        const MAX_SIZE = 20 * 1024 * 1024; // 20MB
        if (file.size > MAX_SIZE) {
          alert(`Skipping ${file.name}: File exceeds 20MB limit`);
          continue;
        }
        validFiles.push(file);
        formData.append('files', file);
      }

      if (postId) {
        formData.append('postId', postId);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      try {
        const response = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Upload failed');
        }

        const data = await response.json();

        if (data.errors && data.errors.length > 0) {
          alert(`Some files failed to upload:\n${data.errors.join('\n')}`);
        }

        if (data.urls && data.urls.length > 0) {
          if (onChange) {
            onChange({
              target: {
                value: multiple 
                  ? [...selectedMedias, ...data.urls] 
                  : data.urls[0] || ''
              }
            });
          }
          setSelectedFiles([]);
          fetchMediaList();
          setActiveTab('list');
        }
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-2">
      {/* Preview area */}
      <div className="flex flex-wrap gap-2">
        {selectedMedias.map((url, index) => (
          <div key={index} className="relative group">
            <img 
              src={url} 
              alt={`Preview ${index}`}
              className="w-20 h-20 object-cover rounded border"
            />
            <button
              onClick={() => {
                const newMedias = selectedMedias.filter((_, i) => i !== index);
                setSelectedMedias(newMedias);
                onChange?.({
                  target: {
                    value: multiple ? newMedias : newMedias[0] || ''
                  }
                });
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Button to open media popup */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {multiple ? 'Select Media' : 'Select Image'}
      </button>

      {/* Media Popup */}
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        {/* Popup container */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden">
            <Dialog.Title className="bg-gray-800 text-white px-4 py-3">
              {multiple ? 'Select Media' : 'Select Image'}
            </Dialog.Title>

            <div className="flex border-b">
              <button
                className={`px-4 py-2 ${activeTab === 'list' ? 'bg-gray-100 font-medium' : ''}`}
                onClick={() => setActiveTab('list')}
              >
                Media Library
              </button>
              <button
                className={`px-4 py-2 ${activeTab === 'upload' ? 'bg-gray-100 font-medium' : ''}`}
                onClick={() => setActiveTab('upload')}
              >
                Upload
              </button>
              <button
                className={`px-4 py-2 ${activeTab === 'url' ? 'bg-gray-100 font-medium' : ''}`}
                onClick={() => setActiveTab('url')}
              >
                URL Upload
              </button>
            </div>

            <div className="p-4 max-h-[70vh] overflow-y-auto">
              {activeTab === 'list' && (
                <div>
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Search media..."
                      className="w-full p-2 border rounded"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  {isLoading ? (
                    <div className="text-center py-8">Loading...</div>
                  ) : (
                    <div className="grid grid-cols-5 gap-4">
                      {mediaList.map((media) => (
                        <div 
                          key={media._id} 
                          className={`border rounded overflow-hidden cursor-pointer transition-all ${
                            selectedMedias.includes(media.url) 
                              ? 'ring-2 ring-blue-500 shadow-md' 
                              : 'hover:shadow-md'
                          }`}
                          onClick={() => handleSelectMedia(media.url)}
                        >
                          <img 
                            src={media.url} 
                            alt={media.alt || ''}
                            className="w-full h-32 object-cover"
                          />
                          <div className="p-2 truncate text-sm">{media.title || 'Untitled'}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'upload' && (
                <div className="space-y-4">
                  <input 
                    type="file" 
                    multiple={multiple}
                    onChange={handleFileSelect}
                    className="w-full p-2 border rounded"
                    accept="image/*,video/*"
                  />
                  
                  {selectedFiles.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Selected Files:</h3>
                      <ul className="max-h-40 overflow-y-auto border rounded p-2">
                        {selectedFiles.map((file, index) => (
                          <li key={index} className="text-sm truncate">
                            {file.name} ({Math.round(file.size / 1024)} KB)
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={handleFileUpload}
                        disabled={isLoading}
                        className={`w-full py-2 rounded ${
                          isLoading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        {isLoading ? 'Uploading...' : 'Upload Files'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'url' && (
                <div>
                  <textarea
                    className="w-full p-2 border rounded mb-2 h-32"
                    placeholder="Enter image URLs, one per line"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                  />
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={handleUrlUpload}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Adding...' : 'Add URLs'}
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center bg-gray-100 px-4 py-3">
              <div>
                {selectedMedias.length > 0 && (
                  <span className="text-sm">
                    {selectedMedias.length} {multiple ? 'items' : 'item'} selected
                  </span>
                )}
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInsertMedia}
                  disabled={selectedMedias.length === 0}
                  className={`px-4 py-2 rounded ${
                    selectedMedias.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 text-white'
                  }`}
                >
                  {multiple ? 'Insert Selected' : 'Insert Image'}
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {children}
    </div>
  );
}