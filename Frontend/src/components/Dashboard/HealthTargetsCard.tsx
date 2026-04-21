
interface CustomHealthTarget {
  nutrient: string;
  type: 'min' | 'max';
  value: number;
  label: string;
}

interface HealthTargetsCardProps {
  user: {
    healthConditions?: string[];
    nutrientGoals?: {
      customHealthTargets?: CustomHealthTarget[];
    };
  };
  todayLogs: any[];
  goals: Record<string, number>;
}

// Nutrient metadata for display
const NUTRIENT_META: Record<string, { label: string; unit: string; icon: string; color: string }> = {
  sugar:     { label: "Sugar",      unit: "g",  icon: "bloodtype",       color: "#e11d48" },
  sodium:    { label: "Sodium",     unit: "mg", icon: "favorite",        color: "#0284c7" },
  iron:      { label: "Iron",       unit: "mg", icon: "water_drop",      color: "#d97706" },
  calcium:   { label: "Calcium",    unit: "mg", icon: "skeleton",        color: "#2563eb" },
  fiber:     { label: "Fiber",      unit: "g",  icon: "grass",           color: "#65a30d" },
  protein:   { label: "Protein",    unit: "g",  icon: "fitness_center",  color: "#4f46e5" },
  carbs:     { label: "Carbs",      unit: "g",  icon: "grain",           color: "#ea580c" },
  fats:      { label: "Fats",       unit: "g",  icon: "opacity",         color: "#059669" },
  vitaminC:  { label: "Vitamin C",  unit: "mg", icon: "eco",             color: "#ca8a04" },
  potassium: { label: "Potassium",  unit: "mg", icon: "bolt",            color: "#7c3aed" },
  magnesium: { label: "Magnesium",  unit: "mg", icon: "diamond",         color: "#0d9488" },
  zinc:      { label: "Zinc",       unit: "mg", icon: "shield",          color: "#0891b2" },
};

// Extract current value from today's logs
const getTotalForNutrient = (logs: any[], nutrient: string): number => {
  return logs.reduce((sum, log) => {
    // Macros are top-level, micros are nested
    if (['protein', 'carbs', 'fats'].includes(nutrient)) {
      return sum + (log[nutrient] || 0);
    }
    return sum + (log.micros?.[nutrient] || 0);
  }, 0);
};

// Default nutrient targets for common health conditions
const CONDITION_DEFAULTS: Record<string, CustomHealthTarget[]> = {
  diabetes: [
    { nutrient: "sugar", type: "max", value: 30, label: "Diabetes — Sugar Limit" },
    { nutrient: "carbs", type: "max", value: 250, label: "Diabetes — Carbs Limit" },
    { nutrient: "fiber", type: "min", value: 25, label: "Diabetes — Fiber Goal" },
  ],
  preDiabetes: [
    { nutrient: "sugar", type: "max", value: 40, label: "Pre-Diabetes — Sugar Limit" },
    { nutrient: "fiber", type: "min", value: 25, label: "Pre-Diabetes — Fiber Goal" },
  ],
  hypertension: [
    { nutrient: "sodium", type: "max", value: 1500, label: "Hypertension — Sodium Limit" },
  ],
  anemia: [
    { nutrient: "iron", type: "min", value: 20, label: "Anemia — Iron Goal" },
    { nutrient: "vitaminC", type: "min", value: 90, label: "Anemia — Vitamin C Goal" },
  ],
  heartDisease: [
    { nutrient: "sodium", type: "max", value: 1500, label: "Heart Disease — Sodium Limit" },
    { nutrient: "fats", type: "max", value: 55, label: "Heart Disease — Fats Limit" },
    { nutrient: "fiber", type: "min", value: 25, label: "Heart Disease — Fiber Goal" },
  ],
  cholesterol: [
    { nutrient: "fats", type: "max", value: 50, label: "High Cholesterol — Fats Limit" },
    { nutrient: "fiber", type: "min", value: 30, label: "High Cholesterol — Fiber Goal" },
  ],
  kidneyDisease: [
    { nutrient: "sodium", type: "max", value: 2000, label: "Kidney — Sodium Limit" },
    { nutrient: "protein", type: "max", value: 50, label: "Kidney — Protein Limit" },
  ],
  gastritis: [
    { nutrient: "fiber", type: "min", value: 25, label: "Gastritis — Fiber Goal" },
    { nutrient: "fats", type: "max", value: 50, label: "Gastritis — Fats Limit" },
  ],
};

// Friendly condition names for display
const CONDITION_LABELS: Record<string, string> = {
  diabetes: "Diabetes",
  preDiabetes: "Pre-Diabetes",
  hypertension: "Hypertension",
  anemia: "Anemia",
  heartDisease: "Heart Disease",
  cholesterol: "High Cholesterol",
  kidneyDisease: "Kidney Disease",
  gastritis: "Gastritis",
};

export default function HealthTargetsCard({ user, todayLogs}: HealthTargetsCardProps) {
  const customTargets = user?.nutrientGoals?.customHealthTargets || [];

  // Auto-generate targets from selected health conditions
  const conditionTargets: CustomHealthTarget[] = [];
  const activeConditions: string[] = [];
  (user?.healthConditions || []).forEach((condition) => {
    if (condition && condition !== "none" && CONDITION_DEFAULTS[condition]) {
      conditionTargets.push(...CONDITION_DEFAULTS[condition]);
      activeConditions.push(CONDITION_LABELS[condition] || condition);
    }
  });

  // Merge: custom targets take priority, then fill in condition defaults (avoid duplicates)
  const customKeys = new Set(customTargets.map((t) => `${t.nutrient}-${t.type}`));
  const dedupedConditionTargets = conditionTargets.filter(
    (t) => !customKeys.has(`${t.nutrient}-${t.type}`)
  );
  const allTargets = [...customTargets, ...dedupedConditionTargets];

  // If no targets at all, show nothing
  if (allTargets.length === 0) {
    return null;
  }

  const renderMetric = (target: CustomHealthTarget, index: number) => {
    const meta = NUTRIENT_META[target.nutrient] || {
      label: target.nutrient,
      unit: "",
      icon: "monitor_heart",
      color: "#71717a",
    };

    const current = getTotalForNutrient(todayLogs, target.nutrient);
    const limit = target.value;
    const isMin = target.type === "min";

    const percentage = Math.min((current / Math.max(limit, 1)) * 100, 100);

    // Color logic: for "max" targets, going over is bad; for "min" targets, being low is bad
    let statusColor = "#22c55e"; // green

    if (isMin) {
      if (percentage < 40) { statusColor = "#e11d48"; }
      else if (percentage < 100) { statusColor = "#ea580c";  }
    } else {
      if (percentage > 85) { statusColor = "#e11d48";}
      else if (percentage >= 50) { statusColor = "#ea580c"; }
    }

    const headerLabel = target.label || `${meta.label} ${isMin ? "Goal" : "Limit"}`;

    return (
      <div
        key={`${target.nutrient}-${target.type}-${index}`}
        style={{
          background: "#fff",
          borderRadius: "16px",
          border: "1px solid #e5e7eb",
          borderLeft: `4px solid ${meta.color}`,
          padding: "20px 24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          transition: "box-shadow 0.2s, transform 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <span style={{
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#6b7280",
          }}>
            {isMin ? "MIN TARGET" : "MAX LIMIT"}: {headerLabel.toUpperCase()}
          </span>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "20px", color: meta.color }}
          >
            {meta.icon}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "10px" }}>
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#6b7280" }}>
            {meta.label} Intake
          </span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
            <span style={{ fontSize: "26px", fontWeight: 900, color: "#111827", fontVariantNumeric: "tabular-nums" }}>
              {current.toFixed(1)}{meta.unit}
            </span>
            <span style={{ fontSize: "13px", fontWeight: 500, color: "#9ca3af" }}>
              / {isMin ? `${limit}+` : limit}{meta.unit}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ width: "100%", borderRadius: "9999px", height: "8px", background: "#f3f4f6", overflow: "hidden" }}>
          <div style={{
            background: statusColor,
            height: "100%",
            borderRadius: "9999px",
            width: `${percentage}%`,
            transition: "width 0.7s ease-out",
          }}></div>
        </div>

        {/* Status messages */}
        {!isMin && percentage >= 100 && (
          <p style={{
            fontSize: "10px", fontWeight: 700, color: "#e11d48", marginTop: "8px",
            textTransform: "uppercase", letterSpacing: "-0.02em",
            animation: "pulse 2s infinite",
          }}>
            ⚠ Limit Exceeded — Please monitor your intake carefully
          </p>
        )}
        {isMin && percentage < 100 && (
          <p style={{
            fontSize: "10px", fontWeight: 700, color: "#ea580c", marginTop: "8px",
            textTransform: "uppercase", letterSpacing: "-0.02em",
          }}>
            ↑ Recommendation: Eat more {meta.label.toLowerCase()}-rich foods
          </p>
        )}
        {isMin && percentage >= 100 && (
          <p style={{
            fontSize: "10px", fontWeight: 700, color: "#16a34a", marginTop: "8px",
            textTransform: "uppercase", letterSpacing: "-0.02em",
          }}>
            ✓ Great job! Daily {meta.label.toLowerCase()} target reached
          </p>
        )}
      </div>
    );
  };

  return (
    <section style={{
      borderRadius: "16px",
      border: "1px solid #e5e7eb",
      background: "#fafafa",
      padding: "24px",
      marginBottom: "0",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
        <span className="material-symbols-outlined" style={{ fontSize: "22px", color: "#ef4444" }}>
          monitor_heart
        </span>
        <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#111827", margin: 0 }}>
          Health Condition Monitoring
        </h3>
      </div>

      {activeConditions.length > 0 && (
        <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "16px", fontWeight: 500 }}>
          Tracking nutrients for: <span style={{ fontWeight: 700, color: "#111827" }}>{activeConditions.join(", ")}</span>
          {customTargets.length > 0 && <span> + {customTargets.length} custom target{customTargets.length > 1 ? "s" : ""}</span>}
        </p>
      )}
      {activeConditions.length === 0 && customTargets.length > 0 && (
        <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "16px", fontWeight: 500 }}>
          Monitoring {customTargets.length} custom nutrient target{customTargets.length > 1 ? "s" : ""}
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {allTargets.map((target, index) => renderMetric(target, index))}
      </div>
    </section>
  );
}
