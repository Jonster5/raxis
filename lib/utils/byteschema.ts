import { BuilderMethods, ByteInput, ByteSubtemplate } from './bytetemplate';

export class ByteSchema<T extends ByteType = ByteType, S extends ByteSubtemplate<ByteType> | 'primitive' = any> {
	type: T;
	subtemplate: S;

	constructor(type: T, subtemplate?: S) {
		this.type = type;
		this.subtemplate = subtemplate ?? ('primitive' as S);
	}
}

export type BytePrimitive =
	| 'u8'
	| 'u16'
	| 'u32'
	| 'u64'
	| 'i8'
	| 'i16'
	| 'i32'
	| 'i64'
	| 'f32'
	| 'f64'
	| 'dynstr'
	| 'str';
export type ByteStructure = `arr` | 'dynarr' | 'tuple' | 'obj';
export type OptionalBytePrimitive = `${BytePrimitive}?`;
export type OptionalByteStructure = `${ByteStructure}?`;

export type ByteType = BytePrimitive | ByteStructure | OptionalBytePrimitive | OptionalByteStructure;

export function str() {
	return new ByteSchema('str');
}

export function dynstr() {
	return new ByteSchema('dynstr');
}

export function obj<T extends ByteSubtemplate<'obj'>>(obj: T): ByteSchema<'obj', T> {
	return new ByteSchema('obj', obj);
}

const foo = obj({
	yup: str(),
	ohyeah: dynstr(),
	mhm: obj({
		no: str(),
		another: obj({ x: str() }),
	}),
});

declare const bar: ByteInput<typeof foo>;

declare const baz: BuilderMethods<typeof foo>;
