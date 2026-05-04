export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Partial<Pick<T, K>> {
  return keys.reduce<Partial<Pick<T, K>>>((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
}

