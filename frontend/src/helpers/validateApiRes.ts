import type { TSchema, Static } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import {
  ApiResponseStrictSchema,
  type ApiResponseStrictFromSchema,
} from "../shared/api.schemas";

/**
 * @description Valida la respuesta de la API usando un esquema de TypeBox. Lanza errores con mensajes específicos si la validación falla o si la API responde con un error.
 * @param payload La respuesta sin procesar de la API que se desea validar.
 * @param dataSchema El esquema de TypeBox que describe la estructura esperada de los datos en caso de éxito. Este esquema se usará para validar el campo "data" de la respuesta.
 * @returns Los datos validados y tipados según el esquema proporcionado, si la respuesta es correcta.
 */
export function validateApiRes<S extends TSchema>(
  payload: unknown,
  dataSchema: S,
): Static<S> {
  const schema = ApiResponseStrictSchema(dataSchema);

  // Validamos la estructura general de la respuesta de la API
  if (!Value.Check(schema, payload)) {
    // Si la validación falla, lanzamos un error genérico
    throw new Error("Error al comunicarse con el servidor");
  }

  // Hacemos el cast seguro ya que Value.Check pasó
  const result = payload as ApiResponseStrictFromSchema<S>;

  // Si la API respondió con ok: false, lanzamos el mensaje de error específico
  if (!result.ok) {
    throw new Error(result.error.message ?? "Error desconocido del servidor");
  }

  // Si es correcto, retornamos los datos validados
  return result.data;
}
