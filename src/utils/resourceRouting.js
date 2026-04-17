import fetchIndex from "../data/index.jsx";

export function slugifyName(value) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "item";
}

export function getAudiobookName(resource) {
  return resource?.name || resource?.title || resource?.url || "audiobook";
}

export function getUserName(resource) {
  return resource?.name || resource?.username || resource?.email || resource?.url || "user";
}

export function getGenreName(resource) {
  return resource?.name || resource?.title || resource?.url || "genre";
}

export function buildResourcePath(basePath, resource, getName) {
  return `/${basePath}/${slugifyName(getName(resource))}`;
}

export async function findResourceBySlug(indexKey, slug, getName) {
  const index = await fetchIndex();
  const result = await fetch(index[indexKey]);

  if (!result.ok) {
    throw new Error(`API call for ${indexKey} failed with status ${result.status}`);
  }

  const links = (await result.json())[indexKey] || [];

  for (const link of links) {
    const itemResponse = await fetch(link);
    if (!itemResponse.ok) {
      continue;
    }

    const item = await itemResponse.json();
    if (slugifyName(getName(item)) === slug) {
      return item;
    }
  }

  throw new Error(`No ${indexKey.slice(0, -1)} found for slug '${slug}'`);
}

export function isEncodedApiUrl(value) {
  const decoded = decodeURIComponent(value);
  return decoded.startsWith("http://") || decoded.startsWith("https://");
}

export function decodeResourceParam(value) {
  return decodeURIComponent(value);
}

