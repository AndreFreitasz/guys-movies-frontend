import { useState } from "react";
import {
  PersonProfile,
  personAge,
  tmdbProfile,
} from "../../interfaces/person/types";

interface PersonHeroProps {
  profile: PersonProfile;
}

const BIOGRAPHY_PREVIEW_LENGTH = 320;

const PersonHero = ({ profile }: PersonHeroProps) => {
  const [isBiographyExpanded, setIsBiographyExpanded] = useState(false);

  const age = personAge(profile.birthday, profile.deathday);
  const birthYear = profile.birthday
    ? new Date(profile.birthday).getFullYear()
    : null;
  const deathYear = profile.deathday
    ? new Date(profile.deathday).getFullYear()
    : null;

  const ageLabel =
    age === null
      ? null
      : deathYear && birthYear
        ? `${age} anos (${birthYear}–${deathYear})`
        : `${age} anos`;

  const metaItems = [
    ageLabel,
    profile.placeOfBirth,
    `${profile.stats.totalTitles} títulos`,
    profile.stats.firstYear ? `ativo desde ${profile.stats.firstYear}` : null,
  ].filter((item): item is string => Boolean(item));

  const biography = profile.biography?.trim() || null;
  const isBiographyTruncated =
    biography !== null && biography.length > BIOGRAPHY_PREVIEW_LENGTH;
  const displayedBiography =
    biography === null
      ? null
      : isBiographyExpanded || !isBiographyTruncated
        ? biography
        : `${biography.slice(0, BIOGRAPHY_PREVIEW_LENGTH).trimEnd()}...`;

  const initials = profile.name.substring(0, 2);
  const profileImageUrl = tmdbProfile(profile.profilePath, "w185");

  const departmentLabel =
    profile.departments.find(
      (department) => department.key === profile.defaultDepartment,
    )?.label ?? profile.departments[0]?.label;

  return (
    <div className="relative overflow-hidden">
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-6 sm:flex-row sm:items-center">
        <div className="h-32 w-32 shrink-0 overflow-hidden rounded-full border border-white/10 bg-black/40">
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt={profile.name}
              width={128}
              height={128}
              decoding="async"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-3xl font-black uppercase text-white/70">
              {initials}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {departmentLabel && (
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-indigo-300">
              {departmentLabel}
            </p>
          )}

          <h1 className="mt-2 text-4xl font-black tracking-tight lg:text-5xl">
            {profile.name}
          </h1>

          {metaItems.length > 0 && (
            <p className="mt-3 text-sm font-semibold text-white/55">
              {metaItems.join(" • ")}
            </p>
          )}

          {displayedBiography && (
            <div className="mt-5 max-w-3xl">
              <p className="whitespace-pre-line text-sm leading-relaxed text-white/85">
                {displayedBiography}
              </p>

              {isBiographyTruncated && !isBiographyExpanded && (
                <button
                  type="button"
                  onClick={() => setIsBiographyExpanded(true)}
                  className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-indigo-300 transition-colors duration-300 hover:text-indigo-200"
                >
                  ler mais
                </button>
              )}

              {profile.biographyLanguage === "en" && (
                <p className="mt-2 text-xs text-white/40">
                  Biografia disponível apenas em inglês
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonHero;
