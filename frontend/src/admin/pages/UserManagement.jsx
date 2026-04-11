import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Trash2, Ban, CheckCircle, Shield, MoreHorizontal, User as UserIcon, RefreshCcw, Search, ShieldAlert, Fingerprint } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState("");
  const { user: currentUser } = useSelector((state) => state.auth);
  
  const [dialogConfig, setDialogConfig] = useState({ isOpen: false, action: null, userId: null, expectedText: '' });
  const [confirmText, setConfirmText] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/admin/users');
        setUsers(res.data.users || []);
      } catch (err) {
        setError("Failed to connect to the user database.");
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
    const isValid = dialogConfig.action === 'ban' 
      ? confirmText.toLowerCase() === 'yes'
      : dialogConfig.action === 'make-admin'
        ? confirmText === 'admin' || confirmText === 'ADMIN'
        : dialogConfig.action === 'demote'
          ? confirmText === 'user' || confirmText === 'USER'
          : confirmText === 'delete' || confirmText === 'DELETE';

    if (!isValid) {
      return toast.error("Invalid confirmation text.");
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
      
      setRefreshKey(prev => prev + 1);
      toast.success(`User ${action}ed successfully`);
    } catch (err) {
      toast.error(`Error performing ${action}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="relative">
          <h2 className="text-2xl font-black tracking-tighter uppercase text-foreground leading-none">
            User <span className="text-primary italic font-serif lowercase">Management</span>
          </h2>
          <p className="text-muted-foreground mt-2 text-sm font-medium tracking-tight opacity-60">
            Control platform access and administrator privileges.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative group">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
             <Input 
               placeholder="Search users..." 
               className="pl-10 h-11 w-64 bg-surface-container-low border-white/5 focus:border-primary/50 transition-all rounded-xl shadow-xl"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
           </div>
          <Button 
            variant="outline" 
            onClick={() => setRefreshKey(k => k + 1)}
            className="h-11 border-border/50 hover:bg-primary/10 hover:text-primary gap-2 rounded-xl"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 p-5 rounded-2xl flex items-center gap-4 animate-in shake duration-500">
          <ShieldAlert className="h-6 w-6" />
          <p className="font-bold tracking-tight">{error}</p>
        </div>
      )}

      <div className="rounded-3xl border border-border/40 bg-card/30 shadow-2xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-[#0c0c0c]/50 text-muted-foreground uppercase text-[0.65rem] font-black tracking-[0.25em] border-b border-border/50">
              <tr>
                <th className="px-8 py-6">User</th>
                <th className="px-6 py-6">Role</th>
                <th className="px-6 py-6 text-center">Status</th>
                <th className="px-6 py-6 text-center">Joined</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-5"><div className="flex items-center gap-4"><Skeleton className="h-12 w-12 rounded-full bg-white/5" /><div className="space-y-2"><Skeleton className="h-4 w-32 bg-white/5" /><Skeleton className="h-3 w-48 bg-white/5" /></div></div></td>
                    <td className="px-6 py-5"><Skeleton className="h-6 w-16 bg-white/5" /></td>
                    <td className="px-6 py-5"><Skeleton className="h-6 w-20 bg-white/5" /></td>
                    <td className="px-6 py-5"><Skeleton className="h-6 w-24 mx-auto bg-white/5" /></td>
                    <td className="px-8 py-5 text-right"><Skeleton className="h-8 w-8 ml-auto rounded-xl bg-white/5" /></td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-24 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-4 opacity-50">
                      <Fingerprint className="h-16 w-16 text-primary" />
                      <p className="text-xl font-black uppercase tracking-widest leading-none">No Users Found</p>
                      <p className="text-sm font-medium">No users match your current search.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-primary/[0.02] transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 shrink-0 rounded-xl relative overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 group-hover:scale-110 transition-transform duration-500 border border-white/5 shadow-lg">
                          {user.photoUrl && user.photoUrl !== "" 
                             ? <img src={user.photoUrl} alt="avatar" className="h-full w-full object-cover" />
                             : <div className="h-full w-full flex items-center justify-center text-primary font-black text-lg italic">{user.username.charAt(0).toUpperCase()}</div>}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-foreground group-hover:text-primary transition-colors text-[15px] tracking-tight truncate">{user.username}</div>
                          <div className="text-muted-foreground/60 text-[11px] font-medium tracking-tight truncate">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {user.role === 'admin' ? (
                        <div className="flex items-center gap-2 text-primary">
                          <Shield className="h-3.5 w-3.5" />
                          <span className="font-black uppercase text-[0.65rem] tracking-widest italic text-glow">Admin</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/60 font-black uppercase text-[0.65rem] tracking-widest">User</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-center">
                      {user.isBanned ? (
                        <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 uppercase text-[0.6rem] font-black tracking-widest px-3 py-1 rounded-lg">
                          Banned
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 uppercase text-[0.6rem] font-black tracking-widest px-3 py-1 rounded-lg">
                          Active
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="text-muted-foreground/60 font-bold tracking-tight text-[11px] uppercase">
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-9 w-9 p-0 rounded-xl hover:bg-primary/10 hover:text-primary shadow-lg border border-transparent hover:border-border/50 transition-all">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px] glass-effect border-border/50 p-2 rounded-2xl shadow-2xl animate-in zoom-in-95">
                          <DropdownMenuLabel className="px-3 py-2 text-[0.6rem] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Options</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-border/30 mx-1" />
                          {user.isBanned ? (
                            <DropdownMenuItem 
                              className="px-3 py-2.5 text-emerald-500 cursor-pointer flex items-center gap-3 font-bold rounded-xl focus:bg-emerald-500/10 transition-colors text-xs" 
                              onClick={() => requestAction('unban', user._id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                              Unban Account
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              className="px-3 py-2.5 text-amber-500 cursor-pointer flex items-center gap-3 font-bold rounded-xl focus:bg-amber-500/10 transition-colors text-xs"
                              onClick={() => requestAction('ban', user._id)}
                              disabled={currentUser?._id === user._id}
                            >
                              <Ban className="h-4 w-4" />
                              Ban User
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator className="bg-border/30 mx-1" />
                          {user.role !== 'admin' ? (
                            <DropdownMenuItem 
                              className="px-3 py-2.5 text-primary cursor-pointer flex items-center gap-3 font-bold rounded-xl focus:bg-primary/10 transition-colors text-xs"
                              onClick={() => requestAction('make-admin', user._id)}
                            >
                              <Shield className="h-4 w-4" />
                              Promote to Admin
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              className="px-3 py-2.5 text-primary cursor-pointer flex items-center gap-3 font-bold rounded-xl focus:bg-primary/10 transition-colors text-xs"
                              onClick={() => requestAction('demote', user._id)}
                              disabled={currentUser?._id === user._id}
                            >
                              <UserIcon className="h-4 w-4" />
                              Demote to User
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator className="bg-border/30 mx-1" />
                          <DropdownMenuItem 
                            className="px-3 py-2.5 text-destructive cursor-pointer flex items-center gap-3 font-bold rounded-xl focus:bg-destructive/10 transition-colors text-xs"
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

      <Dialog open={dialogConfig.isOpen} onOpenChange={(isOpen) => setDialogConfig({ ...dialogConfig, isOpen })}>
        <DialogContent className="sm:max-w-md glass-effect border-border/50 p-8 rounded-[2.5rem] shadow-3xl">
          <DialogHeader className="space-y-4">
            <div className={`h-16 w-16 rounded-3xl flex items-center justify-center border shadow-2xl mx-auto mb-2 ${
              dialogConfig.action === 'delete' ? 'bg-destructive/10 border-destructive/20 text-destructive' : 
              (dialogConfig.action === 'make-admin' || dialogConfig.action === 'demote' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-amber-500/10 border-amber-500/20 text-amber-500')
            }`}>
               {dialogConfig.action === 'delete' ? <Trash2 className="h-8 w-8" /> : (dialogConfig.action === 'ban' ? <Ban className="h-8 w-8" /> : <Shield className="h-8 w-8" />)}
            </div>
            <DialogTitle className={`text-2xl font-black text-center uppercase tracking-tightest leading-none ${
              dialogConfig.action === 'delete' ? 'text-destructive' : 
              (dialogConfig.action === 'make-admin' || dialogConfig.action === 'demote' ? 'text-primary' : 'text-amber-500')
            }`}>
              {dialogConfig.action === 'ban' ? 'Ban User' : (dialogConfig.action === 'make-admin' ? 'Change Role' : (dialogConfig.action === 'demote' ? 'Demote User' : 'Delete Account'))}
            </DialogTitle>
            <DialogDescription className="text-center font-medium text-muted-foreground px-4 text-sm leading-relaxed">
              To proceed, please type <strong className="text-foreground font-black italic">"{dialogConfig.expectedText}"</strong> below to confirm this action.
              {dialogConfig.action === 'delete' && <span className="block mt-2 text-destructive font-bold">This action cannot be undone.</span>}
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <Input
              id="confirm"
              placeholder={`Confirm by typing: ${dialogConfig.expectedText}`}
              className="h-14 bg-white/5 border-border/50 rounded-2xl text-center font-black uppercase tracking-widest focus:border-primary/50 transition-all text-lg placeholder:text-muted-foreground/30 placeholder:italic"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmAction();
              }}
            />
          </div>
          <DialogFooter className="sm:justify-center gap-4 border-t border-border/30 pt-8">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDialogConfig({ ...dialogConfig, isOpen: false })}
              className="h-14 flex-1 rounded-2xl bg-white/5 border border-border/50 hover:bg-white/10 font-bold uppercase tracking-widest text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={confirmAction}
              className={`h-14 flex-1 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl ${
                dialogConfig.action === 'delete' ? 'bg-destructive hover:bg-destructive/90' : 
                (dialogConfig.action === 'make-admin' || dialogConfig.action === 'demote' ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'bg-amber-500 hover:bg-amber-600 text-white')
              }`}
            >
              Confirm Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;

