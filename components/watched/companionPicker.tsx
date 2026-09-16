import React, { useState } from "react";
import { FaTimes, FaUserPlus } from "react-icons/fa";
import Avatar from "../profile/avatar";
import { usePeopleSearch } from "../../hooks/usePeopleSearch";
import { UserSummary, resolveAvatarUrl } from "../../interfaces/profile/types";

interface CompanionPickerProps {
  value: UserSummary[];
  onChange: (companions: UserSummary[]) => void;
}

const CompanionPicker: React.FC<CompanionPickerProps> = ({
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [term, setTerm] = useState("");
  const { users, status } = usePeopleSearch(term, isOpen);

  const chosen = new Set(value.map((person) => person.username));
  const available = users.filter((person) => !chosen.has(person.username));

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-white/70">
        Com quem você assistiu?
      </p>

      {value.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {value.map((person) => (
            <span
              key={person.username}
              className="flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] py-1 pl-1 pr-2"
            >
              <Avatar
                name={person.name}
                username={person.username}
                size="sm"
                imageUrl={resolveAvatarUrl(
                  person.username,
                  person.avatarUpdatedAt,
                )}
              />
              <span className="max-w-[9rem] truncate text-xs font-bold text-white">
                {person.name || person.username}
              </span>
              <button
                type="button"
                aria-label={`Remover ${person.name || person.username}`}
                onClick={() =>
                  onChange(
                    value.filter(
                      (candidate) => candidate.username !== person.username,
                    ),
                  )
                }
                className="text-white/45 transition-colors duration-200 hover:text-white"
              >
                <FaTimes size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex min-h-[44px] items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 text-sm font-semibold text-white/70 transition-colors duration-300 hover:text-white"
        >
          <FaUserPlus size={12} />
          {value.length > 0 ? "Adicionar outra pessoa" : "Marcar alguém"}
        </button>
      ) : (
        <div>
          <input
            type="search"
            value={term}
            autoFocus
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Buscar por nome ou @usuario..."
            aria-label="Buscar pessoas"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-brand-400/60 focus:outline-none"
          />

          {status === "ready" && available.length > 0 && (
            <div className="mt-2 max-h-52 space-y-1 overflow-y-auto">
              {available.map((person) => (
                <button
                  key={person.username}
                  type="button"
                  onClick={() => {
                    onChange([...value, person]);
                    setTerm("");
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left transition-colors duration-200 hover:bg-white/[0.05]"
                >
                  <Avatar
                    name={person.name}
                    username={person.username}
                    size="sm"
                    imageUrl={resolveAvatarUrl(
                      person.username,
                      person.avatarUpdatedAt,
                    )}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-white">
                      {person.name || person.username}
                    </span>
                    <span className="block truncate text-xs text-white/45">
                      @{person.username}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}

          {status === "ready" && available.length === 0 && term.trim() && (
            <p className="mt-2 text-xs text-white/40">
              Ninguém encontrado. Só é possível marcar quem tem conta.
            </p>
          )}

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setTerm("");
            }}
            className="mt-2 text-xs font-semibold text-white/45 transition-colors duration-200 hover:text-white/70"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
};

export default CompanionPicker;
