import { isAxiosError } from "axios";
import type { ApiError } from "../shared/api.schemas";

/**
 * @description Maneja los errores de las peticiones a la API. Si el error es un error de Axios con respuesta del servidor, lanza un error con el mensaje específico proporcionado por la API. Si el error es otro tipo de error (como un error de red), lo lanza para que sea manejado por el componente que llamó a esta función.
 * @param err El error que se desea manejar. Puede ser un error de Axios con respuesta del servidor, un error de red u otro tipo de error.
 */
export function handleApiError(err: unknown): never {
  // Si el error es un error de Axios con respuesta del servidor,
  // lanzamos un error con el mensaje específico proporcionado por la API
  if (isAxiosError(err) && err.response) {
    // Intentamos extraer el mensaje de error específico de la respuesta del servidor,
    // que puede estar en diferentes formatos.
    // Asumimos que err.response.data tiene la forma de nuestra respuesta base
    const responseData = err.response.data;
    const errorData = responseData?.error as ApiError | undefined;

    // Si encontramos un mensaje de error específico,
    // lo lanzamos como un nuevo error. Si no, l
    // anzamos un error genérico con el mensaje de la respuesta o un mensaje por defecto.
    if (errorData) {
      // Si la respuesta de error tiene un campo "details" con errores específicos,
      // intentamos extraer el primer mensaje de error de ese campo para proporcionar un mensaje más detallado al usuario.
      if (errorData.details && typeof errorData.details === "object") {
        // Extraemos los valores del campo "details",
        // que pueden ser arrays de errores,
        // y tomamos el primer mensaje de error disponible para mostrarlo al usuario.
        const errorValues = Object.values(errorData.details);
        const firstErrorGroup = errorValues[0];

        // Si encontramos un mensaje de error específico en el campo "details", lo lanzamos como un nuevo error.
        if (
          errorValues.length > 0 &&
          Array.isArray(firstErrorGroup) &&
          firstErrorGroup.length > 0
        ) {
          throw new Error(String(firstErrorGroup[0]));
        }
      }

      // Si no encontramos un mensaje de error específico en el campo "details",
      // lanzamos un error con el mensaje general proporcionado por la API o un mensaje por defecto.
      throw new Error(errorData.message ?? "Error desconocido del servidor");
    }
  }
  // Si el error es otro tipo de error (como un error de red), lo lanzamos para que sea manejado por el componente que llamó a esta función
  throw err;
}
