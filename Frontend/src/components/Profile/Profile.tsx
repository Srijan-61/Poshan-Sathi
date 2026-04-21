import React, { useState, useEffect } from "react";
import axios from "../../utils/axios";
import toast from "react-hot-toast";

import type { ProfileData, DailyRequirements, CustomHealthTarget } from "./types";
import ProfileHeader from "./ProfileHeader";
import ProfileForm from "./ProfileForm";
import DailyTargetsDisplay from "./DailyTargetsDisplay";
import CustomHealthTargets from "./CustomHealthTargets";

interface Props {
  onProfileSaved?: () => void;
}

const Profile: React.FC<Props> = ({ onProfileSaved }) => {
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    age: "",
    gender: "male",
    weight: "",
    height: "",
    activityLevel: "moderatelyActive",
    dietType: "nonVegetarian",
    monthlyBudget: "",
    healthGoals: { primaryGoal: "maintainWeight" },
    healthConditions: [],
    nutrientGoals: { customHealthTargets: [] },
  });

  const [requirements, setRequirements] = useState<DailyRequirements | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        if (!userInfo.token) return;

        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        };
        const { data } = await axios.get("/api/profile", config);

        if (data.profile) {
          setProfile((prev) => ({
            ...prev,
            ...data.profile,
            nutrientGoals: {
              ...prev.nutrientGoals,
              ...data.profile.nutrientGoals,
            },
          }));
        }
        if (data.dailyRequirements) {
          setRequirements(data.dailyRequirements);
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "primaryGoal") {
      setProfile({
        ...profile,
        healthGoals: { ...profile.healthGoals, primaryGoal: value },
      });
    } else if (name === "healthConditions") {
      setProfile({ ...profile, healthConditions: [value] });
    } else {
      setProfile({ ...profile, [name]: value });
    }
  };

  const handleCustomTargetsChange = (targets: CustomHealthTarget[]) => {
    setProfile((prev) => ({
      ...prev,
      nutrientGoals: {
        ...prev.nutrientGoals,
        customHealthTargets: targets,
      },
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      const { data } = await axios.put("/api/profile", { profile }, config);

      if (data.dailyRequirements) {
        setRequirements(data.dailyRequirements);
      }
      toast.success("Profile updated successfully!");

      // Notify parent to re-fetch app data so Dashboard reflects changes immediately
      onProfileSaved?.();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    await uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      const { data } = await axios.put("/api/profile/upload-image", formData, config);

      setProfile((prev) => ({ ...prev, profileImage: data.profileImage }));
      
      const updatedUserInfo = { ...userInfo, profileImage: data.profileImage };
      localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));

      toast.success("Profile image updated!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to upload image.");
      setImagePreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`text-center p-10 text-neutral-500`}>Loading profile...</div>
    );
  }

  return (
    <div className={`flex flex-col gap-6 pb-24 md:pb-6 pt-2 animate-in fade-in slide-in-from-bottom-4 transition-colors duration-300`}>
      <ProfileHeader
        profile={profile}
        isUploading={isUploading}
        imagePreview={imagePreview}
        handleImageChange={handleImageChange}
      />

      <ProfileForm
        profile={profile}
        handleChange={handleChange}
        handleSave={handleSave}
        isSaving={isSaving}
      />

      <CustomHealthTargets
        targets={profile.nutrientGoals?.customHealthTargets || []}
        onChange={handleCustomTargetsChange}
      />

      {requirements && <DailyTargetsDisplay requirements={requirements} isAnemic={profile.healthConditions.includes("anemia")} />}
    </div>
  );
};

export default Profile;

