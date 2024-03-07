type BuilderType<T> = {
  [partial in keyof T as `set${Capitalize<string & partial>}`]: (value: T[partial]) => BuilderType<T>;
} & {
  build: () => T;
};


/**
 * Description placeholder
 * @date 3/7/2024 - 1:26:53 PM
 * @author 박연서
 *
 * @param {string} str
 * @returns {string} param str를 camelCase로 바꿉니다.
 */
function camelCase(str: string): string {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
}


/**
 * Description placeholder
 * @date 3/7/2024 - 1:27:13 PM
 * @author 박연서
 *
 * @export
 * @template {new (...args: unknown[]) => Partial<InstanceType<T>>} T
 * @param {T} Type
 * @returns {BuilderType<InstanceType<T>>}
 */
export function createBuilder<T extends new (...args: unknown[]) => Partial<InstanceType<T>>>(Type: T): BuilderType<InstanceType<T>> {
  
  const object: Partial<InstanceType<T>> = {};

  return new Proxy({}, {
    get(target, prop, receiver) {
      if (prop === 'build') {
        return () => {
          const instance = new Type();
          for (const key in object) {
            if (object[key] !== undefined) {
              instance[key] = object[key];
            }
          }
          return instance;
        };
      }
      if (typeof prop === 'string' && prop.startsWith('set')) {
        const key = camelCase(prop.slice(3)) as keyof InstanceType<T>;
        return (value: InstanceType<T>[typeof key]) => {
          object[key] = value;
          return receiver;
        };
      }
      return undefined;
    }
  }) as BuilderType<InstanceType<T>>;
}