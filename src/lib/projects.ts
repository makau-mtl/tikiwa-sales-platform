const developerInfoMarker = "\n\n--- Tikiwa Developer Information ---\n";

export function splitProjectLocation(location: string) {
  const commaIndex = location.lastIndexOf(",");
  if (commaIndex < 0) {
    return { areaTown: location.trim(), county: "" };
  }

  return {
    areaTown: location.slice(0, commaIndex).trim(),
    county: location.slice(commaIndex + 1).trim().replace(/\s+County$/i, ""),
  };
}

export function formatProjectLocation(areaTown: string, county: string) {
  const countyName = county.trim().replace(/\s+County$/i, "");
  return `${areaTown.trim()}, ${countyName} County`;
}

export function splitProjectDescription(value: string | null) {
  if (!value) return { description: "", developerInfo: "" };
  const markerIndex = value.indexOf(developerInfoMarker);
  if (markerIndex < 0) return { description: value, developerInfo: "" };

  return {
    description: value.slice(0, markerIndex),
    developerInfo: value.slice(markerIndex + developerInfoMarker.length),
  };
}

export function combineProjectDescription(description: string, developerInfo: string) {
  const cleanDescription = description.trim();
  const cleanDeveloperInfo = developerInfo.trim();
  if (!cleanDeveloperInfo) return cleanDescription || null;
  return `${cleanDescription}${developerInfoMarker}${cleanDeveloperInfo}`;
}

export function slugifyProjectName(name: string) {
  const slug = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "project";
}