export interface SingletonFactory<T> {
  type: "singleton";
  create: () => T;
}

export interface TransientFactory<T> {
  type: "transient";
  create: () => T;
}

export type Factory<T = unknown> = SingletonFactory<T> | TransientFactory<T>;

export const createTransientFactory = <T>(
  factory: () => T,
): TransientFactory<T> => ({ type: "transient", create: factory });

export const createSingletonFactory = <T>(
  factory: () => T,
): SingletonFactory<T> => {
  let instance: T | undefined;

  return {
    type: "singleton",

    create() {
      if (!instance) {
        instance = factory();
      }

      return instance;
    },
  };
};

type Factories = Record<string, Factory>;

export const createContainer = <T extends Factories>(factories: T) => {
  type SingletonKeys = {
    [K in keyof T]: T[K] extends SingletonFactory<unknown> ? K : never;
  }[keyof T];

  type TransientKeys = Exclude<keyof T, SingletonKeys>;

  type Container = {
    [K in SingletonKeys]: ReturnType<T[K]["create"]>;
  } & {
    resolve: <K extends TransientKeys>(key: K) => ReturnType<T[K]["create"]>;
  };

  const container = {
    resolve: (key) => {
      const factory = factories[key];

      if (factory?.type === "transient") {
        return factory.create();
      }

      throw new Error(
        `Factory for "${String(key)}" not found or is not transient.`,
      );
    },
  } as Container;

  Object.entries(factories).forEach(([key, factory]) => {
    if (factory.type === "singleton") {
      if (key === "resolve") {
        throw new Error('Factory key "resolve" is reserved.');
      }

      Object.defineProperty(container, key, {
        get: () => factory.create(),
        enumerable: true,
      });
    }
  });

  return container;
};
