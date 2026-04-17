import { AbstractCsharpIndexCreationTask } from "ravendb";

export class MessagesByUserStats extends AbstractCsharpIndexCreationTask {
  constructor() {
    super();

    // Mapeamos literalmente todos los documentos de ChatMessages
    // para generar un nuevo resultado con la información que necesitamos
    // from msg in docs.ChatMessages => iteramos sobre cada coleccion de ChatMessages y la llamamos "msg"
    // select new { ... } => proyectamos un nuevo resultado con la información que necesitamos
    // En este caso, queremos agrupar por username, contar el total de mensajes y obtener la fecha del último mensaje
    this.map = `
      from msg in docs.ChatMessages
      select new {
          username = msg.username,
          totalMessages = 1,
          lastMessageAt = msg.createdAt
      }
    `;

    // Luego, agrupamos los resultados por username para obtener las estadísticas por usuario
    // from result in results => iteramos sobre los resultados generados por el map anterior
    // group result by result.username into g => agrupamos por username y llamamos "g" a cada grupo
    // select new { ... } => proyectamos un nuevo resultado con la información que necesitamos para cada grupo
    // g.Key => es el valor por el que agrupamos, en este caso el username
    // g.Sum(x => (int)x.totalMessages) => sumamos el totalMessages de cada resultado dentro del grupo para obtener el total de mensajes por usuario
    // g.Max(x => (DateTime)x.lastMessageAt) => obtenemos la fecha máxima de lastMessageAt dentro del grupo para obtener la fecha del último mensaje por usuario
    this.reduce = `
      from result in results
      group result by result.username into g
      select new {
          username = g.Key,
          totalMessages = g.Sum(x => (int)x.totalMessages),
          lastMessageAt = g.Max(x => (DateTime)x.lastMessageAt)
      }
    `;
  }
}
