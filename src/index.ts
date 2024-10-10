throw new Error(
  "Direct import from the root of 'polyuse' is not supported. " +
    "Please import specific modules, e.g. import { createContainer } from 'polyuse/ioc'",
);
