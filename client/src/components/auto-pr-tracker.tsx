import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GitPullRequest, Eye, FileText, Clock } from 'lucide-react';
import { PullRequestModal, type PullRequestData } from './modals/pull-request-modal';

interface AutoPRTrackerProps {
  projectId: string;
  isCollaborator: boolean;
  onCreatePR: (data: PullRequestData) => Promise<void>;
  pendingChanges?: any[];
  changesSinceLastPR?: string[];
}

interface TrackedChange {
  file: string;
  changeType: 'modified' | 'added' | 'deleted';
  timestamp: Date;
  description?: string;
}

export function AutoPRTracker({ projectId, isCollaborator, onCreatePR, pendingChanges = [], changesSinceLastPR = [] }: AutoPRTrackerProps) {
  const [isTrackingEnabled, setIsTrackingEnabled] = useState(true);
  const [showPendingChanges, setShowPendingChanges] = useState(false);

  // Convert real tracked changes to the display format
  const trackedChanges: TrackedChange[] = pendingChanges.map(change => ({
    file: change.type === 'files' ? `${change.data.fileCount} file(s)` : 
          change.type === 'details' ? 'Project details' :
          change.type === 'comments' ? 'Comments' : change.type,
    changeType: change.data.action === 'upload' ? 'added' as const :
               change.data.action === 'add' ? 'added' as const :
               'modified' as const,
    timestamp: new Date(change.timestamp),
    description: change.type === 'files' ? `Uploaded ${change.data.fileCount} files` :
                change.type === 'details' ? 'Modified project details' :
                change.type === 'comments' ? 'Added comment' : 'Modified'
  }));

  // Real change detection - no fake simulation, only actual changes
  useEffect(() => {
    // Changes are now tracked by the parent component through real user actions:
    // - File uploads via /api/projects/:id/files
    // - Project edits via /api/projects/:id (PATCH)
    // - Comment additions via /api/projects/:id/comments
    // - No fake simulation - only real modifications trigger tracking
  }, [pendingChanges, changesSinceLastPR]);

  const handleCreateAutoPR = async () => {
    if (trackedChanges.length === 0) return;

    const filesChanged = trackedChanges.map(change => change.file);
    const changesPreview = trackedChanges
      .map(change => `${change.changeType.toUpperCase()}: ${change.file}`)
      .join('\n');

    const prData: PullRequestData = {
      title: `Auto PR: ${trackedChanges.length} file${trackedChanges.length > 1 ? 's' : ''} changed`,
      description: `Automatic pull request created for recent changes.\n\nSummary:\n${changesPreview}`,
      filesChanged: Array.from(new Set(filesChanged)), // Remove duplicates
      changesPreview,
      branchName: `auto-pr-${Date.now()}`
    };

    try {
      await onCreatePR(prData);
      // Changes are managed by parent component now - no local state to clear
      setShowPendingChanges(false);
    } catch (error) {
      console.error('Error creating auto PR:', error);
    }
  };

  const clearChanges = () => {
    // Changes are managed by parent component now - no local state to clear
    setShowPendingChanges(false);
  };

  if (!isCollaborator) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Change Tracking Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Change Tracking
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTrackingEnabled(!isTrackingEnabled)}
            >
              {isTrackingEnabled ? 'Disable' : 'Enable'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isTrackingEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-sm text-gray-600">
                {isTrackingEnabled ? 'Monitoring changes' : 'Change tracking disabled'}
              </span>
            </div>
            {trackedChanges.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPendingChanges(!showPendingChanges)}
              >
                {trackedChanges.length} change{trackedChanges.length > 1 ? 's' : ''}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Changes Alert */}
      {trackedChanges.length > 0 && (
        <Alert>
          <GitPullRequest className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              {trackedChanges.length} change{trackedChanges.length > 1 ? 's' : ''} detected. 
              Ready to create a pull request?
            </span>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreateAutoPR}>
                Create Auto PR
              </Button>
              <Button size="sm" variant="outline" onClick={clearChanges}>
                Clear
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Changes View */}
      {showPendingChanges && trackedChanges.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Pending Changes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {trackedChanges.map((change, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      change.changeType === 'added' ? 'bg-green-500' :
                      change.changeType === 'modified' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <span className="text-sm font-medium">{change.file}</span>
                    <span className="text-xs text-gray-500 capitalize">{change.changeType}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    {change.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual PR Creation */}
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-sm font-medium">Manual Pull Request</h4>
          <p className="text-xs text-gray-600">Create a pull request manually for your changes</p>
        </div>
        <PullRequestModal
          projectId={projectId}
          onSubmit={onCreatePR}
          trigger={
            <Button variant="outline" size="sm">
              <GitPullRequest className="mr-2 h-4 w-4" />
              Manual PR
            </Button>
          }
        />
      </div>
    </div>
  );
}