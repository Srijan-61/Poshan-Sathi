
import type { User } from "./types";

interface UsersTableProps {
  usersList: User[];
  searchQuery: string;
  currentPage: number;
  itemsPerPage: number;
  currentUser: User;
  toggleUserRole: (id: string, currentlyAdmin: boolean) => void;
  deleteUser: (id: string) => void;
}

export default function UsersTable({
  usersList,
  searchQuery,
  currentPage,
  itemsPerPage,
  currentUser,
  toggleUserRole,
  deleteUser
}: UsersTableProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="w-full">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-neutral-100 bg-white/50">
            <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider w-[40%]">User</th>
            <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider w-[20%]">Role</th>
            <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider w-[20%]">Join Date</th>
            <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider text-right w-[20%]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {usersList
            .filter(u => (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()))
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            .map((usr) => (
            <tr key={usr._id} className="hover:bg-neutral-50/50 transition-colors group">
              <td className="px-6 py-4">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-[#f0fcf6] text-[#00a86b] font-bold text-xs flex items-center justify-center shrink-0 border border-[#e2f7eb]">
                    {getInitials(usr.email || "UN")}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-neutral-900 group-hover:text-[#00a86b] transition-colors truncate">{usr.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                {usr.role === 'admin' ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest bg-[#e2f7eb] text-[#00a86b] uppercase">
                    ADMIN
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest bg-neutral-100 text-neutral-600 uppercase">
                    END USER
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-sm font-medium text-neutral-600">
                {new Date(usr.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => toggleUserRole(usr._id, usr.role === 'admin')}
                    disabled={usr._id === currentUser._id}
                    className="text-neutral-400 hover:text-neutral-900 transition-colors disabled:opacity-20"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 5-3-3H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2Z"></path><path d="M8 18h1"></path><path d="M18.4 9.6a2 2 0 1 1 3 3L17 17l-4 1 1-4Z"></path></svg>
                  </button>
                  <button 
                    onClick={() => deleteUser(usr._id)}
                    disabled={usr._id === currentUser._id}
                    className="text-neutral-400 hover:text-red-500 transition-colors disabled:opacity-20"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
