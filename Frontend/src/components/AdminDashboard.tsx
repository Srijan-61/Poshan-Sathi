import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Database,
  Carrot,
  Search,
  Filter,
  LogOut,
  Loader2,
  Image as ImageIcon,
  Link as LinkIcon,
  Leaf,
  X
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  // App state
  const [activeTab, setActiveTab] = useState<"users" | "foods" | "ingredients">("users");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 8;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data states
  const [usersList, setUsersList] = useState<any[]>([]);
  const [foodsList, setFoodsList] = useState<any[]>([]);
  const [ingredientsList, setIngredientsList] = useState<any[]>([]);

  // Modal states
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [foodForm, setFoodForm] = useState({
    food_name: '', calories: 0, protein: 0, carbs: 0, fats: 0, price: 0, category: 'Meal', imageUrl: '', keywords: '',
    micronutrients: { iron: 0, calcium: 0, vitamin_c: 0, fiber: 0, sugar: 0, sodium: 0 }
  });

  const [foodImageMode, setFoodImageMode] = useState<"upload" | "url">("upload");
  const [foodImageFile, setFoodImageFile] = useState<File | null>(null);

  const [ingredientForm, setIngredientForm] = useState({
    name: "", caloriesPer100g: "", proteinPer100g: "", carbsPer100g: "", fatPer100g: "", imageUrl: ""
  });
  const [ingredientImageMode, setIngredientImageMode] = useState<"upload" | "url">("upload");
  const [ingredientImageFile, setIngredientImageFile] = useState<File | null>(null);

  // Handlers
  const handleOpenFoodModal = (food: any = null) => {
    if (food) {
      setEditingFoodId(food._id);
      setFoodForm({
        food_name: food.food_name || food.name || '',
        calories: food.calories || 0,
        protein: food.protein || 0,
        carbs: food.carbs || 0,
        fats: food.fats || 0,
        price: food.price || 0,
        category: food.category || 'Meal',
        imageUrl: food.image || '',
        keywords: Array.isArray(food.keywords) ? food.keywords.join(', ') : (food.keywords || ''),
        micronutrients: food.micros || { iron: 0, calcium: 0, vitamin_c: 0, fiber: 0, sugar: 0, sodium: 0 }
      });
      setFoodImageMode(food.image && food.image.startsWith('http') ? 'url' : 'upload');
      setFoodImageFile(null);
    } else {
      setEditingFoodId(null);
      setFoodForm({
        food_name: '', calories: 0, protein: 0, carbs: 0, fats: 0, price: 0, category: 'Meal', imageUrl: '', keywords: '',
        micronutrients: { iron: 0, calcium: 0, vitamin_c: 0, fiber: 0, sugar: 0, sodium: 0 }
      });
      setFoodImageMode('upload');
      setFoodImageFile(null);
    }
    setIsFoodModalOpen(true);
  };

  const handleFoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("food_name", foodForm.food_name);
      formData.append("calories", foodForm.calories.toString());
      formData.append("protein", foodForm.protein.toString());
      formData.append("carbs", foodForm.carbs.toString());
      formData.append("fats", foodForm.fats.toString());
      formData.append("price", foodForm.price.toString());
      formData.append("category", foodForm.category);
      formData.append("keywords", foodForm.keywords);
      formData.append("micros", JSON.stringify({
        iron: Number(foodForm.micronutrients.iron),
        calcium: Number(foodForm.micronutrients.calcium),
        vitamin_c: Number(foodForm.micronutrients.vitamin_c),
        fiber: Number(foodForm.micronutrients.fiber),
        sugar: Number(foodForm.micronutrients.sugar),
        sodium: Number(foodForm.micronutrients.sodium),
      }));

      if (foodImageMode === "upload" && foodImageFile) {
        formData.append("image", foodImageFile);
      } else if (foodImageMode === "url" && foodForm.imageUrl) {
        formData.append("imageUrl", foodForm.imageUrl);
      }

      const token = localStorage.getItem("userInfo") ? JSON.parse(localStorage.getItem("userInfo")!).token : "";
      const config = { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } };
      
      if (editingFoodId) {
        await axios.put(`/api/admin/foods/${editingFoodId}`, formData, config);
        toast.success("Food updated successfully!");
      } else {
        await axios.post("/api/admin/foods", formData, config);
        toast.success("Food added successfully!");
      }
      setIsFoodModalOpen(false);
      fetchData(); // Reload table
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save food");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteFood = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this food?")) return;
    try {
      await axios.delete(`/api/admin/foods/${id}`, getHeaders());
      toast.success("Food deleted");
      setFoodsList(foodsList.filter(f => f._id !== id));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error deleting food");
    }
  };

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (!userInfo) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(userInfo);
    if (parsedUser.role !== 'admin') {
      toast.error("Access denied. Admins only.");
      navigate("/");
      return;
    }
    setUser(parsedUser);
  }, [navigate]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      const [uRes, fRes, iRes] = await Promise.all([
        axios.get("/api/admin/users", config),
        axios.get("/api/admin/foods", config),
        axios.get("/api/admin/ingredients", config)
      ]);

      setUsersList(uRes.data.users || []);
      setFoodsList(fRes.data.foods || []);
      setIngredientsList(iRes.data.ingredients || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${user.token}` }
  });

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    window.location.href = "/login";
  };

  // --- USER HANDLERS ---
  const toggleUserRole = async (id: string, currentlyAdmin: boolean) => {
    try {
      await axios.put(`/api/admin/users/${id}/role`, {}, getHeaders());
      toast.success("User role updated");
      setUsersList(usersList.map(u => u._id === id ? { ...u, role: currentlyAdmin ? 'user' : 'admin' } : u));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error updating role");
    }
  };

  const deleteUser = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`/api/admin/users/${id}`, getHeaders());
      toast.success("User deleted");
      setUsersList(usersList.filter(u => u._id !== id));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error deleting user");
    }
  };



  // --- INGREDIENT HANDLERS ---
  const handleIngredientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", ingredientForm.name);
      formData.append("calories", ingredientForm.caloriesPer100g);
      formData.append("protein", ingredientForm.proteinPer100g);
      formData.append("carbs", ingredientForm.carbsPer100g);
      formData.append("fats", ingredientForm.fatPer100g);
      
      if (ingredientImageMode === "upload" && ingredientImageFile) {
        formData.append("image", ingredientImageFile);
      } else if (ingredientImageMode === "url" && ingredientForm.imageUrl) {
        formData.append("imageUrl", ingredientForm.imageUrl);
      }

      await axios.post("/api/admin/ingredients", formData, {
        headers: { Authorization: `Bearer ${user.token}`, "Content-Type": "multipart/form-data" }
      });
      toast.success("Ingredient added successfully");
      setIsIngredientModalOpen(false);
      setIngredientForm({ name: "", caloriesPer100g: "", proteinPer100g: "", carbsPer100g: "", fatPer100g: "", imageUrl: "" });
      
      const iRes = await axios.get("/api/admin/ingredients", getHeaders());
      setIngredientsList(iRes.data.ingredients || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error adding ingredient");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteIngredient = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this ingredient?")) return;
    try {
      await axios.delete(`/api/admin/ingredients/${id}`, getHeaders());
      toast.success("Ingredient deleted");
      setIngredientsList(ingredientsList.filter(i => i._id !== id));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error deleting ingredient");
    }
  };

  if (!user || user.role !== 'admin') {
    return <div className="fixed inset-0 bg-white flex items-center justify-center z-50"><Loader2 className="w-8 h-8 animate-spin text-[#00a86b]" /></div>;
  }

  // Helper variables for mockup UI
  const pageTitle = activeTab === "users" ? "User Management" : activeTab === "foods" ? "Food Library" : "Ingredient Database";
  const primaryButtonAction = activeTab === "users" ? null : 
    activeTab === "foods" ? () => handleOpenFoodModal() :
    () => setIsIngredientModalOpen(true);
  const primaryButtonLabel = activeTab === "users" ? "Add New User" : activeTab === "foods" ? "Add New Food" : "Add Ingredient";

  // Initials generator
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#fafafa] flex font-sans text-gray-900 pointer-events-auto">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200/60 flex flex-col justify-between shrink-0 h-full">
        <div>
          {/* Logo */}
          <div className="h-20 flex items-center px-6">
            <div className="flex bg-[#00a86b] text-white p-1.5 rounded-lg mr-3">
              <Leaf size={20} fill="currentColor" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight">Poshan Sathi</h1>
              <span className="text-xs text-[#00a86b] font-semibold space-x-1">Admin Console</span>
            </div>
          </div>

          {/* Nav Menu */}
          <nav className="mt-4 px-4 space-y-1">
            <button 
              onClick={() => { setActiveTab("users"); setCurrentPage(1); setSearchQuery(""); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${activeTab === "users" ? "text-[#00a86b] bg-[#eefaf4]" : "text-gray-500 hover:bg-gray-50"}`}
            >
              <Users size={18} />
              <span>Users</span>
            </button>
            <button 
              onClick={() => { setActiveTab("foods"); setCurrentPage(1); setSearchQuery(""); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${activeTab === "foods" ? "text-[#00a86b] bg-[#eefaf4]" : "text-gray-500 hover:bg-gray-50"}`}
            >
              <Database size={18} />
              <span>Food Database</span>
            </button>
            <button 
              onClick={() => { setActiveTab("ingredients"); setCurrentPage(1); setSearchQuery(""); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${activeTab === "ingredients" ? "text-[#00a86b] bg-[#eefaf4]" : "text-gray-500 hover:bg-gray-50"}`}
            >
              <Carrot size={18} />
              <span>Ingredients</span>
            </button>
          </nav>
        </div>

        {/* Footer Profile */}
        <div className="p-4 border-t border-gray-200/60">
          <div 
            onClick={handleLogout}
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group"
          >
            <div className="flex items-center space-x-3">
              <img src={`https://ui-avatars.com/api/?name=${user.name}&background=111827&color=fff`} alt={user.name} className="w-10 h-10 rounded-full" />
              <div>
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-gray-400">Super Admin</p>
              </div>
            </div>
            <div className="text-gray-400 group-hover:text-red-500 p-1.5 transition-colors">
              <LogOut size={16} />
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-200/60 flex items-center justify-between px-8 shrink-0">
          <h2 className="text-xl font-bold">{pageTitle}</h2>
          <div className="flex items-center space-x-6">
            {primaryButtonAction && (
              <button 
                onClick={primaryButtonAction}
                className="bg-[#00a86b] hover:bg-[#00905a] text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all"
              >
                {primaryButtonLabel}
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {loading ? (
             <div className="flex justify-center items-center h-64"><Loader2 className="w-10 h-10 animate-spin text-[#00a86b]" /></div>
          ) : (
            <>
              {/* MAIN DATA SECTION (TABLE WRAPPER) */}
              <div className="bg-white rounded-xl border border-gray-200/60 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] flex flex-col">
                
                {/* Table Controls */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                      placeholder="Search items by name..." 
                      className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm w-72 focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] transition-all"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <Filter size={16} />
                      <span>Filter</span>
                    </button>
                  </div>
                </div>

                {/* Users Table */}
                {activeTab === "users" && (
                  <div className="w-full">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-100 bg-white/50">
                          <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-[40%]">User</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-[20%]">Role</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-[20%]">Join Date</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right w-[20%]">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {usersList
                          .filter(u => (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()))
                          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                          .map((usr) => (
                          <tr key={usr._id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 rounded-full bg-[#f0fcf6] text-[#00a86b] font-bold text-xs flex items-center justify-center shrink-0 border border-[#e2f7eb]">
                                  {getInitials(usr.name || usr.email || "UN")}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-gray-900 group-hover:text-[#00a86b] transition-colors truncate">{usr.name || 'Unknown User'}</p>
                                  <p className="text-xs text-gray-500 truncate">{usr.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {usr.role === 'admin' ? (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest bg-[#e2f7eb] text-[#00a86b] uppercase">
                                  ADMIN
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest bg-gray-100 text-gray-600 uppercase">
                                  END USER
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-600">
                              {new Date(usr.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => toggleUserRole(usr._id, usr.role === 'admin')}
                                  disabled={usr._id === user._id}
                                  className="text-gray-400 hover:text-gray-900 transition-colors disabled:opacity-20"
                                >
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 5-3-3H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2Z"></path><path d="M8 18h1"></path><path d="M18.4 9.6a2 2 0 1 1 3 3L17 17l-4 1 1-4Z"></path></svg>
                                </button>
                                <button 
                                  onClick={() => deleteUser(usr._id)}
                                  disabled={usr._id === user._id}
                                  className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-20"
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
                )}

                {/* Foods Table Mockup */}
                {activeTab === "foods" && (
                  <div className="w-full">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-100 bg-white/50">
                          <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-[40%]">Food Item</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-[20%]">Category</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-[20%]">Calories</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right w-[20%]">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {foodsList
                          .filter(f => (f.food_name || f.name || "").toLowerCase().includes(searchQuery.toLowerCase()))
                          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                          .map((f) => (
                          <tr key={f._id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-4">
                                {f.image ? (
                                  <img src={f.image} className="w-10 h-10 rounded-md object-cover border border-gray-100" />
                                ) : (
                                  <div className="w-10 h-10 rounded-md bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                                    <ImageIcon size={16} />
                                  </div>
                                )}
                                <div className="min-w-0 flex items-center h-10">
                                  <p className="font-bold text-gray-900 group-hover:text-[#00a86b] transition-colors truncate">{f.food_name || f.name}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-gray-100 text-gray-600 uppercase">
                                {f.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-gray-800">
                              {f.calories}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <button onClick={() => handleOpenFoodModal(f)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                </button>
                                <button onClick={() => deleteFood(f._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Ingredients Table Mockup */}
                {activeTab === "ingredients" && (
                  <div className="w-full">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-100 bg-white/50">
                          <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-[40%]">Ingredient</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-[20%]">Calories (100g)</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right w-[40%]">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {ingredientsList
                          .filter(i => (i.name || "").toLowerCase().includes(searchQuery.toLowerCase()))
                          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                          .map((i) => (
                          <tr key={i._id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-6 py-4">
                              <p className="font-bold text-gray-900 group-hover:text-[#00a86b] transition-colors">{i.name}</p>
                              <p className="text-xs text-gray-500">P: {i.proteinPer100g} / C: {i.carbsPer100g} / F: {i.fatPer100g}</p>
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-gray-800">
                              {i.caloriesPer100g}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                                <button className="text-gray-400 hover:text-gray-900 transition-colors">
                                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 5-3-3H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2Z"></path><path d="M8 18h1"></path><path d="M18.4 9.6a2 2 0 1 1 3 3L17 17l-4 1 1-4Z"></path></svg>
                                </button>
                                <button onClick={() => deleteIngredient(i._id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {/* Pagination Footer */}
                {(() => {
                  const currentData = activeTab === "users" ? usersList : activeTab === "foods" ? foodsList : ingredientsList;
                  const filteredDataLength = activeTab === "users" 
                    ? currentData.filter(u => (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || (u.email || "").toLowerCase().includes(searchQuery.toLowerCase())).length 
                    : currentData.filter(item => (item.food_name || item.name || "").toLowerCase().includes(searchQuery.toLowerCase())).length;
                  
                  const totalItems = filteredDataLength;
                  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
                  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
                  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

                  // Dynamic Window logic
                  const getPageNumbers = (current: number, total: number) => {
                    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
                    if (current <= 3) return [1, 2, 3, 4, '...', total];
                    if (current >= total - 2) return [1, '...', total - 3, total - 2, total - 1, total];
                    return [1, '...', current - 1, current, current + 1, '...', total];
                  };

                  return (
                    <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-white/50 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      <div>
                        Showing {startItem} to {endItem} of {totalItems} entries
                      </div>
                      <div className="flex items-center gap-2 font-medium">
                        <button 
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 disabled:opacity-50"
                        >&lt;</button>
                        
                        {getPageNumbers(currentPage, totalPages).map((page, index) => {
                          if (page === '...') {
                            return <span key={`ellipsis-${index}`} className="px-1 text-gray-400">...</span>;
                          }
                          return (
                            <button
                              key={`page-${page}`}
                              onClick={() => setCurrentPage(Number(page))}
                              className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${currentPage === page ? 'border-[#00a86b] bg-[#00a86b] text-white shadow-sm' : 'border-transparent hover:bg-gray-100 text-gray-600'}`}
                            >
                              {page}
                            </button>
                          );
                        })}

                        <button 
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 disabled:opacity-50"
                        >&gt;</button>
                      </div>
                    </div>
                  );
                })()}

              </div>
            </>
          )}

        </div>
      </main>

      {/* FOOD MODAL UI */}
      {isFoodModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-bold">{editingFoodId ? 'Edit Food Profile' : 'Add New Food'}</h3>
                <p className="text-sm text-gray-500 mt-1">Configure macros, micros, and dietary categorization.</p>
              </div>
              <button 
                onClick={() => setIsFoodModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-6">
              <form id="foodForm" onSubmit={handleFoodSubmit} className="space-y-8">
                
                {/* 1. Basic Information */}
                <div>
                  <h4 className="flex items-center text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    <span className="w-6 h-6 rounded-full bg-[#00a86b]/10 text-[#00a86b] flex items-center justify-center mr-2 text-xs">1</span> Basic Info
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">Food Name</label>
                      <input required type="text" value={foodForm.food_name} onChange={(e) => setFoodForm({...foodForm, food_name: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] transition-all" placeholder="e.g. Chicken Dal Bhat" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Category</label>
                      <select required value={foodForm.category} onChange={(e) => setFoodForm({...foodForm, category: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] transition-all">
                        <option value="Meal">Meal (Bhat, Roti, Thali)</option>
                        <option value="Snack">Snack (Momo, Chowmein)</option>
                        <option value="Curry">Curry / Soup (Tarkari, Dal)</option>
                        <option value="Breakfast">Breakfast / Sweet</option>
                        <option value="Staple">Staple</option>
                        <option value="Fruit">Fruit</option>
                        <option value="Vegetable">Vegetable</option>
                        <option value="Beverage">Beverage</option>
                        <option value="Select">Other Component</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Estimated Price (NPR)</label>
                      <input required type="number" min="0" value={foodForm.price} onChange={(e) => setFoodForm({...foodForm, price: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] transition-all" />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">Food Image (Cloudinary or URL)</label>
                      <div className="flex bg-gray-50 border border-gray-200 p-1 rounded-xl mb-3 w-fit">
                        <button type="button" onClick={() => setFoodImageMode("upload")} className={`px-4 py-1.5 text-xs font-bold rounded-lg flex items-center space-x-2 transition-all ${foodImageMode === "upload" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}><ImageIcon size={14} /> <span>Upload File</span></button>
                        <button type="button" onClick={() => setFoodImageMode("url")} className={`px-4 py-1.5 text-xs font-bold rounded-lg flex items-center space-x-2 transition-all ${foodImageMode === "url" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}><LinkIcon size={14} /> <span>Direct Link</span></button>
                      </div>

                      {foodImageMode === "upload" ? (
                        <input type="file" accept="image/*" onChange={e => setFoodImageFile(e.target.files?.[0] || null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#eefaf4] file:text-[#00a86b] hover:file:bg-[#e2f7eb] cursor-pointer" />
                      ) : (
                        <div className="flex">
                           <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm"><LinkIcon size={14} /></span>
                           <input type="text" value={foodForm.imageUrl} onChange={(e) => setFoodForm({...foodForm, imageUrl: e.target.value})} className="flex-1 px-3 py-2 border border-gray-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] transition-all" placeholder="https://res.cloudinary.com/..." />
                        </div>
                      )}
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">Keywords (Comma Separated)</label>
                      <input type="text" value={foodForm.keywords} onChange={(e) => setFoodForm({...foodForm, keywords: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] transition-all" placeholder="e.g. khasi, thali, spicy, momo" />
                    </div>
                  </div>
                </div>

                {/* 2. Macronutrients */}
                <div>
                  <h4 className="flex items-center text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    <span className="w-6 h-6 rounded-full bg-[#00a86b]/10 text-[#00a86b] flex items-center justify-center mr-2 text-xs">2</span> Macronutrients
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Calories</label>
                      <div className="relative"><input required type="number" step="any" min="0" value={foodForm.calories} onChange={(e) => setFoodForm({...foodForm, calories: Number(e.target.value)})} className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] transition-all" /><span className="absolute right-3 top-2.5 text-xs text-gray-400">kcal</span></div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Protein</label>
                      <div className="relative"><input required type="number" step="any" min="0" value={foodForm.protein} onChange={(e) => setFoodForm({...foodForm, protein: Number(e.target.value)})} className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] transition-all" /><span className="absolute right-3 top-2.5 text-xs text-gray-400">g</span></div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Carbs</label>
                      <div className="relative"><input required type="number" step="any" min="0" value={foodForm.carbs} onChange={(e) => setFoodForm({...foodForm, carbs: Number(e.target.value)})} className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] transition-all" /><span className="absolute right-3 top-2.5 text-xs text-gray-400">g</span></div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Fats</label>
                      <div className="relative"><input required type="number" step="any" min="0" value={foodForm.fats} onChange={(e) => setFoodForm({...foodForm, fats: Number(e.target.value)})} className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] transition-all" /><span className="absolute right-3 top-2.5 text-xs text-gray-400">g</span></div>
                    </div>
                  </div>
                </div>

                {/* 3. Micronutrients */}
                <div>
                  <h4 className="flex items-center text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                    <span className="w-6 h-6 rounded-full bg-[#00a86b]/10 text-[#00a86b] flex items-center justify-center mr-2 text-xs">3</span> Micronutrients
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Iron <span className="text-[10px] text-gray-400 font-normal ml-1">(mg)</span></label>
                      <input type="number" step="any" value={foodForm.micronutrients.iron} onChange={(e) => setFoodForm({...foodForm, micronutrients: {...foodForm.micronutrients, iron: Number(e.target.value)}})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Calcium <span className="text-[10px] text-gray-400 font-normal ml-1">(mg)</span></label>
                      <input type="number" step="any" value={foodForm.micronutrients.calcium} onChange={(e) => setFoodForm({...foodForm, micronutrients: {...foodForm.micronutrients, calcium: Number(e.target.value)}})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Vitamin C <span className="text-[10px] text-gray-400 font-normal ml-1">(mg)</span></label>
                      <input type="number" step="any" value={foodForm.micronutrients.vitamin_c} onChange={(e) => setFoodForm({...foodForm, micronutrients: {...foodForm.micronutrients, vitamin_c: Number(e.target.value)}})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Fiber <span className="text-[10px] text-gray-400 font-normal ml-1">(g)</span></label>
                      <input type="number" step="any" value={foodForm.micronutrients.fiber} onChange={(e) => setFoodForm({...foodForm, micronutrients: {...foodForm.micronutrients, fiber: Number(e.target.value)}})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Sugar <span className="text-[10px] text-gray-400 font-normal ml-1">(g)</span></label>
                      <input type="number" step="any" value={foodForm.micronutrients.sugar} onChange={(e) => setFoodForm({...foodForm, micronutrients: {...foodForm.micronutrients, sugar: Number(e.target.value)}})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Sodium <span className="text-[10px] text-gray-400 font-normal ml-1">(mg)</span></label>
                      <input type="number" step="any" value={foodForm.micronutrients.sodium} onChange={(e) => setFoodForm({...foodForm, micronutrients: {...foodForm.micronutrients, sodium: Number(e.target.value)}})} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] transition-all" />
                    </div>
                  </div>
                </div>

              </form>
            </div>

            {/* Modal Footer Controls */}
            <div className="border-t border-gray-100 p-6 bg-gray-50 flex items-center justify-end space-x-3 shrink-0">
              <button 
                onClick={() => setIsFoodModalOpen(false)}
                type="button" 
                className="px-5 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                disabled={isSubmitting}
                form="foodForm"
                type="submit" 
                className="px-6 py-2.5 bg-[#00a86b] hover:bg-[#00905a] text-white rounded-xl shadow-sm shadow-[#00a86b]/20 transition-all font-medium flex items-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                <span>{editingFoodId ? 'Save Changes' : 'Publish Food'}</span>
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* --- INGREDIENT MODAL (Kept Logic, Polished) --- */}
      {isIngredientModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-100 sticky top-0 bg-white z-10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Add Ingredient</h2>
              <button onClick={() => setIsIngredientModalOpen(false)} className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form onSubmit={handleIngredientSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ingredient Name *</label>
                <input required type="text" value={ingredientForm.name} onChange={e => setIngredientForm({...ingredientForm, name: e.target.value})} className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2.5 px-4 focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] outline-none transition-all font-medium" placeholder="e.g. Raw Rice" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Calories (per 100g) *</label>
                <input required type="number" min="0" value={ingredientForm.caloriesPer100g} onChange={e => setIngredientForm({...ingredientForm, caloriesPer100g: e.target.value})} className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2.5 px-4 focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] outline-none transition-all font-medium" />
              </div>

              <div className="grid grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Proteins *</label>
                  <input required type="number" min="0" step="0.1" value={ingredientForm.proteinPer100g} onChange={e => setIngredientForm({...ingredientForm, proteinPer100g: e.target.value})} className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2.5 px-4 focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] outline-none transition-all font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Carbs *</label>
                  <input required type="number" min="0" step="0.1" value={ingredientForm.carbsPer100g} onChange={e => setIngredientForm({...ingredientForm, carbsPer100g: e.target.value})} className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2.5 px-4 focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] outline-none transition-all font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Fats *</label>
                  <input required type="number" min="0" step="0.1" value={ingredientForm.fatPer100g} onChange={e => setIngredientForm({...ingredientForm, fatPer100g: e.target.value})} className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2.5 px-4 focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] outline-none transition-all font-medium" />
                </div>
              </div>
              
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Ingredient Image (Cloudinary or URL)</label>
                <div className="flex bg-gray-50 border border-gray-200 p-1 rounded-xl w-fit">
                  <button type="button" onClick={() => setIngredientImageMode("upload")} className={`px-4 py-1.5 text-xs font-bold rounded-lg flex items-center space-x-2 transition-all ${ingredientImageMode === "upload" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}><ImageIcon size={14} /> <span>Upload File</span></button>
                  <button type="button" onClick={() => setIngredientImageMode("url")} className={`px-4 py-1.5 text-xs font-bold rounded-lg flex items-center space-x-2 transition-all ${ingredientImageMode === "url" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}><LinkIcon size={14} /> <span>Direct Link</span></button>
                </div>

                {ingredientImageMode === "upload" ? (
                  <input type="file" accept="image/*" onChange={e => setIngredientImageFile(e.target.files?.[0] || null)} className="w-full mt-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#eefaf4] file:text-[#00a86b] hover:file:bg-[#e2f7eb] cursor-pointer" />
                ) : (
                  <div className="flex mt-2">
                     <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm"><LinkIcon size={14} /></span>
                     <input type="text" value={ingredientForm.imageUrl} onChange={(e) => setIngredientForm({...ingredientForm, imageUrl: e.target.value})} className="flex-1 px-3 py-2 border border-gray-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[#00a86b]/20 focus:border-[#00a86b] transition-all" placeholder="https://res.cloudinary.com/..." />
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsIngredientModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-bold text-white bg-[#00a86b] rounded-lg hover:bg-[#00905a] disabled:opacity-50 flex items-center gap-2 shadow-sm transition-colors">
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />} Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
    </div>
  );
}
