// FILE: server/src/utils/bigint.utils.ts
// Add BigInt serialization support
(BigInt.prototype as any).toJSON = function() {
  return this.toString();
};