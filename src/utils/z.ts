// 定义 Schema 基类
class Schema<T> {
    constructor(public typeName: string, private validateFn: (data: unknown) => T) { }

    // 验证数据
    parse(data: unknown): T {
        return this.validateFn(data);
    }
}

// 定义 string 模式
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

// 定义 number 模式
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

// 定义 boolean 模式
class BooleanSchema extends Schema<boolean> {
    constructor() {
        super(
            "boolean",
            (data) => {
                if (typeof data !== "boolean") {
                    throw new Error("Expected boolean");
                }
                return data;
            });
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
            })
    }
}

// 定义 object 模式
class ObjectSchema<T extends Record<string, Schema<unknown>>> extends Schema<{
    [K in keyof T]: T[K] extends Schema<infer U> ? U : never;
}> {
    constructor(private shape: T) {
        super(
            "object",
            (data) => {
                if (typeof data !== "object" || data === null || Object.prototype.toString.call(data) !== '[object Object]') {
                    throw new Error("Expected object, got " + typeof data);
                }

                const result: any = {};
                for (const key in this.shape) {
                    if (shape.hasOwnProperty(key)) {
                        result[key] = shape[key].parse((data as any)[key]);
                    }
                }
                return result;
            });
    }
}

class ArraySchema<T> extends Schema<T[]> {
    constructor(private elementsSchema: Schema<T>) {
        super(
            "array",
            (data) => {
                if (!Array.isArray(data)) {
                    throw new Error("Expected array");
                }

                return data.map(item => this.elementsSchema.parse(item))
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

class EnumSchema<U extends string | number, T extends [U, ...U[]]> extends Schema<T[number]> {
    constructor(private values: T) {
        super(
            `enum(${values.join("|")})`,
            (data) => {
                if (!this.values.includes(data as U)) {
                    throw new Error(`Expected ${this.typeName}`);
                }
                return data as T[number];
            }
        )
    }
}

class LazySchema<T> extends Schema<T> {
    private schema: Schema<T> | null = null;

    constructor(private lazyFn: () => Schema<T>) {
        super(
            "lazy",
            (data: unknown) => {
                if (!this.schema) {
                    this.schema = this.lazyFn(); // 延迟初始化 schema
                }
                return this.schema.parse(data); // 使用延迟加载的 schema 解析数据
            }
        );
    }
}

export type TypeOf<T> = T extends Schema<infer U> ? U : never;
export type { TypeOf as infer };
export type SchemaType<T> = Schema<T>;

export const string = () => {
    return new StringSchema();
}

export const number = () => {
    return new NumberSchema();
}

export const boolean = () => {
    return new BooleanSchema();
}

const nullObj = () => {
    return new NullSchema();
}

export const object = <T extends Record<string, Schema<unknown>>>(shape: T) => {
    return new ObjectSchema(shape);
}

export const array = <T>(shape: Schema<T>) => {
    return new ArraySchema(shape)
}

export const union = <U extends Schema<unknown>, T extends [U, U, ...U[]]>(unionSchema: T) => {
    return new UnionSchema(unionSchema);
}

const enumSchema = <U extends string | number, T extends [U, ...U[]]>(values: T) => {
    return new EnumSchema(values);
}

export const lazy = <T extends Schema<any>>(lazyFn: () => T) => {
    return new LazySchema(lazyFn)
}

export { enumSchema as enum, nullObj as null }