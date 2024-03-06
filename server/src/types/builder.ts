// interface DynamicSetters {
//     [key: string]: ((value: any) => DynamicSetters) | any;
//   }

// export class Builder implements DynamicSetters {
//     [key: string]: ((value: any) => DynamicSetters) | any;

//     init() : void {
//       Object.keys(this).forEach((key : string) => {
//         const setterName =
//           `set${key.substr(0, 1).toUpperCase()}${key.substr(1)}`;
  
//         this[setterName] = (value : any) => {
//           this[key] = value;
//           return this;
//         };
//       });
//     }
  
//     build() {
//       return this;
//     }
  
// }


type BuilderType<T> = {
  [partial in keyof T as `set${Capitalize<string & partial>}`]: (value: T[partial]) => BuilderType<T>;
} & {
  build: () => T;
};

function camelCase(str: string): string {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
}

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