import { it, expect } from "vitest";
import {
  createContainer,
  createSingletonFactory,
  createTransientFactory,
} from "./index.js";

it('should throw an error when using "resolve" as a factory key', () => {
  expect(() =>
    createContainer({
      resolve: createSingletonFactory(() => null),
    }),
  ).toThrow('Factory key "resolve" is reserved.');
});

it("should handle mixed container with singleton and transient factories", () => {
  const container = createContainer({
    singleton: createSingletonFactory(() => ({ value: "singleton" })),
    transient: createTransientFactory(() => ({ value: Math.random() })),
  });

  expect(container.singleton.value).toBe("singleton");
  expect(container.singleton).toBe(container.singleton);

  const transient1 = container.resolve("transient");
  const transient2 = container.resolve("transient");
  expect(transient1).not.toBe(transient2);
  expect(transient1.value).not.toBe(transient2.value);
});

it("should create new instances for transient factories", () => {
  const container = createContainer({
    transient: createTransientFactory(() => ({ value: Math.random() })),
  });

  const instance1 = container.resolve("transient");
  const instance2 = container.resolve("transient");

  expect(instance1).not.toBe(instance2);
  expect(instance1.value).not.toBe(instance2.value);
});

it("should throw an error when resolving non-existent transient factory", () => {
  const container = createContainer({});

  expect(() => container.resolve("nonexistent" as never)).toThrow(
    'Factory for "nonexistent" not found or is not transient.',
  );
});

it("should create singleton instances", () => {
  const container = createContainer({
    singleton: createSingletonFactory(() => ({ value: Math.random() })),
  });

  const instance1 = container.singleton;
  const instance2 = container.singleton;

  expect(instance1).toBe(instance2);
  expect(instance1.value).toBe(instance2.value);
});

it("should lazy-initialize singleton instances", () => {
  let initialized = false;

  const container = createContainer({
    singleton: createSingletonFactory(() => {
      initialized = true;
      return { value: "singleton" };
    }),
  });

  expect(initialized).toBe(false);
  const instance = container.singleton;
  expect(initialized).toBe(true);
  expect(instance.value).toBe("singleton");
});

it("should allow accessing only singleton factories via dot notation and only transient factories via resolve", () => {
  const container = createContainer({
    singleton: createSingletonFactory(() => ({ value: "singleton" })),
    transient: createTransientFactory(() => ({ value: "transient" })),
  });

  expect(container.singleton.value).toBe("singleton");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect((container as any).transient).toBe(undefined);

  expect(container.resolve("transient").value).toBe("transient");
  expect(() => container.resolve("singleton" as never)).toThrow(
    'Factory for "singleton" not found or is not transient.',
  );
});
