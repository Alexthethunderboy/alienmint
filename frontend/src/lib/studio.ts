import type { CollectionDraft, Trait } from "@/types/collection";
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export function validateArtwork(file: Pick<File, "name" | "type" | "size">): string | null {
  if (!(["image/png", "image/jpeg", "image/webp"] as string[]).includes(file.type)) return `${file.name}: use PNG, JPEG, or WebP`;
  if (file.size > MAX_FILE_SIZE) return `${file.name}: file exceeds 10 MB`;
  return null;
}
export const serializeTraits = (traits: Trait[]) => traits.filter(t => t.attribute.trim() && t.value.trim()).map(t => ({ trait_type: t.attribute.trim(), value: t.value.trim() }));
export function tokenMetadata(draft: Pick<CollectionDraft,"name"|"description"|"externalUrl"|"traits">, tokenId: number, image = `ipfs://IMAGE_CID/${tokenId}.png`) {
  return { name: `${draft.name || "Untitled Collection"} #${tokenId}`, description: draft.description, image, external_url: draft.externalUrl || undefined, attributes: serializeTraits(draft.traits) };
}
