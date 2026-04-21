import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../utils/axios';
import { type AnalyticsTargets, DEFAULT_TARGETS } from '../types/nutrition';

export const useAppData = () => {
  const [user, setUser] = useState<any>(() => {
    const savedUser = localStorage.getItem('userInfo');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [profile, setProfile] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [foods, setFoods] = useState<any[]>([]);
  const [targets, setTargets] = useState<AnalyticsTargets>(DEFAULT_TARGETS);

  // Fetch data ONLY when the user is logged in
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  // Data Fetching Logic (Secure via Custom Axios interceptor)
  const fetchData = async () => {
    try {
      // API automatically attaches JWT header via interceptor!
      const [fRes, lRes, pRes] = await Promise.all([
        API.get('/api/foods'),
        API.get('/api/logs'),
        API.get('/api/profile')
      ]);

      setFoods(fRes.data);
      setLogs(lRes.data);

      const profileData = pRes.data?.profile || {};
      setProfile(profileData);

      // Keep localStorage in sync with the latest profileImage so the Nav avatar updates
      if (profileData.profileImage) {
        const stored = JSON.parse(localStorage.getItem('userInfo') || '{}');
        if (stored.profileImage !== profileData.profileImage) {
          stored.profileImage = profileData.profileImage;
          localStorage.setItem('userInfo', JSON.stringify(stored));
        }
      }
      const reqs = pRes.data?.dailyRequirements || {};
      const monthlyBudget = profileData.monthlyBudget != null ? Number(profileData.monthlyBudget) : DEFAULT_TARGETS.monthlyBudget;
      const dailyBudget = monthlyBudget > 0 ? Math.round(monthlyBudget / 30) : 0;

      setTargets({
        dailyBudget,
        monthlyBudget,
        dailyRequirements: {
          calories: Number(reqs.calories) || DEFAULT_TARGETS.dailyRequirements.calories,
          protein: Number(reqs.protein) || DEFAULT_TARGETS.dailyRequirements.protein,
          carbs: Number(reqs.carbs) || DEFAULT_TARGETS.dailyRequirements.carbs,
          fats: Number(reqs.fats) || DEFAULT_TARGETS.dailyRequirements.fats,
          iron: Number(reqs.iron) || DEFAULT_TARGETS.dailyRequirements.iron,
          calcium: Number(reqs.calcium) || DEFAULT_TARGETS.dailyRequirements.calcium,
          vitaminC: Number(reqs.vitaminC) || DEFAULT_TARGETS.dailyRequirements.vitaminC,
          fiber: Number(reqs.fiber) || DEFAULT_TARGETS.dailyRequirements.fiber,
          sugar: Number(reqs.sugar) || DEFAULT_TARGETS.dailyRequirements.sugar,
          sodium: Number(reqs.sodium) || DEFAULT_TARGETS.dailyRequirements.sodium,
        },
      });
    } catch (err: any) {
      console.error('Backend Error fetching data:', err.response?.data?.message || err.message);
      toast.error(err.response?.data?.message || 'Failed to fetch data');

      // The 401 interceptor in axios.ts handles local storage, we just sync the state here if needed
      if (err.response?.status === 401) {
        setUser(null);
      }
    }
  };

  // Logging a new meal
  const handleLog = async (food: any, qty: number = 1) => {
    try {
      await API.post('/api/logs', {
        food_name: food.food_name,
        quantity: qty,
        calories: food.calories * qty,
        cost: food.price * qty,
        protein: food.protein ? food.protein * qty : 0,
        carbs: food.carbs ? food.carbs * qty : 0,
        fats: food.fats ? food.fats * qty : 0,
        micros: {
          iron: food.micros?.iron ? food.micros.iron * qty : 0,
          calcium: food.micros?.calcium ? food.micros.calcium * qty : 0,
          vitaminC: food.micros?.vitaminC ? food.micros.vitaminC * qty : 0,
          fiber: food.micros?.fiber ? food.micros.fiber * qty : 0,
          sugar: food.micros?.sugar ? food.micros.sugar * qty : 0,
          sodium: food.micros?.sodium ? food.micros.sodium * qty : 0,
        },
      });

      fetchData();
      toast.success('Food logged successfully!');
    } catch (err: any) {
      console.error('Error logging food:', err.response?.data?.message || err.message);
      toast.error(err.response?.data?.message || 'Failed to log food');
    }
  };

  // Deleting a meal log
  const handleDeleteLog = async (id: string) => {
    try {
      await API.delete(`/api/logs/${id}`);
      fetchData();
      toast.success('Log deleted successfully!');
    } catch (err: any) {
      console.error('Error deleting log:', err.response?.data?.message || err.message);
      toast.error(err.response?.data?.message || 'Failed to delete log');
    }
  };

  // Updating a meal log's quantity
  const handleUpdateLog = async (id: string, newQuantity: number) => {
    try {
      await API.patch(`/api/logs/${id}`, { quantity: newQuantity });
      fetchData();
      toast.success('Quantity updated!');
    } catch (err: any) {
      console.error('Error updating log:', err.response?.data?.message || err.message);
      toast.error(err.response?.data?.message || 'Failed to update quantity');
    }
  };

  return {
    user,
    setUser,
    profile,
    logs,
    foods,
    targets,
    fetchData,
    handleLog,
    handleDeleteLog,
    handleUpdateLog
  };
};
