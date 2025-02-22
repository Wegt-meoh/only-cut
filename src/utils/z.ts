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

class EnumSchema<U extends string | number, T extends [U, ...U[]]> extends Schema<{ [K in keyof T]: T[K] }[number]> {
    constructor(private values: T) {
        super(
            `enum(${values.join("|")})`,
            (data) => {
                if (!this.values.includes(data as U)) {
                    throw new Error(`Expected ${this.typeName}`);
                }
                return data as { [K in keyof T]: T[K] }[number];
            }
        )
    }
}

export type TypeOf<T> = T extends Schema<infer U> ? U : never;
export type { TypeOf as infer };

// 工具函数：创建 string 模式
export const string = () => {
    return new StringSchema();
}

// 工具函数：创建 number 模式
export const number = () => {
    return new NumberSchema();
}

// 工具函数：创建 boolean 模式
export const boolean = () => {
    return new BooleanSchema();
}

// 工具函数：创建 null 模式
export const nullObj = () => {
    return new NullSchema();
}

// 工具函数：创建 object 模式
export const object = <T extends Record<string, Schema<unknown>>>(shape: T) => {
    return new ObjectSchema(shape);
}

// 工具函数：创建 array 模式
export const array = <T>(shape: Schema<T>) => {
    return new ArraySchema(shape)
}

// 工具函数：创建 union 模式
export const union = <U extends Schema<unknown>, T extends [U, U, ...U[]]>(unionSchema: T) => {
    return new UnionSchema(unionSchema);
}

// 工具函数：创建 enum 模式
export const enumSchema = <U extends string | number, T extends [U, ...U[]]>(values: T) => {
    return new EnumSchema(values);
}