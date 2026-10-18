import React, { useState } from "react";
import CompanionPicker from "./companionPicker";
import { UserSummary } from "../../interfaces/profile/types";
import { CompanionTarget, tagCompanions } from "../../utils/tagCompanions";

interface CompanionTagFormProps {
  target: CompanionTarget;
  description?: string;
  onDone: () => void;
}

const CompanionTagForm: React.FC<CompanionTagFormProps> = ({
  target,
  description,
  onDone,
}) => {
  const [companions, setCompanions] = useState<UserSummary[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        if (companions.length === 0) return;

        setIsSaving(true);
        const ok = await tagCompanions(target, companions);
        setIsSaving(false);

        if (ok) {
          setCompanions([]);
          onDone();
        }
      }}
      className="flex flex-col gap-5"
    >
      {description && (
        <p className="text-sm leading-relaxed text-white/45">{description}</p>
      )}

      <CompanionPicker value={companions} onChange={setCompanions} />

      <button
        type="submit"
        disabled={isSaving || companions.length === 0}
        className="flex h-12 items-center justify-center rounded-2xl text-sm font-bold tracking-tight bg-white text-[#05050c] transition-all duration-300 ease-ios hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[0_10px_30px_-12px_rgba(255,255,255,0.5)] active:translate-y-0 active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50"
      >
        {isSaving ? "Enviando..." : "Enviar confirmação"}
      </button>
    </form>
  );
};

export default CompanionTagForm;
