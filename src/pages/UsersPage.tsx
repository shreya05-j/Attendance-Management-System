import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Shield, BookOpen, User as UserIcon, MoreVertical, Loader2, Users } from "lucide-react";
import { api } from "../lib/api";
import Select from "../components/ui/Select";
import Modal from "../components/ui/Modal";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: "admin" | "faculty" | "student";
  is_active: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "student" as "student" | "faculty" | "admin" });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get<UserRecord[]>("/users");
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email) return;
    try {
      setIsSubmitting(true);
      const response = await api.post("/users", newUser);
      if (response.success) {
        setIsModalOpen(false);
        setNewUser({ name: "", email: "", role: "student" });
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to add user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleConfig: Record<string, { icon: any; gradient: string; bg: string }> = {
    admin: { icon: Shield, gradient: "from-violet-500 to-purple-600", bg: "bg-violet-500/10 text-violet-300 border-violet-500/20" },
    faculty: { icon: BookOpen, gradient: "from-cyan-500 to-blue-600", bg: "bg-blue-500/10 text-blue-300 border-blue-500/20" },
    student: { icon: UserIcon, gradient: "from-emerald-500 to-teal-600", bg: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" },
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              User Management
            </h1>
            <p className="text-gray-400 mt-1.5 text-sm">Manage all users across the system.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all">
            <Plus className="h-4 w-4" /> Add New User
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl glass border border-white/10 px-3 py-2 flex-1 max-w-md">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none flex-1"
            />
          </div>
          <div className="w-44">
            <Select
              value={roleFilter}
              onChange={setRoleFilter}
              options={[
                { value: "all", label: "All Roles" },
                { value: "admin", label: "Admin" },
                { value: "faculty", label: "Faculty" },
                { value: "student", label: "Student" },
              ]}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <RoleStat icon={<Shield className="h-5 w-5" />} label="Admins" count={users.filter((u) => u.role === "admin").length} gradient="from-violet-500 to-purple-600" />
          <RoleStat icon={<BookOpen className="h-5 w-5" />} label="Faculty" count={users.filter((u) => u.role === "faculty").length} gradient="from-cyan-500 to-blue-600" />
          <RoleStat icon={<UserIcon className="h-5 w-5" />} label="Students" count={users.filter((u) => u.role === "student").length} gradient="from-emerald-500 to-teal-600" />
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 glass rounded-2xl border border-white/10">
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            <p className="text-gray-500 text-sm">Loading user list...</p>
          </div>
        ) : (
          <div className="glass rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <h3 className="text-base font-semibold text-white">All Users ({filtered.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-white/[0.02] border-b border-white/5">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-12 text-center">
                        <Users className="h-8 w-8 text-gray-700 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No users found.</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((u) => {
                      const cfg = roleConfig[u.role] || roleConfig.student;
                      const Icon = cfg.icon;
                      const initials = u.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                      return (
                        <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${cfg.gradient} text-white text-xs font-semibold shadow-lg`}>
                                {initials}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{u.name}</p>
                                <p className="text-xs text-gray-500">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${cfg.bg}`}>
                              <Icon className="h-3 w-3" />
                              {u.role}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${u.is_active ? "text-emerald-400" : "text-gray-500"}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? "bg-emerald-500" : "bg-gray-500"}`} />
                              {u.is_active ? "active" : "inactive"}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <button className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New User">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Full Name</label>
            <input 
              type="text" 
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
              value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              placeholder="e.g. John Doe"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Email Address</label>
            <input 
              type="email" 
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
              value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              placeholder="e.g. john@admin.in"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">User Role</label>
            <Select 
              value={newUser.role}
              onChange={(val) => setNewUser({...newUser, role: val as any})}
              options={[
                { value: "student", label: "Student" },
                { value: "faculty", label: "Faculty" },
                { value: "admin", label: "Admin" },
              ]}
            />
          </div>
          <div className="pt-4 flex items-center justify-end gap-3">
            <button 
              onClick={() => setIsModalOpen(false)} 
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-gray-400 hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleAddUser}
              disabled={isSubmitting || !newUser.name || !newUser.email}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-indigo-500 rounded-xl text-white hover:bg-indigo-600 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add User"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function RoleStat({ icon, label, count, gradient }: any) {
  return (
    <div className="glass rounded-2xl border border-white/10 p-5 hover:border-white/20 transition-all">
      <div className="flex items-center gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{count}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

