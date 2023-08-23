import { ByteType, ByteSchema, BytePrimitive, ByteStructure } from './byteschema';

export class Template<T extends ByteTemplateBase<S>, S extends ByteType> {
	template: T;

	constructor(template: T) {
		this.template = template;
	}
}

export type ByteInput<T extends ByteSchema> = T extends ByteSchema<infer E, infer S>
	? E extends `${infer B}${'?' | ''}`
		? S extends 'primitive'
			? B extends 'u8' | 'u16' | 'u32' | 'i8' | 'i16' | 'i32' | 'f32' | 'f64'
				? number
				: B extends 'u64' | 'i64'
				? bigint
				: B extends 'str' | 'dynstr'
				? string
				: never
			: never
		: S extends { [key: string]: ByteSchema<ByteType, ByteSubtemplate<ByteType>> }
		? { [P in keyof S]: ByteInput<S[P]> }
		: S extends [...S[]]
		? { [K in keyof S]: ByteInput<S[K] extends ByteSchema ? S[K] : never> }
		: S extends ByteSchema[]
		? ByteInput<S[number]>
		: never
	: never;

export type BuilderMethods<B extends ByteSchema<'obj'>> = B extends ByteSchema<'obj', infer T>
	? {
			[P in keyof T as `set${Capitalize<string & P>}`]: (
				value: ByteInput<T[P] extends ByteSchema ? T[P] : never>
			) => any;
	  }
	: never;

export type ByteSubtemplate<T extends ByteType> = T extends 'arr' | 'dynarr'
	? ByteSchema[]
	: T extends 'tuple'
	? [...ByteSchema[]]
	: T extends 'obj'
	? { [key: string]: ByteSchema<ByteType, ByteSubtemplate<ByteType>> }
	: never;

export type ByteTemplateBase<T extends ByteType> = T extends BytePrimitive
	? ByteSchema<BytePrimitive>
	: T extends 'arr' | 'dynarr'
	? ByteSchema[]
	: T extends 'tuple'
	? [...ByteSchema[]]
	: T extends 'obj'
	? { [key: string]: ByteSchema<ByteType, ByteSubtemplate<ByteType>> }
	: never;
