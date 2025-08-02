"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Dropcursor } from "@tiptap/extension-dropcursor";
import { Gapcursor } from "@tiptap/extension-gapcursor";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Quote,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Upload,
  X,
  Undo,
  Redo,
  FileText,
} from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";
import { createRoot } from "react-dom/client";
import tippy from "tippy.js";
import { SlashCommands } from "@/lib/slash-commands-extension";
import { SlashCommand, SlashCommandRef } from "@/components/ui/slash-command";
import { convertMdxToTiptap, detectMdxContent } from "@/lib/mdx-to-tiptap";

interface RichTextEditorProps {
  content?: any; // Tiptap JSON content
  onChange?: (content: any) => void;
  placeholder?: string;
  readOnly?: boolean;
  userId?: string;
}

interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
}

export function RichTextEditor({
  content = "",
  onChange,
  placeholder = "Start writing...",
  readOnly = false,
  userId,
}: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadState, setUploadState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const commandListRef = useRef<SlashCommandRef>(null);

  const generateUploadUrl = useMutation(api.media.generateUploadUrl);
  const createMediaFromUpload = useMutation(api.media.createMediaFromUpload);

  useEffect(() => {
    setIsMounted(true);
    
    // Add global styles for slash command menu only
    const style = document.createElement('style');
    style.textContent = `
      .tippy-box .slash-command-menu {
        overflow-y: auto !important;
        max-height: 400px !important;
        overscroll-behavior: contain !important;
        -webkit-overflow-scrolling: touch !important;
      }
      .tippy-box {
        pointer-events: auto !important;
      }
      .tippy-content {
        padding: 0 !important;
        overflow: visible !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const handleImageUpload = useCallback(async (file: File): Promise<string | null> => {
    if (!userId) {
      setUploadState(prev => ({ ...prev, error: "User ID required for upload" }));
      return null;
    }

    // Validate file
    if (!file.type.startsWith("image/")) {
      setUploadState(prev => ({ ...prev, error: "Please select an image file" }));
      return null;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadState(prev => ({ ...prev, error: "File size must be less than 5MB" }));
      return null;
    }

    setUploadState({ uploading: true, progress: 0, error: null });

    try {
      const uploadUrl = await generateUploadUrl();
      
      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadState(prev => ({ ...prev, progress }));
          }
        });

        xhr.addEventListener("load", async () => {
          if (xhr.status === 200) {
            try {
              const result = JSON.parse(xhr.responseText);
              const storageId = result.storageId;

              const mediaResult = await createMediaFromUpload({
                storageId,
                fileName: file.name,
                fileType: file.type,
                userId: userId as any,
                fileSize: file.size,
                description: `Blog image: ${file.name}`,
              });

              setUploadState({ uploading: false, progress: 100, error: null });
              resolve(mediaResult.url);
            } catch (error) {
              setUploadState(prev => ({ ...prev, uploading: false, error: "Failed to save image" }));
              reject(error);
            }
          } else {
            setUploadState(prev => ({ ...prev, uploading: false, error: "Upload failed" }));
            reject(new Error("Upload failed"));
          }
        });

        xhr.addEventListener("error", () => {
          setUploadState(prev => ({ ...prev, uploading: false, error: "Upload failed" }));
          reject(new Error("Upload failed"));
        });

        xhr.open("POST", uploadUrl);
        const formData = new FormData();
        formData.append("file", file);
        xhr.send(formData);
      });
    } catch (error) {
      setUploadState(prev => ({ ...prev, uploading: false, error: "Failed to start upload" }));
      return null;
    }
  }, [userId, generateUploadUrl, createMediaFromUpload]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-400 underline hover:text-blue-300",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-md my-4",
        },
      }),
      TextStyle,
      Color,
      Dropcursor.configure({
        color: "#3b82f6",
        width: 2,
      }),
      Gapcursor,
      SlashCommands.configure({
        suggestion: {
          items: ({ query }: { query: string }) => {
            return [];
          },
          render: () => {
            let root: any;
            let popup: any;
            let element: any;
            let scrollCleanup: any;

            return {
              onStart: (props: any) => {
                element = document.createElement("div");
                element.style.zIndex = "9999";
                element.style.position = "fixed";
                element.style.pointerEvents = "auto";
                element.style.overflow = "visible";
                document.body.appendChild(element);
                root = createRoot(element);

                // Handle main window scroll events to reposition popup
                const handleWindowScroll = () => {
                  if (popup?.[0]) {
                    popup[0].hide();
                  }
                };
                
                // Only listen to window scroll, not all scroll events
                window.addEventListener('scroll', handleWindowScroll);
                
                // Store cleanup function
                scrollCleanup = () => {
                  window.removeEventListener('scroll', handleWindowScroll);
                };
                
                root.render(
                  <SlashCommand
                    ref={commandListRef}
                    editor={props.editor}
                    range={props.range}
                    query={props.query}
                  />
                );

                if (!props.clientRect) {
                  return;
                }

                popup = tippy("body", {
                  getReferenceClientRect: props.clientRect,
                  appendTo: () => document.body,
                  content: element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: "manual",
                  placement: "bottom-start",
                  hideOnClick: false,
                  arrow: false,
                  offset: [0, 4],
                  theme: "transparent",
                  popperOptions: {
                    strategy: "absolute",
                    modifiers: [
                      {
                        name: "preventOverflow",
                        options: {
                          boundary: "viewport",
                          padding: 8,
                        },
                      },
                      {
                        name: "flip",
                        options: {
                          fallbackPlacements: ["top-start", "bottom-start"],
                        },
                      },
                    ],
                  },
                });
              },
              onUpdate: (props: any) => {
                commandListRef.current?.updateProps({
                  editor: props.editor,
                  range: props.range,
                  query: props.query,
                });

                if (!props.clientRect) {
                  return;
                }

                popup?.[0]?.setProps({
                  getReferenceClientRect: props.clientRect,
                });
              },
              onKeyDown: (props: any) => {
                if (props.event.key === "Escape") {
                  popup?.[0]?.hide();
                  return true;
                }
                return false;
              },
              onExit: () => {
                popup?.[0]?.destroy();
                if (scrollCleanup) {
                  scrollCleanup();
                }
                if (root) {
                  root.unmount();
                }
                if (element && element.parentNode) {
                  element.parentNode.removeChild(element);
                }
              },
            };
          },
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON());
    },
    immediatelyRender: false,
    editable: !readOnly,
    editorProps: {
      attributes: {
        class:
          "prose prose-invert prose-lg max-w-none p-4 min-h-[200px] focus:outline-none bg-darkGray2 border border-grayBorders rounded-md text-white [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6 [&_li]:marker:text-gray-400",
      },
      handleDrop: (view, event, slice, moved) => {
        if (!userId || readOnly) return false;
        
        const files = Array.from(event.dataTransfer?.files || []);
        const imageFiles = files.filter(file => file.type.startsWith("image/"));
        
        if (imageFiles.length === 0) return false;
        
        event.preventDefault();
        
        imageFiles.forEach(async (file) => {
          const url = await handleImageUpload(file);
          if (url && editor) {
            editor.chain().focus().setImage({ src: url }).run();
          }
        });
        
        return true;
      },
      handlePaste: (view, event, slice) => {
        if (readOnly) return false;
        
        // Handle image files first
        if (userId) {
          const files = Array.from(event.clipboardData?.files || []);
          const imageFiles = files.filter(file => file.type.startsWith("image/"));
          
          if (imageFiles.length > 0) {
            event.preventDefault();
            
            imageFiles.forEach(async (file) => {
              const url = await handleImageUpload(file);
              if (url && editor) {
                editor.chain().focus().setImage({ src: url }).run();
              }
            });
            
            return true;
          }
        }
        
        // Handle text content - check for MDX
        const clipboardText = event.clipboardData?.getData('text/plain');
        if (clipboardText) {
          // Only process as MDX if it's clearly markdown content
          if (detectMdxContent(clipboardText)) {
            event.preventDefault();
            
            // Use setTimeout to make it async and avoid blocking
            setTimeout(async () => {
              try {
                const tiptapJson = await convertMdxToTiptap(clipboardText);
                if (editor && tiptapJson.content.length > 0) {
                  editor.commands.insertContent(tiptapJson.content);
                }
              } catch (error) {
                console.error('Error converting MDX:', error);
                // Fallback: insert as plain text
                editor?.commands.insertContent(clipboardText);
              }
            }, 0);
            
            return true;
          }
        }
        
        // Let Tiptap handle normal text pasting
        return false;
      },
    },
  });

  const addLink = useCallback(() => {
    const url = window.prompt("Enter URL:");
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const addImageFromUrl = useCallback(() => {
    if (imageUrl.trim() && editor) {
      editor.chain().focus().setImage({ src: imageUrl.trim() }).run();
      setImageUrl("");
      setIsImageDialogOpen(false);
    }
  }, [editor, imageUrl]);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && editor) {
      const url = await handleImageUpload(file);
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
        setIsImageDialogOpen(false);
      }
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [editor, handleImageUpload]);

  const openImageDialog = useCallback(() => {
    setIsImageDialogOpen(true);
    setUploadState({ uploading: false, progress: 0, error: null });
  }, []);

  const handleMdxImport = useCallback(async () => {
    const mdxContent = window.prompt("Paste your MDX/Markdown content:");
    if (mdxContent && editor) {
      try {
        const tiptapJson = await convertMdxToTiptap(mdxContent);
        editor.commands.insertContent(tiptapJson.content);
      } catch (error) {
        console.error('Error importing MDX content:', error);
        editor.commands.insertContent(mdxContent);
      }
    }
  }, [editor]);

  const convertCurrentToMdx = useCallback(async () => {
    if (!editor) return;
    
    const currentText = editor.getText();
    if (currentText && detectMdxContent(currentText)) {
      try {
        const tiptapJson = await convertMdxToTiptap(currentText);
        editor.commands.setContent(tiptapJson);
      } catch (error) {
        console.error('Error converting current content:', error);
      }
    }
  }, [editor]);

  if (!isMounted || !editor) {
    return (
      <div className="prose prose-invert max-w-none p-4 min-h-[200px] bg-darkGray2 border border-grayBorders rounded-md text-white flex items-center justify-center">
        <span className="text-gray-400">Loading editor...</span>
      </div>
    );
  }

  if (readOnly) {
    return (
      <div className="prose prose-invert prose-lg max-w-none p-4 bg-darkGray2 border border-grayBorders rounded-md [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6 [&_li]:marker:text-gray-400">
        <EditorContent editor={editor} />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {!readOnly && (
        <div className="text-xs text-gray-400 px-1 space-y-1">
          <div>
            Type <kbd className="px-1 py-0.5 bg-darkGray2 border border-grayBorders rounded text-gray-300">/</kbd> for commands
          </div>
          <div>
            Paste MDX/Markdown content directly or use the <FileText className="inline h-3 w-3" /> button
          </div>
        </div>
      )}
      <div className="flex items-center gap-1 p-2 bg-darkGray border border-grayBorders rounded-md flex-wrap">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`text-gray-300 hover:bg-darkGray2 ${
            editor.isActive("bold") ? "bg-darkGray2 text-white" : ""
          }`}
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`text-gray-300 hover:bg-darkGray2 ${
            editor.isActive("italic") ? "bg-darkGray2 text-white" : ""
          }`}
        >
          <Italic className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`text-gray-300 hover:bg-darkGray2 ${
            editor.isActive("strike") ? "bg-darkGray2 text-white" : ""
          }`}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`text-gray-300 hover:bg-darkGray2 ${
            editor.isActive("code") ? "bg-darkGray2 text-white" : ""
          }`}
        >
          <Code className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-grayBorders mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`text-gray-300 hover:bg-darkGray2 ${
            editor.isActive("heading", { level: 2 }) ? "bg-darkGray2 text-white" : ""
          }`}
        >
          H2
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`text-gray-300 hover:bg-darkGray2 ${
            editor.isActive("heading", { level: 3 }) ? "bg-darkGray2 text-white" : ""
          }`}
        >
          H3
        </Button>

        <div className="w-px h-6 bg-grayBorders mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`text-gray-300 hover:bg-darkGray2 ${
            editor.isActive("bulletList") ? "bg-darkGray2 text-white" : ""
          }`}
        >
          <List className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`text-gray-300 hover:bg-darkGray2 ${
            editor.isActive("orderedList") ? "bg-darkGray2 text-white" : ""
          }`}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`text-gray-300 hover:bg-darkGray2 ${
            editor.isActive("blockquote") ? "bg-darkGray2 text-white" : ""
          }`}
        >
          <Quote className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-grayBorders mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addLink}
          className={`text-gray-300 hover:bg-darkGray2 ${
            editor.isActive("link") ? "bg-darkGray2 text-white" : ""
          }`}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={openImageDialog}
          className="text-gray-300 hover:bg-darkGray2"
          disabled={!userId}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleMdxImport}
          className="text-gray-300 hover:bg-darkGray2"
          title="Import MDX/Markdown"
        >
          <FileText className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-grayBorders mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="text-gray-300 hover:bg-darkGray2 disabled:opacity-50"
        >
          <Undo className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="text-gray-300 hover:bg-darkGray2 disabled:opacity-50"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      <EditorContent editor={editor} />
      
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="sm:max-w-md bg-darkGray border-grayBorders">
          <DialogHeader>
            <DialogTitle className="text-white">Insert Image</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {uploadState.uploading && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4 text-blue-500 animate-pulse" />
                  <span className="text-sm text-white">Uploading... {uploadState.progress}%</span>
                </div>
                <Progress value={uploadState.progress} className="h-2 bg-darkGray2" />
              </div>
            )}
            
            {uploadState.error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                <p className="text-sm text-red-400">{uploadState.error}</p>
              </div>
            )}
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300">Upload from device</Label>
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={uploadState.uploading || !userId}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadState.uploading || !userId}
                    className="flex-1 gap-2 bg-darkGray2 border-grayBorders text-white hover:bg-darkGray"
                  >
                    <Upload className="h-4 w-4" />
                    Choose File
                  </Button>
                </div>
                <p className="text-xs text-gray-400">Supports JPG, PNG, GIF up to 5MB</p>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-grayBorders" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-darkGray px-2 text-gray-400">Or</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="imageUrl" className="text-sm font-medium text-gray-300">
                  Image URL
                </Label>
                <Input
                  id="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="bg-darkGray2 border-grayBorders text-white"
                  disabled={uploadState.uploading}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsImageDialogOpen(false);
                setImageUrl("");
                setUploadState({ uploading: false, progress: 0, error: null });
              }}
              disabled={uploadState.uploading}
              className="border-grayBorders text-gray-300 hover:bg-darkGray2"
            >
              Cancel
            </Button>
            <Button
              onClick={addImageFromUrl}
              disabled={!imageUrl.trim() || uploadState.uploading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Insert Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}