import * as TypeUtils from './TypeUtils'

type NamedParam = {
  name: string
}

type StrictParam = NamedParam & {
  strict?: boolean,
}

type NumberParam = StrictParam & {
  lt?: number,
  lte?: number,
  gt?: number,
  gte?: number,
}

type StringParam = StrictParam & {
  alpha?: boolean,
  numeric?: boolean
}

type CustomParam = StrictParam & {
  message?: string
}

export function notNull(value: any, {name}: NamedParam) {
  if (TypeUtils.isNull(value)) {
    throw new Error(`IllegalArgument: ${name} is null or undefined`)
  }
}

export function isBoolean(value: boolean, {name, strict = true}: StrictParam) {
  if (strict) notNull(value, {name})
  if (!TypeUtils.isBoolean(value)) {
    throw new Error(`IllegalType: ${name} is not a boolean`)
  }
}

export function isNumber(value: any, {name, strict = true, lt, lte, gt, gte}: NumberParam) {
  if (strict) notNull(value, {name})
  if (!TypeUtils.isNumber(value)) {
    throw new Error(`IllegalArgument: ${name} is not a number`)
  }
  if (!TypeUtils.isNull(lt)) isLessThen(value, lt, {name})
  else if (!TypeUtils.isNull(lte)) isLessThenOrEqual(value, lt, {name})
  else if (!TypeUtils.isNull(gt)) isGreaterThenOrEqual(value, lt, {name})
  else if (!TypeUtils.isNull(gte)) isGreaterThen(value, lt, {name})
}

export function isInteger(value: any, {name, strict = true, lt, lte, gt, gte}: NumberParam) {
  if (strict) notNull(value, {name})
  if (!TypeUtils.isInteger(value)) {
    throw new Error(`IllegalArgument: ${name} is not an integer`)
  }
  if (!TypeUtils.isNull(lt)) isLessThen(value, lt, {name})
  else if (!TypeUtils.isNull(lte)) isLessThenOrEqual(value, lt, {name})
  else if (!TypeUtils.isNull(gt)) isGreaterThenOrEqual(value, lt, {name})
  else if (!TypeUtils.isNull(gte)) isGreaterThen(value, lt, {name})
}

export function isLessThen(value: any, limit: number, {name}: NamedParam) {
  if (!(value < limit)) {
    throw new Error(`IllegalArgument: ${name} must be < ${limit}`)
  }
}

export function isLessThenOrEqual(value: any, limit: number, {name}: NamedParam) {
  if (!(value <= limit)) {
    throw new Error(`IllegalArgument: ${name} must be <= ${limit}`)
  }
}

export function isGreaterThen(value: any, limit: number, {name}: NamedParam) {
  if (!(value > limit)) {
    throw new Error(`IllegalArgument: ${name} must be > ${limit}`)
  }
}

export function isGreaterThenOrEqual(value: any, limit: number, {name}: NamedParam) {
  if (!(value >= limit)) {
    throw new Error(`IllegalArgument: ${name} must be >= ${limit}`)
  }
}

export function isString(value: any, {name, strict = true, alpha, numeric}: StringParam) {
  if (strict) notNull(value, {name})
  if (!TypeUtils.isString(value)) {
    throw new Error(`IllegalArgument: ${name} is not a string`)
  }
  if (alpha && numeric) isAlphanumeric(value, {name})
  else if (alpha) isAlpha(value, {name})
  else if (numeric) isNumeric(value, {name})
}

export function isAlphanumeric(value: any, {name}: NamedParam) {
  if (!/^[a-z0-9]+$/i.test(value)) {
    throw new Error(`IllegalArgument: ${name} is not alphanumeric`)
  }
}

export function isAlpha(value: any, {name}: NamedParam) {
  if (!/^[a-z]+$/i.test(value)) {
    throw new Error(`IllegalArgument: ${name} is not alphabetic`)
  }
}

export function isNumeric(value: any, {name}: NamedParam) {
  if (!/^[0-9]+$/.test(value)) {
    throw new Error(`IllegalArgument: ${name} is not numeric`)
  }
}

export function isArray(value: any, {name, strict = true}: StrictParam) {
  if (strict) notNull(value, {name})
  if (!Array.isArray(value)) {
    throw new Error(`IllegalArgument: ${name} is not an array`)
  }
}

export function isPlainObject(value: any, {name, strict = true}: StrictParam) {
  if (strict) notNull(value, {name})
  if (!TypeUtils.isPlainObject(value)) {
    throw new Error(`IllegalType: ${name} is not an object`)
  }
}

export function isEnumValue(value: any, enumeration: Object, {name, strict = true}: StrictParam) {
  if (strict) notNull(value, {name})
  const values = new Set(Object.values(enumeration))
  if (!values.has(value)) {
    throw new Error(`IllegalArgument: ${name} should be one of [${Array.from(values, value => JSON.stringify(value)).join(', ')}]`)
  }
}

export function hasKeys(value: any, keys: string[], {name, strict = true}: StrictParam) {
  if (strict) notNull(value, {name})
  if (!TypeUtils.isPlainObject(value)) {
    throw new Error(`IllegalType: ${name} is not an object`)
  }
}

export function custom(value: any, check: (value: any) => boolean, {name, strict = true, message}: CustomParam) {
  if (strict) notNull(value, {name})
  if (!check(value)) {
    throw new Error(`IllegalType: ${name} ${message || 'is unknown type'}`)
  }
}