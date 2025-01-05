/* node:coverage disable: this file is just types */

/**
 * Same as the TS built-in `Omit` but works over a union.
 *
 * @category Internal
 */
export type UnionOmit<Original, Key extends PropertyKey> = Original extends unknown
    ? Omit<Original, Key>
    : never;
