# Jsonwise: Effortless JSON Data Management

**Store, Manage, and Migrate Your JSON Data with Ease**

Jsonwise is a local JSON database that allows you to effortlessly store, manage, and migrate your JSON data. With its ORM-like operations, schema definition, and CLI tools, Jsonwise provides a simple and lightweight solution for managing your JSON data.

## Installation

Install Jsonwise via npm:

```bash
npm install jsonwise
```

## Features

- **ORM-like Operations:** Perform CRUD operations on your JSON data using familiar ORM syntax.
- **Schema Definition:** Define your data structure and JSON files using a schema, making it easy to create, read, update, and delete data.
- **CLI for Schema Management:** Use the Jsonwise CLI to create, update, and manage your schema.
- **Local Storage:** Jsonwise stores your data locally, making it easy to work with JSON files on your machine.

## Usage

1. **Define a Schema:** Use the Jsonwise CLI to define a schema for your data.
2. **Create Models:** Use the CLI to create models based on your schema.
3. **Manipulate Data:** Use Jsonwise methods to manipulate your JSON data.

## Use Case

Jsonwise is ideal for developers who want a simple, lightweight solution for storing and managing JSON data. It's perfect for small to medium-sized projects where a full-fledged database is not necessary, but a structured approach to data management is desired.

**Example Use Cases:**

- **Prototyping:** Use Jsonwise to quickly prototype and test your application's data model without setting up a full-fledged database.
- **Small Projects:** Use Jsonwise for small projects that require a simple data storage solution.
- **Proof-of-Concepts:** Use Jsonwise to quickly build and test proof-of-concepts without worrying about database setup.

## License

Jsonwise is licensed under the MIT License.

## Getting Started

To get started with Jsonwise, follow these steps:

1. Install Jsonwise using npm: `npm install jsonwise`
2. Define a schema for your data using the Jsonwise CLI
3. Create models based on your schema
4. Start manipulating your JSON data using Jsonwise methods

## Usage Guide

1. **Define a Schema:** Use the Jsonwise CLI to define a schema for your data.

## Example schema

```json
{
  "models": [
    {
      "name": "User",
      "fields": [
        { "name": "id", "type": "number" },
        { "name": "addrress", "type": "object" },
        { "name": "age", "type": "number", "optional": true }
      ]
    },
    {
      "name": "Post",
      "fields": [
        { "name": "id", "type": "number" },
        { "name": "title", "type": "string" },
        { "name": "content", "type": "array" },
        { "name": "author", "type": "array", "reference": "User" }
      ]
    }
  ]
}
```

Valid Types: 'string' | 'number' | 'boolean' | 'array' | 'object'
Reference: You can reference another model in a field by specifying the reference attribute with the name of the referenced model.

```bash
jsonwise generate -- -s path/to/schema.json
```

2. **Generated JSON Files:** Jsonwise CLI will generate JSON files based on your schema and will attach a reserved field called \_\_id which will able to define the record the ID is auto incrementing you can use this to perform queries no need to explicitly define it. These files will be created in your working directory at directory namd.

### Generate Model Files

Jsonwise will automatically generate the interfaces and typesafe interface.

### Manipulate Data

```typescript
import { Post, PostJsonwise } from 'jsonwise/generated/Post.methods';
import { User, UserJsonwise } from 'jsonwise/generated/User.methods';

const userJsonwise = new UserJsonwise();
const postJsonwise = new PostJsonwise();

// Create a new user
const newUser = userJsonwise.create({ id: 1, addrress: { Location: 'My location' } });

// Find a user
const foundUser = userJsonwise.find({ __id: 1 });

// Update a user
const updatedUser = userJsonwise.update(1, { name: 'Jane Doe' });

// Delete a user
const userDeleted = userJsonwise.destroy(1);

// Find all users
const allUsers = userJsonwise.findAll();

// Count users
const userCount = userJsonwise.count();
```
