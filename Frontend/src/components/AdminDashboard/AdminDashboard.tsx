import React, { useState, useEffect } from "react";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import Sidebar from "./Sidebar";
import Header from "./Header";
import TableControls from "./TableControls";
import UsersTable from "./UsersTable";
import FoodsTable from "./FoodsTable";
import IngredientsTable from "./IngredientsTable";
import Pagination from "./Pagination";
import FoodModal from "./FoodModal";
import IngredientModal from "./IngredientModal";
import type { TabType, FoodFormState, IngredientFormState, User, Food, Ingredient } from "./types";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  // App state
  const [activeTab, setActiveTab] = useState<TabType>("users");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 8;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data states
  const [usersList, setUsersList] = useState<User[]>([]);
  const [foodsList, setFoodsList] = useState<Food[]>([]);
  const [ingredientsList, setIngredientsList] = useState<Ingredient[]>([]);

  // Modal states
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [foodForm, setFoodForm] = useState<FoodFormState>({
    food_name: '', calories: 0, protein: 0, carbs: 0, fats: 0, price: 0, category: 'Meal', imageUrl: '', keywords: '',
    micronutrients: { iron: 0, calcium: 0, vitamin_c: 0, fiber: 0, sugar: 0, sodium: 0 }
  });

  const [foodImageMode, setFoodImageMode] = useState<"upload" | "url">("upload");
  const [foodImageFile, setFoodImageFile] = useState<File | null>(null);

  const [ingredientForm, setIngredientForm] = useState<IngredientFormState>({
    name: "", calories: "", protein: "", carbs: "", fats: "", imageUrl: ""
  });
  const [editingIngredientId, setEditingIngredientId] = useState<string | null>(null);
  const [ingredientImageMode, setIngredientImageMode] = useState<"upload" | "url">("upload");
  const [ingredientImageFile, setIngredientImageFile] = useState<File | null>(null);

  // Handlers
  const handleOpenFoodModal = (food: Food | null = null) => {
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
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
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
      const config = { headers: { Authorization: `Bearer ${(user as any)?.token || JSON.parse(localStorage.getItem("userInfo")!).token}` } };
      
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

  const getHeaders = () => {
    const token = (user as any)?.token || JSON.parse(localStorage.getItem("userInfo")!).token;
    return { headers: { Authorization: `Bearer ${token}` } };
  };

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

  const handleOpenIngredientModal = (ingredient: Ingredient | null = null) => {
    if (ingredient) {
      setEditingIngredientId(ingredient._id);
      setIngredientForm({
        name: ingredient.name || "",
        calories: String(ingredient.calories ?? ""),
        protein: String(ingredient.protein ?? ""),
        carbs: String(ingredient.carbs ?? ""),
        fats: String(ingredient.fats ?? ""),
        imageUrl: ingredient.image || ""
      });
      setIngredientImageMode(ingredient.image && ingredient.image.startsWith('http') ? 'url' : 'upload');
      setIngredientImageFile(null);
    } else {
      setEditingIngredientId(null);
      setIngredientForm({ name: "", calories: "", protein: "", carbs: "", fats: "", imageUrl: "" });
      setIngredientImageMode('upload');
      setIngredientImageFile(null);
    }
    setIsIngredientModalOpen(true);
  };

  // --- INGREDIENT HANDLERS ---
  const handleIngredientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", ingredientForm.name);
      formData.append("calories", ingredientForm.calories);
      formData.append("protein", ingredientForm.protein);
      formData.append("carbs", ingredientForm.carbs);
      formData.append("fats", ingredientForm.fats);
      
      if (ingredientImageMode === "upload" && ingredientImageFile) {
        formData.append("image", ingredientImageFile);
      } else if (ingredientImageMode === "url" && ingredientForm.imageUrl) {
        formData.append("imageUrl", ingredientForm.imageUrl);
      }

      const token = localStorage.getItem("userInfo") ? JSON.parse(localStorage.getItem("userInfo")!).token : "";
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (editingIngredientId) {
        await axios.put(`/api/admin/ingredients/${editingIngredientId}`, formData, config);
        toast.success("Ingredient updated successfully");
      } else {
        await axios.post("/api/admin/ingredients", formData, config);
        toast.success("Ingredient added successfully");
      }
      
      setIsIngredientModalOpen(false);
      setIngredientForm({ name: "", calories: "", protein: "", carbs: "", fats: "", imageUrl: "" });
      setEditingIngredientId(null);
      
      const iRes = await axios.get("/api/admin/ingredients", getHeaders());
      setIngredientsList(iRes.data.ingredients || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Error ${editingIngredientId ? 'updating' : 'adding'} ingredient`);
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

  // Dynamic values
  const pageTitle = activeTab === "users" ? "User Management" : activeTab === "foods" ? "Food Library" : "Ingredient Database";
  const primaryButtonAction = activeTab === "users" ? null : 
    activeTab === "foods" ? () => handleOpenFoodModal() :
    () => handleOpenIngredientModal();
  const primaryButtonLabel = activeTab === "users" ? null : activeTab === "foods" ? "Add New Food" : "Add Ingredient";

  // Data calculation for pagination
  const currentData = activeTab === "users" ? usersList : activeTab === "foods" ? foodsList : ingredientsList;
  const filteredDataLength = activeTab === "users" 
    ? (currentData as User[]).filter(u => (u.email || "").toLowerCase().includes(searchQuery.toLowerCase())).length 
    : (currentData as any[]).filter(item => (item.food_name || item.name || "").toLowerCase().includes(searchQuery.toLowerCase())).length;

  return (
    <div className="fixed inset-0 z-50 bg-[#f4f9f4] flex font-sans text-neutral-900 pointer-events-auto">
      
      <Sidebar 
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setCurrentPage={setCurrentPage}
        setSearchQuery={setSearchQuery}
        handleLogout={handleLogout}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        <Header 
          pageTitle={pageTitle}
          primaryButtonAction={primaryButtonAction}
          primaryButtonLabel={primaryButtonLabel}
        />

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
             <div className="flex justify-center items-center h-64"><Loader2 className="w-10 h-10 animate-spin text-[#00a86b]" /></div>
          ) : (
            <div className="bg-white rounded-xl border border-neutral-200/60 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] flex flex-col">
              
              <TableControls 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                setCurrentPage={setCurrentPage}
              />

              {activeTab === "users" && (
                <UsersTable 
                  usersList={usersList}
                  searchQuery={searchQuery}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  currentUser={user}
                  toggleUserRole={toggleUserRole}
                  deleteUser={deleteUser}
                />
              )}

              {activeTab === "foods" && (
                <FoodsTable 
                  foodsList={foodsList}
                  searchQuery={searchQuery}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  handleOpenFoodModal={handleOpenFoodModal}
                  deleteFood={deleteFood}
                />
              )}

              {activeTab === "ingredients" && (
                <IngredientsTable 
                  ingredientsList={ingredientsList}
                  searchQuery={searchQuery}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  onEdit={handleOpenIngredientModal}
                  deleteIngredient={deleteIngredient}
                />
              )}

              <Pagination 
                totalItems={filteredDataLength}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />

            </div>
          )}
        </div>
      </main>

      <FoodModal 
        isFoodModalOpen={isFoodModalOpen}
        setIsFoodModalOpen={setIsFoodModalOpen}
        editingFoodId={editingFoodId}
        foodForm={foodForm}
        setFoodForm={setFoodForm}
        handleFoodSubmit={handleFoodSubmit}
        isSubmitting={isSubmitting}
        foodImageMode={foodImageMode}
        setFoodImageMode={setFoodImageMode}
        setFoodImageFile={setFoodImageFile}
      />

      <IngredientModal 
        isIngredientModalOpen={isIngredientModalOpen}
        setIsIngredientModalOpen={setIsIngredientModalOpen}
        editingIngredientId={editingIngredientId}
        ingredientForm={ingredientForm}
        setIngredientForm={setIngredientForm}
        handleIngredientSubmit={handleIngredientSubmit}
        isSubmitting={isSubmitting}
        ingredientImageMode={ingredientImageMode}
        setIngredientImageMode={setIngredientImageMode}
        setIngredientImageFile={setIngredientImageFile}
      />
      
    </div>
  );
}
