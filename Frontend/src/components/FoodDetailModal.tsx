import React from "react";

interface FoodDetail {
  food_name: string;
  calories: number;
  price: number;
  image: string;
  micros?: { iron: number };
  quantity: number; // Logged quantity
}

interface Props {
  log: FoodDetail | null;
  onClose: () => void;
}

const FoodDetailModal: React.FC<Props> = ({ log, onClose }) => {
  if (!log) return null;

  // Calculate totals based on quantity logged
  const totalCals = log.calories; // The log already has total cals calculated
  const totalIron = (log.micros?.iron || 0) * log.quantity;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl transform transition-all scale-100">
        {/* Header Image */}
        <div className="relative h-48 bg-neutral-100">
          <img
            src={log.image || "https://placehold.co/600x400?text=No+Image"}
            alt={log.food_name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 text-neutral-800 p-2 rounded-full font-bold shadow-sm hover:bg-white"
          >
            ✕
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <h2 className="text-white text-2xl font-bold">{log.food_name}</h2>
            <span className="text-white/90 text-sm font-medium bg-white/20 px-2 py-1 rounded-lg backdrop-blur-md">
              Logged: {log.quantity} unit(s)
            </span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 text-center">
              <p className="text-xs text-orange-600 font-bold uppercase tracking-wide">
                Energy
              </p>
              <p className="text-2xl font-black text-orange-800">{totalCals}</p>
              <p className="text-[10px] text-orange-400">kcal</p>
            </div>
            <div className="bg-green-50 p-4 rounded-2xl border border-green-100 text-center">
              <p className="text-xs text-green-600 font-bold uppercase tracking-wide">
                Cost
              </p>
              <p className="text-2xl font-black text-green-800">
                Rs. {log.price}
              </p>
              <p className="text-[10px] text-green-400">total</p>
            </div>
          </div>

          {/* Iron Watch Section */}
          <div className="bg-rose-50 rounded-xl p-4 border border-rose-100 mb-6 flex items-center gap-4">
            <div className="bg-rose-100 p-3 rounded-full text-2xl">🩸</div>
            <div>
              <h4 className="font-bold text-rose-800">Iron Intake</h4>
              <p className="text-xs text-rose-600">
                This meal provided{" "}
                <span className="font-bold">{totalIron.toFixed(1)} mg</span> of
                Iron.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-neutral-900 text-white rounded-xl font-bold hover:bg-black transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodDetailModal;
