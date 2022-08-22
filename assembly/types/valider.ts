/**
 * As Result and Optional types are not yet implemented and because
 * exception are not an alternative in AssemblyScript (this will stop
 * the execution), an interface is added to let the type user know when
 * the type is no longer meaningful.
 */
export interface Valider {
  isValid(): bool;
}
