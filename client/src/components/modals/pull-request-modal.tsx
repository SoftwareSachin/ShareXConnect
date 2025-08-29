import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GitPullRequest, FileText, Clock, CheckCircle, XCircle, Plus, X, Upload, Folder, File } from "lucide-react";

interface PullRequestModalProps {
  projectId: string;
  onSubmit: (data: PullRequestData) => void;
  trigger?: React.ReactNode;
}

export interface PullRequestData {
  title: string;
  description: string;
  filesChanged: string[];
  changesPreview: string;
  branchName?: string;
  uploadedFiles?: FileList | null;
}

export function PullRequestModal({ projectId, onSubmit, trigger }: PullRequestModalProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [changesPreview, setChangesPreview] = useState("");
  const [filesChanged, setFilesChanged] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const fileList = uploadedFiles.length > 0 ? (() => {
        const dt = new DataTransfer();
        uploadedFiles.forEach(file => dt.items.add(file));
        return dt.files;
      })() : null;

      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        filesChanged,
        changesPreview: changesPreview.trim(),
        branchName: `manual-pr-${Date.now()}`,
        uploadedFiles: fileList
      });
      
      // Reset form completely
      setTitle("");
      setDescription("");
      setChangesPreview("");
      setFilesChanged([]);
      setUploadedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (uploadInputRef.current) {
        uploadInputRef.current.value = '';
      }
      setOpen(false);
    } catch (error) {
      console.error("Error creating pull request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddFileClick = () => {
    if (fileInputRef.current) {
      const success = addFile(fileInputRef.current.value);
      if (success) {
        fileInputRef.current.value = '';
        fileInputRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddFileClick();
    }
  };

  const addFile = (fileName: string) => {
    const trimmedFileName = fileName.trim();
    if (trimmedFileName && !filesChanged.includes(trimmedFileName)) {
      setFilesChanged([...filesChanged, trimmedFileName]);
      return true;
    }
    return false;
  };

  const removeFile = (fileName: string) => {
    setFilesChanged(filesChanged.filter(f => f !== fileName));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
      
      // Add file names to filesChanged list
      const fileNames = newFiles.map(file => file.name);
      setFilesChanged(prev => [...prev, ...fileNames.filter(name => !prev.includes(name))]);
    }
  };

  const removeUploadedFile = (index: number) => {
    const fileToRemove = uploadedFiles[index];
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setFilesChanged(prev => prev.filter(name => name !== fileToRemove.name));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-blue-600 hover:bg-blue-700 text-white border-0">
            <GitPullRequest className="mr-2 h-4 w-4" />
            Create Pull Request
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-semibold text-gray-900">
            Create Pull Request
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            Submit your changes for review and collaboration
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pull Request Details */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium text-gray-900">Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief summary of your changes"
                  required
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed description of what changes you've made and why..."
                  rows={4}
                  required
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Files Changed */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium text-gray-900">Files Changed</CardTitle>
              <p className="text-sm text-gray-600">Add the files that were modified in this pull request</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  ref={fileInputRef}
                  placeholder="Enter file path (e.g., src/components/Button.tsx)"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  onKeyDown={handleKeyDown}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-50"
                  onClick={handleAddFileClick}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add File
                </Button>
              </div>
              
              {filesChanged.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Modified Files ({filesChanged.length})
                  </Label>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {filesChanged.map((file) => (
                      <div key={file} className="flex items-center justify-between bg-gray-50 rounded-md px-3 py-2 border border-gray-200">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-900 font-mono">{file}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file)}
                          className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium text-gray-900">Upload Files</CardTitle>
              <p className="text-sm text-gray-600">Upload new files, documents, or folders to be added to the project</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
                <input
                  ref={uploadInputRef}
                  type="file"
                  multiple
                  accept="*/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label 
                  htmlFor="file-upload" 
                  className="cursor-pointer flex flex-col items-center justify-center text-center"
                >
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    Any file type, including ZIP archives, documents, images
                  </p>
                </label>
              </div>

              {/* Alternative Upload Buttons */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => uploadInputRef.current?.click()}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <File className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (uploadInputRef.current) {
                      uploadInputRef.current.setAttribute('webkitdirectory', '');
                      uploadInputRef.current.click();
                    }
                  }}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <Folder className="h-4 w-4 mr-2" />
                  Upload Folder
                </Button>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Uploaded Files ({uploadedFiles.length})
                  </Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 rounded-md px-3 py-2 border border-gray-200">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <File className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="text-sm text-gray-900 truncate block">{file.name}</span>
                            <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUploadedFile(index)}
                          className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 flex-shrink-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Changes Summary */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium text-gray-900">Changes Summary</CardTitle>
              <p className="text-sm text-gray-600">Provide a detailed overview of the modifications made</p>
            </CardHeader>
            <CardContent>
              <Textarea
                id="changes"
                value={changesPreview}
                onChange={(e) => setChangesPreview(e.target.value)}
                placeholder="Describe the specific changes, improvements, or bug fixes in detail..."
                rows={4}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
              />
            </CardContent>
          </Card>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-gray-300 hover:bg-gray-50 text-gray-700"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !title.trim() || !description.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white border-0 min-w-[140px]"
            >
              {isSubmitting ? "Creating..." : "Create Pull Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface PullRequestListProps {
  projectId: string;
  pullRequests: any[];
  isOwner: boolean;
  onStatusUpdate: (prId: string, status: string) => void;
}

export function PullRequestList({ projectId, pullRequests, isOwner, onStatusUpdate }: PullRequestListProps) {
  // Debug logging
  console.log('PullRequestList Debug:', {
    isOwner,
    pullRequestsCount: pullRequests.length,
    pullRequests: pullRequests.map(pr => ({ id: pr.id, title: pr.title, status: pr.status }))
  });
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'MERGED':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'APPROVED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'MERGED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'REJECTED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Pull Requests</h3>
          <p className="text-sm text-gray-600 mt-1">
            {pullRequests.length} {pullRequests.length === 1 ? 'request' : 'requests'} submitted
          </p>
        </div>
      </div>

      {pullRequests.length === 0 ? (
        <Card className="border border-gray-200">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <GitPullRequest className="h-8 w-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Pull Requests Yet</h4>
            <p className="text-gray-600">
              When team members submit changes, they'll appear here for review and collaboration.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pullRequests.map((pr) => (
            <Card key={pr.id} className="border border-gray-200 hover:shadow-sm transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(pr.status)}
                      <h4 className="text-lg font-medium text-gray-900">{pr.title}</h4>
                      <Badge 
                        variant="outline" 
                        className={`${getStatusColor(pr.status)} font-medium`}
                      >
                        {pr.status.charAt(0) + pr.status.slice(1).toLowerCase()}
                      </Badge>
                    </div>
                    <p className="text-gray-700 mb-3 leading-relaxed">{pr.description}</p>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <strong className="text-gray-700">{pr.author?.firstName} {pr.author?.lastName}</strong>
                      </span>
                      <span>{new Date(pr.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}</span>
                      {pr.filesChanged && pr.filesChanged.length > 0 && (
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {pr.filesChanged.length} {pr.filesChanged.length === 1 ? 'file' : 'files'} changed
                        </span>
                      )}
                    </div>
                  </div>

                  {isOwner && (pr.status === 'OPEN' || pr.status === 'PENDING') && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300"
                        onClick={() => onStatusUpdate(pr.id, 'APPROVED')}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                        onClick={() => onStatusUpdate(pr.id, 'REJECTED')}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                  {isOwner && pr.status === 'APPROVED' && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white border-0"
                        onClick={() => onStatusUpdate(pr.id, 'MERGED')}
                      >
                        Merge Changes
                      </Button>
                      <div className="text-sm text-green-600 flex items-center gap-1">
                        ✅ Approved - Ready to merge
                      </div>
                    </div>
                  )}
                </div>

                {pr.changesPreview && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Changes Summary</h5>
                    <p className="text-sm text-gray-700 leading-relaxed">{pr.changesPreview}</p>
                  </div>
                )}

                {pr.filesChanged && pr.filesChanged.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Modified Files</Label>
                    <div className="flex flex-wrap gap-2">
                      {pr.filesChanged.map((file: string) => (
                        <div 
                          key={file} 
                          className="inline-flex items-center gap-1 bg-gray-100 border border-gray-200 rounded-md px-2 py-1"
                        >
                          <FileText className="h-3 w-3 text-gray-500" />
                          <span className="text-xs font-mono text-gray-700">{file}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}