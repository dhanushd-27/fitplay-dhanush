export function assertNonNull<T>(
  value: T,
  msg?: string
): asserts value is NonNullable<T> {
  if (value == null) {
    throw new Error(msg ?? "Expected value to be non-null");
  }
}
