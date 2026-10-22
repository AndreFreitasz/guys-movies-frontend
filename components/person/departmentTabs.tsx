import React from "react";
import { DepartmentSummary } from "../../interfaces/person/types";

interface DepartmentTabsProps {
  departments: DepartmentSummary[];
  active: string;
  onChange: (key: string) => void;
}

const DepartmentTabs: React.FC<DepartmentTabsProps> = ({
  departments,
  active,
  onChange,
}) => {
  if (departments.length < 2) return null;

  return (
    <div className="hide-scrollbar flex gap-2 overflow-x-auto">
      {departments.map((department) => (
        <button
          key={department.key}
          type="button"
          aria-pressed={active === department.key}
          onClick={() => onChange(department.key)}
          className={`min-h-[44px] shrink-0 rounded-full border px-4 text-sm font-medium transition ${
            active === department.key
              ? "border-indigo-400/60 bg-indigo-500/20 text-indigo-100"
              : "border-white/10 bg-white/3 text-white/60 hover:text-white"
          }`}
        >
          {department.label}
          <span className="ml-2 tabular-nums text-white/40">
            {department.count}
          </span>
        </button>
      ))}
    </div>
  );
};

export default DepartmentTabs;
