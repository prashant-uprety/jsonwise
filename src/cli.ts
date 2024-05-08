// cli.ts
import * as fs from 'fs';
import * as path from 'path';
import * as commander from 'commander';

/**
 * Represents a field in a model.
 */
interface Field {
  /**
   * The name of the field.
   */
  name: string;
  /**
   * The type of the field.
   */
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  /**
   * Optional fields for nested objects.
   */
  fields?: Field[];
  /**
   * Whether the field is optional.
   */
  optional?: boolean;
  /**
   * The reference type for reference fields.
   */
  reference?: string;
}

/**
 * Represents a model.
 */
interface Model {
  /**
   * The name of the model.
   */
  name: string;
  /**
   * The fields of the model.
   */
  fields: Field[];
}

/**
 * Validates a schema.
 * @param {object} schema - The schema to validate.
 */
function validateSchema(schema: { models: Model[] }): void {
  const errors: string[] = [];

  // Check for duplicate model names
  const modelNames = schema.models.map((model) => model.name);
  const duplicateModels = modelNames.filter((name, index) => modelNames.indexOf(name) !== index);
  if (duplicateModels.length > 0) {
    errors.push(`Duplicate model names: ${duplicateModels.join(', ')}`);
  }

  schema.models.forEach((model) => {
    // Check for duplicate field names
    const fieldNames = model.fields.map((field) => field.name);
    const duplicateFields = fieldNames.filter((name, index) => fieldNames.indexOf(name) !== index);
    if (duplicateFields.length > 0) {
      errors.push(`Duplicate field names in model '${model.name}': ${duplicateFields.join(', ')}`);
    }

    // Check for fields with the same name as the model
    if (model.fields.some((field) => field.name === model.name)) {
      errors.push(`Field name cannot be the same as the model name in model '${model.name}'`);
    }
  });

  if (errors.length > 0) throw new Error(errors.join('\n'));
}

/**
 * Generates model files based on a schema.
 * @param {object} schema - The schema to generate models from.
 * @param {object} config - The configuration for generating models.
 */
//Generators from the schema definition

//TODO: Using reccursion for more nested generation (This is temporary solution)

function generateModelFiles(
  schema: { models: Model[] },
  config: { jsonDir: string; generatedDir: string }
) {
  const modelsTsFile = path.join(config.generatedDir, 'models.ts');
  let modelsTsContent = `/* Models */\n\n`;

  schema.models.forEach((model) => {
    modelsTsContent += `/**
     * ${model.name} interface
     */\n`;
    modelsTsContent += `export interface ${model.name} {\n`;

    model.fields.forEach((field) => {
      if (field.type === 'array') {
        if (field.reference) {
          const referencedModel = schema.models.find((m) => m.name === field.reference);
          if (!referencedModel) throw new Error(`Referenced model '${field.reference}' not found`);
          if (field.optional) modelsTsContent += `  ${field.name}?: ${referencedModel.name}[];\n`;
          else modelsTsContent += `  ${field.name}: ${referencedModel.name}[];\n`;
        } else {
          if (field.optional) modelsTsContent += `  ${field.name}?: any[];\n`;
          else modelsTsContent += `  ${field.name}: any[];\n`;
        }
      } else if (field.type === 'object') {
        if (field.fields) {
          modelsTsContent += `  ${field.name}: {\n`;
          field.fields.forEach((nestedField) => {
            if (nestedField.reference) {
              const referencedModel = schema.models.find((m) => m.name === nestedField.reference);
              if (!referencedModel)
                throw new Error(`Referenced model '${nestedField.reference}' not found`);
              if (nestedField.type === 'array') {
                if (nestedField.optional)
                  modelsTsContent += `    ${nestedField.name}?: ${referencedModel.name}[];\n`;
                else modelsTsContent += `    ${nestedField.name}: ${referencedModel.name}[];\n`;
              } else {
                if (nestedField.optional)
                  modelsTsContent += `    ${nestedField.name}?: ${referencedModel.name};\n`;
                else modelsTsContent += `    ${nestedField.name}: ${referencedModel.name};\n`;
              }
            } else {
              if (nestedField.type === 'array') {
                if (nestedField.optional) modelsTsContent += `    ${nestedField.name}?: any[];\n`;
                else modelsTsContent += `    ${nestedField.name}: any[];\n`;
              } else {
                if (nestedField.optional)
                  modelsTsContent += `    ${nestedField.name}?: ${nestedField.type};\n`;
                else modelsTsContent += `    ${nestedField.name}: ${nestedField.type};\n`;
              }
            }
          });
          modelsTsContent += `  };\n`;
        } else {
          if (field.reference) {
            const referencedModel = schema.models.find((m) => m.name === field.reference);
            if (!referencedModel)
              throw new Error(`Referenced model '${field.reference}' not found`);
            if (field.optional) modelsTsContent += `  ${field.name}?: ${referencedModel.name};\n`;
            else modelsTsContent += `  ${field.name}: ${referencedModel.name};\n`;
          } else {
            if (field.optional) modelsTsContent += `  ${field.name}?: ${field.type};\n`;
            else modelsTsContent += `  ${field.name}: ${field.type};\n`;
          }
        }
      } else {
        if (field.optional) modelsTsContent += `  ${field.name}?: ${field.type};\n`;
        else modelsTsContent += `  ${field.name}: ${field.type};\n`;
      }
    });
    modelsTsContent += '}\n\n';
  });

  fs.writeFileSync(modelsTsFile, modelsTsContent);

  // Create the barrel file
  const barrelFile = path.join(config.generatedDir, 'index.ts');
  let barrelContent = '';
  barrelContent += `export * from './models';\n`;
  schema.models.forEach((model) => {
    barrelContent += `export * from './${model.name}.methods';\n`;
  });

  fs.writeFileSync(barrelFile, barrelContent);

  // Create the model JSON files in project's working DIR
  schema.models.forEach((model) => {
    const jsonFile = `${model.name}.json`;
    const jsonwiseContent = generateJsonwiseClass(model, jsonFile);
    const methodsFile = path.join(config.generatedDir, `${model.name}.methods.ts`);
    fs.writeFileSync(methodsFile, jsonwiseContent);
  });

  // Create the parent index.ts file
  const parentDir = path.dirname(config.generatedDir);
  const indexTsFile = path.join(parentDir, 'index.ts');
  let indexTsContent = `export * from './generated';\n`;

  fs.writeFileSync(indexTsFile, indexTsContent);
}

/**
 * Generates a Jsonwise class for a model.
 * @param {Model} model - The model to generate a Jsonwise class for.
 * @param {string} jsonFile - The JSON file for the model.
 * @returns {string} The generated Jsonwise class.
 */
function generateJsonwiseClass(model: Model, jsonFile: string): string {
  return `
  import path from 'path';
  import { ${model.name} } from './models';
  import Jsonwise from '../jsonwise';
  
  const jsonDir = process.cwd();
  const jsonFilePath = path.join(jsonDir, 'json', '${jsonFile}');
  
  export class ${model.name}Jsonwise extends Jsonwise<${model.name}> {
    constructor() {
      super(jsonFilePath);
    }
  }
  
  export default ${model.name}Jsonwise;
  `;
}

//CLI configuration
const program = new commander.Command();

program
  .version('0.0.1')
  .description('Jsonwise CLI')
  .helpOption('-h, --help', 'Display help for command')
  .helpCommand(false);

program
  .command('generate')
  .description('Generate model files')
  .requiredOption('-s, --schemaFile <schemaFile>', 'Path to schema file')

  // Add help text for the generate command
  .addHelpText(
    'after',
    `
  Examples:
    jsonwise generate -s path/to/schema.json
  `
  )
  // Define the action for the generate command
  .action(async (cmd) => {
    try {
      const schemaFile = cmd.schemaFile;
      const schemaJson = fs.readFileSync(schemaFile, 'utf-8');
      const schema = JSON.parse(schemaJson);

      validateSchema(schema);
      const projectRoot = process.cwd();
      const jsonDir = path.join(projectRoot, cmd.jsonDir || 'json');
      const generatedDir = path.join(projectRoot, 'src/generated');

      if (!fs.existsSync(jsonDir)) fs.mkdirSync(jsonDir, { recursive: true });

      if (!fs.existsSync(generatedDir)) fs.mkdirSync(generatedDir, { recursive: true });

      schema.models.forEach((model: Model) => {
        const jsonFile = path.join(jsonDir, `${model.name}.json`);
        if (!fs.existsSync(jsonFile)) fs.closeSync(fs.openSync(jsonFile, 'w'));
      });

      generateModelFiles(schema, { jsonDir, generatedDir });

      console.log('\x1b[32mFiles generated successfully! 🎉\x1b[0m');
    } catch (err) {
      console.error('\x1b[31mError: %s\x1b[0m', err);
    }
  });

(async () => {
  program.parse(process.argv);
})();
