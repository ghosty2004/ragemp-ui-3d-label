export type RecursiveKeyNames<T> = {
	[K in keyof T]: T[K] extends object
		? // @ts-ignore
		  `${string & K}.${string & RecursiveKeyNames<T[K]>}`
		: K;
}[keyof T];
