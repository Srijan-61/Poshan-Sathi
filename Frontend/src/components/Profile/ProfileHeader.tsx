import React from "react";
import type { ProfileData } from "./types";

interface Props {
  profile: ProfileData;
  isUploading: boolean;
  imagePreview: string | null;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ProfileHeader({ profile, isUploading, imagePreview, handleImageChange }: Props) {
  const [showOptions, setShowOptions] = React.useState(false);

  const t = {
    heading: "text-neutral-900",
    subtext: "text-neutral-500",
    card: "bg-white border-neutral-100 shadow-sm",
    avatarBg: "bg-neutral-100 text-neutral-400",
    tagBlueBg: "bg-blue-50 text-blue-600",
    tagGreenBg: "bg-green-50 text-green-600",
  };

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    window.location.href = "/login";
  };

  return (
    <>
      <section className="flex items-start justify-between gap-4 relative">
        <div className="flex flex-col gap-2">
          <h1 className={`text-3xl font-extrabold tracking-tight ${t.heading}`}>
            Your Profile
          </h1>
          <p className={`font-medium ${t.subtext}`}>
            Update your metrics to recalculate your daily nutrition needs.
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="p-2 rounded-full hover:bg-neutral-100 transition-colors text-neutral-500"
          >
            <span className="material-symbols-outlined">settings</span>
          </button>

          {showOptions && (
            <>
              <div 
                className="fixed inset-0 z-[60]" 
                onClick={() => setShowOptions(false)} 
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-neutral-100 p-2 z-[70] animate-in fade-in zoom-in duration-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-semibold"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      <section
        className={`flex flex-col items-center md:flex-row gap-6 rounded-3xl p-6 border transition-colors duration-300 ${t.card}`}
      >
        <div className="relative group">
          <div className={`w-32 h-32 rounded-full overflow-hidden border-4 ${"border-neutral-50"} shadow-md ${isUploading ? 'opacity-50' : 'opacity-100'} transition-opacity`}>
            {imagePreview || profile.profileImage ? (
              <img 
                src={imagePreview || profile.profileImage} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${t.avatarBg}`}>
                <span className="material-symbols-outlined text-5xl">person</span>
              </div>
            )}
            
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          
          <label 
            htmlFor="profile-image-upload" 
            className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-colors border-2 border-white"
          >
            <span className="material-symbols-outlined text-sm">photo_camera</span>
            <input 
              id="profile-image-upload" 
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageChange}
              disabled={isUploading}
            />
          </label>
        </div>

        <div className="flex flex-col text-center md:text-left">
          <h2 className={`text-2xl font-bold ${t.heading}`}>{profile.name || "User Name"}</h2>
          <p className={`font-medium capitalize ${t.subtext}`}>{profile.gender} • {profile.age} years old</p>
          <div className="flex gap-2 mt-2 justify-center md:justify-start">
            <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${t.tagBlueBg}`}>
              {profile.healthGoals.primaryGoal.replace(/([A-Z])/g, ' $1').trim()}
            </span>
            <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${t.tagGreenBg}`}>
              {profile.dietType}
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
