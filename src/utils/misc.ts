export function getEntries<T extends object>(obj: T) {
  return Object.entries(obj) as Entries<T>;
}
