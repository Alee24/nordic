import React, { useState, useRef, useEffect } from 'react';
import { TextInput, ActionIcon, Box, Image, Transition } from '@mantine/core';
import { IconCamera, IconCheck, IconX } from '@tabler/icons-react';
import useManagementStore from '../../store/useManagementStore';
import { cn } from '../../utils/cn';

const Editable = ({ id, type = 'text', children, className, ...props }) => {
    const { isAdmin, content, setContent } = useManagementStore();
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(content[id] || (type === 'text' ? children : ''));
    const inputRef = useRef(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleSave = () => {
        setContent(id, tempValue);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setTempValue(content[id] || children);
        setIsEditing(false);
    };

    if (!isAdmin) {
        if (type === 'image') return <div className={className}>{children}</div>;
        return <span className={className}>{content[id] || children}</span>;
    }

    // --- TEXT MODE ---
    if (type === 'text') {
        if (isEditing) {
            return (
                <Box className={cn("inline-block relative", className)}>
                    <TextInput
                        ref={inputRef}
                        value={tempValue}
                        onChange={(e) => setTempValue(e.currentTarget.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSave();
                            if (e.key === 'Escape') handleCancel();
                        }}
                        size="sm"
                        variant="filled"
                        styles={{
                            input: {
                                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                                border: '1px solid #D4AF37',
                                color: '#E1E8ED',
                                fontFamily: 'inherit',
                                fontSize: 'inherit',
                                minWidth: '100px',
                            }
                        }}
                    />
                    <Box className="absolute -bottom-8 right-0 flex gap-1 z-10">
                        <ActionIcon color="green" size="sm" onClick={handleSave} radius="xl">
                            <IconCheck size={14} />
                        </ActionIcon>
                        <ActionIcon color="red" size="sm" onClick={handleCancel} radius="xl">
                            <IconX size={14} />
                        </ActionIcon>
                    </Box>
                </Box>
            );
        }

        return (
            <span
                onClick={() => setIsEditing(true)}
                className={cn(
                    "cursor-pointer hover:bg-nordic-gold/10 rounded px-1 transition-colors border border-transparent hover:border-nordic-gold/30",
                    className
                )}
            >
                {content[id] || children}
            </span>
        );
    }

    // --- IMAGE MODE ---
    if (type === 'image') {
        return (
            <Box className={cn("relative group cursor-pointer overflow-hidden", className)}>
                {/* If children is an <img> or <Image>, render it with the new src if content[id] exists */}
                {React.cloneElement(children, {
                    src: content[id] || children.props.src
                })}

                <Box className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <Box className="bg-nordic-gold p-3 rounded-full shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
                        <IconCamera size={24} color="#1A1B1E" />
                    </Box>
                </Box>

                {/* File input invisible overlay */}
                <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                                setContent(id, event.target.result);
                            };
                            reader.readAsDataURL(file);
                        }
                    }}
                />
            </Box>
        );
    }

    return children;
};

export default Editable;
