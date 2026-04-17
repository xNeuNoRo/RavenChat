/**
 * @description Decorador para mapear los resultados de RavenDB a las entidades de dominio correspondientes
 */
export function RavenToEntity(entityClass: { prototype: any }) {
  return function <T, A extends any[], R>(
    target: (...args: A) => Promise<R>,
    _context: ClassMethodDecoratorContext,
  ) {
    return async function (this: T, ...args: A): Promise<R> {
      // Ejecutamos el método original (el load o query de RavenDB)
      const result = await target.call(this, ...args);

      if (!result) return result;

      // Si es un array (resultado de un query)
      if (Array.isArray(result)) {
        result.forEach((item) => {
          if (item && typeof item === "object") {
            Object.setPrototypeOf(item, entityClass.prototype);
          }
        });
      }
      // Si es un objeto único (resultado de un load)
      else if (typeof result === "object") {
        Object.setPrototypeOf(result, entityClass.prototype);
      }

      return result;
    };
  };
}
