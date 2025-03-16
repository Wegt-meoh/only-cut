// basic schema class
class Schema<T> {
    constructor(public typeName: string, private validateFn: (data: unknown) => T) { }

    // validate data
    parse(data: unknown): T {
        return this.validateFn(data);
    }
}

class StringSchema extends Schema<string> {
    constructor() {
        super(
            "string",
            (data) => {
                if (typeof data !== "string") {
                    throw new Error("Expected string");
                }
                return data;
            });
    }
}

class NumberSchema extends Schema<number> {
    constructor() {
        super(
            "number",
            (data) => {
                if (typeof data !== "number") {
                    throw new Error("Expected number");
                }
                return data;
            });
    }
}

class BooleanSchema extends Schema<boolean> {
    constructor() {
        super(
            "boolean",
            (data) => {
                if (typeof data !== "boolean") {
                    throw new Error("Expected boolean");
                }
                return data;
            }
        );
    }
}

class NullSchema extends Schema<null> {
    constructor() {
        super(
            "null",
            (data) => {
                if (data !== null) {
                    throw new Error("Expected null");
                }
                return data;
            }
        )
    }
}

class ObjectSchema<T extends Record<string, Schema<unknown>>, R extends {
    [K in keyof T]: TypeOf<T[K]>;
}> extends Schema<R> {
    constructor(private shape: T) {
        function analysisTypeName(o: T) {
            let result: any = {}
            for (const key in o) {
                result[key] = o[key].typeName
            }

            return JSON.stringify(result)
        }

        super(
            analysisTypeName(shape),
            (data) => {
                if (typeof data !== "object" || data === null || Object.prototype.toString.call(data) !== '[object Object]') {
                    throw new Error("Expected object");
                }

                const result: any = {};
                try {
                    for (const key in this.shape) {
                        if (shape.hasOwnProperty(key)) {
                            result[key] = shape[key].parse((data as any)[key]);
                        }
                    }
                    return result;
                } catch (error) {
                    throw new Error(`Expected ${this.typeName}`)
                }
            }
        );
    }
}

class ArraySchema<T> extends Schema<T[]> {
    constructor(private elementsSchema: Schema<T>) {
        super(
            `${elementsSchema.typeName}[]`,
            (data) => {
                if (!Array.isArray(data)) {
                    throw new Error("Expected array");
                }

                try {
                    const result = data.map(item => this.elementsSchema.parse(item))
                    return result
                } catch (error) {
                    throw new Error(`Expect ${this.typeName}`)
                }
            })
    }
}

class UnionSchema<U extends Schema<unknown>, T extends [U, U, ...U[]]> extends Schema<TypeOf<T[number]>> {
    constructor(private unionSchema: T) {
        super(
            `union(${unionSchema.map(schema => schema.typeName).join("|")})`,
            (data) => {
                for (const element of this.unionSchema) {
                    try {
                        return element.parse(data) as any;
                    } catch {
                        continue;
                    }
                }

                throw new Error(`Expected ${this.typeName}`)
            });
    }
}

class EnumSchema<U extends string | number, T extends [U, ...U[]]> extends Schema<{ [K in keyof T]: T[K] }[number]> {
    constructor(private values: T) {
        super(
            `enum(${values.map(v => {
                if (typeof v === "string") {
                    return `"${v}"`
                }
                return v
            }).join("|")})`,
            (data) => {
                if (!this.values.includes(data as U)) {
                    throw new Error(`Expected ${this.typeName}`);
                }
                return data as { [K in keyof T]: T[K] }[number];
            }
        )
    }
}

class LazySchema<T> extends Schema<T> {
    private _schema: null | Schema<T> = null;

    constructor(lazyFunc: () => Schema<T>) {
        super("lazy schema", (data: unknown) => {
            if (!this._schema) {
                this._schema = lazyFunc()
            }
            return this._schema.parse(data)
        })
    }
}

// tool type for infer type of schema
type TypeOf<T> = T extends Schema<infer U> ? U : never;

// tool function for string schema
export const string = () => {
    return new StringSchema();
}

// tool function for number schema
export const number = () => {
    return new NumberSchema();
}

// tool function for boolean schema
export const boolean = () => {
    return new BooleanSchema();
}

// tool function for null schema
const nullObj = () => {
    return new NullSchema();
}

// tool function for object schema
export const object = <T extends Record<string, Schema<unknown>>>(shape: T) => {
    return new ObjectSchema(shape);
}

// tool function for array schema
export const array = <T>(shape: Schema<T>) => {
    return new ArraySchema(shape)
}

// tool function for union schema
export const union = <U extends Schema<unknown>, T extends [U, U, ...U[]]>(unionSchema: T) => {
    return new UnionSchema(unionSchema);
}

// tool function for enum schema
const enumSchema = <U extends string | number, T extends [U, ...U[]]>(values: T) => {
    return new EnumSchema(values);
}

export const lazy = <T>(lazyFunc: () => Schema<T>) => {
    return new LazySchema(lazyFunc)
}

export type AnyShemaType<T> = Schema<T>
export { enumSchema as enum, nullObj as null, type TypeOf as infer }