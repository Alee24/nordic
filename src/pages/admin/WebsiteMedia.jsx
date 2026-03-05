import React, { useState, useEffect, useRef } from 'react';
import {
    IconPhoto, IconUpload, IconRefresh,
    IconTrash, IconReplace, IconSearch, IconX, IconCheck
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { Modal, Loader, TextInput } from '@mantine/core';
import api from '../../services/api';

const WebsiteMedia = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal state for preview & specific actions
    const [selectedImage, setSelectedImage] = useState(null);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);

    const fileInputRef = useRef(null);
    const replaceInputRef = useRef(null);

    const fetchImages = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/site-media');
            if (data.success && data.data.images) {
                setImages(data.data.images);
            }
        } catch (error) {
            notifications.show({
                title: 'Error loading media',
                message: error.response?.data?.error || error.message,
                color: 'red'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    // Upload a brand new file
    const handleUploadNew = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        handleFileUpload(file, null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Replace an existing file
    const handleReplaceFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !selectedImage) return;

        handleFileUpload(file, selectedImage.filename);
        if (replaceInputRef.current) replaceInputRef.current.value = '';
        setIsActionModalOpen(false);
    };

    const handleFileUpload = async (file, targetFilename = null) => {
        // Validate
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            notifications.show({ title: 'Invalid File', message: 'Only JPG, PNG, WebP or GIF allowed', color: 'red' });
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            notifications.show({ title: 'File too large', message: 'Maximum 10MB', color: 'red' });
            return;
        }

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('image', file);
            if (targetFilename) {
                formData.append('target_filename', targetFilename);
            }

            const { data } = await api.post('/site-media', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (data.success) {
                notifications.show({
                    title: 'Success',
                    message: targetFilename ? `Overwrote ${targetFilename}` : 'Uploaded new image',
                    color: 'green'
                });
                fetchImages(); // refresh list
            }
        } catch (error) {
            notifications.show({
                title: 'Upload Failed',
                message: error.response?.data?.error || error.message,
                color: 'red'
            });
        } finally {
            setIsUploading(true);
            // small delay to ensure UI updates after heavy tasks
            setTimeout(() => setIsUploading(false), 500);
        }
    };

    const handleDelete = async (filename) => {
        if (!window.confirm(`Are you sure you want to permanently delete ${filename}? This might break website pages currently using it.`)) return;

        try {
            setIsUploading(true);
            const { data } = await api.delete('/site-media', { data: { filename } });
            if (data.success) {
                notifications.show({ title: 'Deleted', message: `${filename} removed.`, color: 'green' });
                fetchImages();
                setIsActionModalOpen(false);
            }
        } catch (error) {
            notifications.show({ title: 'Delete Failed', message: error.response?.data?.error || error.message, color: 'red' });
        } finally {
            setIsUploading(false);
        }
    };

    const bytesToMB = (bytes) => (bytes / (1024 * 1024)).toFixed(2);

    const filteredImages = images.filter(img =>
        img.filename.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-norden-gold-500/10 text-norden-gold-600 rounded-xl">
                        <IconPhoto size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 font-serif">Website Media Manager</h1>
                        <p className="text-sm text-gray-500">Manage all actual image files used across the website. Overwriting a file here will instantly update the site anywhere that file is referenced.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchImages}
                        disabled={loading || isUploading}
                        className="p-2.5 text-gray-500 hover:text-norden-gold-600 hover:bg-gray-50 rounded-xl transition-all"
                        title="Refresh list"
                    >
                        <IconRefresh size={20} className={loading ? 'animate-spin' : ''} />
                    </button>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-2 px-5 py-2.5 bg-norden-gold-500 hover:bg-norden-gold-600 text-white font-semibold rounded-xl transition-all shadow-sm disabled:opacity-50"
                    >
                        {isUploading ? <Loader size="xs" color="white" /> : <IconUpload size={18} />}
                        Upload New File
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleUploadNew}
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                    />
                </div>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="relative w-full max-w-md">
                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search images by filename..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-norden-gold-500/50"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <IconX size={16} />
                        </button>
                    )}
                </div>
                <div className="text-sm text-gray-500 font-medium px-4">
                    {filteredImages.length} {filteredImages.length === 1 ? 'file' : 'files'}
                </div>
            </div>

            {/* Gallery Grid */}
            {loading ? (
                <div className="py-20 flex justify-center"><Loader color="yellow" size="xl" /></div>
            ) : filteredImages.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                    <IconPhoto className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No images found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {searchQuery ? "Try refining your search" : "Upload an image to get started"}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {filteredImages.map((img) => (
                        <div
                            key={img.filename}
                            onClick={() => {
                                setSelectedImage(img);
                                setIsActionModalOpen(true);
                            }}
                            className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-norden-gold-500 hover:shadow-md transition-all cursor-pointer flex flex-col"
                        >
                            <div className="aspect-square bg-gray-100 relative overflow-hidden flex items-center justify-center p-2">
                                {/* Checkerboard background pattern for transparent images */}
                                <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%, #eee), repeating-linear-gradient(45deg, #eee 25%, #fff 25%, #fff 75%, #eee 75%, #eee)', backgroundPosition: '0 0, 10px 10px', backgroundSize: '20px 20px' }}></div>
                                <img
                                    src={`${img.url}?t=${img.modified}`}
                                    alt={img.filename}
                                    className="max-w-full max-h-full object-contain relative z-10 group-hover:scale-105 transition-transform duration-300 drop-shadow-sm"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center">
                                    <span className="text-white font-medium text-sm flex items-center gap-1">
                                        <IconReplace size={16} /> Manage
                                    </span>
                                </div>
                            </div>
                            <div className="p-3 flex flex-col flex-1 border-t border-gray-100">
                                <p className="text-xs font-semibold text-gray-800 truncate" title={img.filename}>
                                    {img.filename}
                                </p>
                                <p className="text-[10px] text-gray-500 mt-1 uppercase">
                                    {bytesToMB(img.size)} MB
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Action/Preview Modal */}
            <Modal
                opened={isActionModalOpen}
                onClose={() => !isUploading && setIsActionModalOpen(false)}
                title={<span className="font-serif font-bold text-lg text-gray-900">Manage Media</span>}
                size="lg"
                centered
            >
                {selectedImage && (
                    <div className="space-y-6 pb-2">
                        {/* Preview */}
                        <div className="bg-gray-100 rounded-xl p-4 flex justify-center max-h-[400px]">
                            <img
                                src={`${selectedImage.url}?t=${selectedImage.modified}`}
                                alt={selectedImage.filename}
                                className="max-w-full max-h-full object-contain rounded drop-shadow-md"
                            />
                        </div>

                        {/* File Info */}
                        <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
                            <div className="grid grid-cols-2 gap-y-3 font-mono text-xs">
                                <div className="text-gray-500">Filename</div>
                                <div className="font-semibold text-gray-900 truncate" title={selectedImage.filename}>{selectedImage.filename}</div>

                                <div className="text-gray-500">Reference Path</div>
                                <div className="font-semibold text-gray-900 text-blue-600 truncate">/images/{selectedImage.filename}</div>

                                <div className="text-gray-500">File Size</div>
                                <div className="font-semibold text-gray-900">{bytesToMB(selectedImage.size)} MB</div>

                                <div className="text-gray-500">Last Modified</div>
                                <div className="font-semibold text-gray-900">{new Date(selectedImage.modified * 1000).toLocaleString()}</div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => replaceInputRef.current?.click()}
                                disabled={isUploading}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-norden-gold-500 hover:bg-norden-gold-600 text-white font-semibold rounded-xl transition-all shadow-sm"
                            >
                                <IconReplace size={18} /> Overwrite / Replace File
                            </button>
                            <input
                                type="file"
                                ref={replaceInputRef}
                                onChange={handleReplaceFile}
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                className="hidden"
                            />

                            <button
                                onClick={() => handleDelete(selectedImage.filename)}
                                disabled={isUploading}
                                className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl transition-all border border-red-200 border-dashed"
                                title="Delete permanently"
                            >
                                <IconTrash size={18} />
                            </button>
                        </div>

                        <div className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
                            <IconCheck size={14} className="text-green-500" />
                            Overwriting replaces this image everywhere on the website instantly.
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default WebsiteMedia;
