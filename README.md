# polyuse

A modular library that provides building blocks for creating your own framework.

> **Note:** This package is ESM only.

## Installation

```bash
npm install polyuse
```

## Modules

Currently, polyuse includes the following modules:

- `ioc`: Inversion of Control container

More modules will be added in future releases.

## Usage

### IoC Container Example

```typescript
import {
  createContainer,
  createSingletonFactory,
  createTransientFactory,
} from "polyuse/ioc";

class Logger {
  log(message: string) {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }
}

const loggerFactory = createSingletonFactory(() => new Logger());

class Database {
  constructor(private readonly logger: Logger) {}

  connect() {
    this.logger.log("Connected to database");
  }

  query(sql: string) {
    this.logger.log(`Executing query: ${sql}`);
  }
}

const databaseFactory = createSingletonFactory(
  () => new Database(loggerFactory.create()),
);

class UserService {
  constructor(
    private readonly logger: Logger,
    private readonly database: Database,
  ) {}

  createUser(username: string) {
    this.logger.log(`Creating user: ${username}`);
    this.database.query(`INSERT INTO users (username) VALUES ('${username}')`);
  }
}

const userServiceFactory = createTransientFactory(
  () => new UserService(loggerFactory.create(), databaseFactory.create()),
);

const container = createContainer({
  database: databaseFactory,
  userService: userServiceFactory,
});

// Usage
container.database.connect();

const userService1 = container.resolve("userService");
const userService2 = container.resolve("userService");

userService1.createUser("alice");
userService2.createUser("bob");
```

### Getting the container type

To get the type of the container for type-safe usage:

```typescript
type Container = typeof container;
```
