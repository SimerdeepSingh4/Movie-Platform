import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Trash2, Ban, CheckCircle, Shield, MoreHorizontal, User as UserIcon } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user: currentUser } = useSelector((state) => state.auth);
  
  // Dialog State
  const [dialogConfig, setDialogConfig] = useState({ isOpen: false, action: null, userId: null, expectedText: '' });
  const [confirmText, setConfirmText] = useState("");

  // To avoid spamming reload, we maintain a trick to trigger re-fetches
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/admin/users');
        setUsers(res.data.users || []);
      } catch (err) {
        console.error("Failed to fetch users", err);
        setError("Failed to load user list. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [refreshKey]);

  const requestAction = (action, userId) => {
    if (action === 'unban') {
      handleAction('unban', userId);
      return;
    }
    setDialogConfig({
      isOpen: true,
      action,
      userId,
      expectedText: action === 'ban' ? 'yes' : (action === 'make-admin' ? 'ADMIN' : (action === 'demote' ? 'USER' : 'DELETE'))
    });
    setConfirmText('');
  };

  const confirmAction = async () => {
    // Check if input matches expected text (case insensitive for 'yes', exact for 'DELETE')
    const isValid = dialogConfig.action === 'ban' 
      ? confirmText.toLowerCase() === 'yes'
      : dialogConfig.action === 'make-admin'
        ? confirmText === 'admin' || confirmText === 'ADMIN'
        : dialogConfig.action === 'demote'
          ? confirmText === 'user' || confirmText === 'USER'
          : confirmText === 'delete' || confirmText === 'DELETE';

    if (!isValid) {
      return toast.error("Confirmation text does not match.");
    }
    setDialogConfig({ ...dialogConfig, isOpen: false });
    await handleAction(dialogConfig.action, dialogConfig.userId);
  };

  const handleAction = async (action, userId) => {
    try {
      if (action === 'ban') {
        await api.patch(`/admin/ban/${userId}`);
      } else if (action === 'unban') {
        await api.patch(`/admin/unban/${userId}`);
      } else if (action === 'delete') {
        await api.delete(`/admin/${userId}`);
      } else if (action === 'make-admin') {
        await api.patch(`/admin/make-admin/${userId}`);
      } else if (action === 'demote') {
        await api.patch(`/admin/demote/${userId}`);
      }
      
      // Refresh list
      setRefreshKey(prev => prev + 1);
      toast.success(`User successfully ${action}ed`);
    } catch (err) {
      console.error(`Failed to ${action} user:`, err);
      toast.error(`An error occurred trying to ${action} the user.`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Management</h2>
          <p className="text-muted-foreground mt-1">View, manage roles, ban, and delete registered accounts.</p>
        </div>
        <Button variant="outline" onClick={() => setRefreshKey(k => k + 1)}>
          Refresh List
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Modern Data Table Approach */}
      <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Joined Date</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                // Loading Skeletons
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-10 w-48 rounded" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-24 rounded" /></td>
                    <td className="px-6 py-4 flex justify-end"><Skeleton className="h-8 w-8 rounded-full" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                    <UserIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    No users found on the system.
                  </td>
                </tr>
              ) : (
                // Actual Data Rows
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold overflow-hidden">
                          {user.photoUrl && user.photoUrl !== "" 
                             ? <img src={user.photoUrl} alt="avatar" className="h-full w-full object-cover" />
                             : user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{user.username}</div>
                          <div className="text-muted-foreground text-xs">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.role === 'admin' ? (
                        <div className="flex items-center gap-1.5 text-emerald-500 font-medium text-xs">
                          <Shield className="h-3.5 w-3.5" /> Admin
                        </div>
                      ) : (
                        <div className="text-muted-foreground text-xs">Standard</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.isBanned ? (
                        <Badge variant="destructive" className="bg-destructive/20 text-destructive hover:bg-destructive/30 border-0">
                          Banned
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30 border-0">
                          Active
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* Don't allow admins to ban/delete themselves directly from this quick menu usually, but allowed here for simplicity */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {user.isBanned ? (
                            <DropdownMenuItem 
                              className="text-emerald-500 cursor-pointer flex items-center gap-2 font-medium" 
                              onClick={() => requestAction('unban', user._id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                              Restore Access
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              className="text-amber-500 cursor-pointer flex items-center gap-2 font-medium"
                              onClick={() => requestAction('ban', user._id)}
                              disabled={currentUser?._id === user._id}
                            >
                              <Ban className="h-4 w-4" />
                              Ban User
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {user.role !== 'admin' ? (
                            <DropdownMenuItem 
                              className="text-primary cursor-pointer flex items-center gap-2 font-medium"
                              onClick={() => requestAction('make-admin', user._id)}
                            >
                              <Shield className="h-4 w-4" />
                              Promote to Admin
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              className="text-primary cursor-pointer flex items-center gap-2 font-medium"
                              onClick={() => requestAction('demote', user._id)}
                              disabled={currentUser?._id === user._id}
                            >
                              <UserIcon className="h-4 w-4" />
                              Demote to User
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive cursor-pointer flex items-center gap-2 font-medium focus:bg-destructive"
                            onClick={() => requestAction('delete', user._id)}
                            disabled={currentUser?._id === user._id}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete Account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={dialogConfig.isOpen} onOpenChange={(isOpen) => setDialogConfig({ ...dialogConfig, isOpen })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className={dialogConfig.action === 'delete' ? 'text-destructive' : (dialogConfig.action === 'make-admin' || dialogConfig.action === 'demote' ? 'text-primary' : 'text-amber-500')}>
              {dialogConfig.action === 'ban' ? 'Ban User Account' : (dialogConfig.action === 'make-admin' ? 'Promote to Admin' : (dialogConfig.action === 'demote' ? 'Demote to User' : 'Permanently Delete User'))}
            </DialogTitle>
            <DialogDescription>
              This action requires confirmation. Please type <strong className="font-bold text-foreground">"{dialogConfig.expectedText}"</strong> below to confirm you want to proceed.
              {dialogConfig.action === 'delete' && " This action is irreversible and will wipe all user data from the database."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 py-4">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="confirm" className="sr-only">
                Confirmation
              </Label>
              <Input
                id="confirm"
                placeholder={`Type "${dialogConfig.expectedText}" to confirm`}
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmAction();
                }}
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDialogConfig({ ...dialogConfig, isOpen: false })}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={dialogConfig.action === 'delete' ? 'destructive' : 'default'}
              onClick={confirmAction}
              className={dialogConfig.action === 'ban' ? 'bg-amber-500 hover:bg-amber-600 text-white' : (dialogConfig.action === 'make-admin' || dialogConfig.action === 'demote' ? 'bg-primary hover:bg-primary/90 text-white' : '')}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
