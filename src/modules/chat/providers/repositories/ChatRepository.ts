import { requestContext } from "@neunoro/fastify-kit";
import type { IDocumentSession } from "ravendb";
import { ChatMessage } from "../../domain/entities/ChatMessage.entity";
import { UserActivityStats } from "../../domain/projections/UserActivityStats";

export class ChatRepository {
  /**
   * @description funcion de utilidad para obtener la sesion de ravendb de la request
   */
  private get session(): IDocumentSession {
    return requestContext.get("dbSession");
  }

  /**
   * @description guarda un mensaje de chat en la bd usando ravenDb
   * OJO: Aqui no hacemos un saveChanges() por lo cual solo estamos
   * almacenando en la sesion. Debes guardar manualmente los cambios.
   * @param message Objeto ChatMessage a guardar
   */
  public async save(message: ChatMessage): Promise<void> {
    await this.session.store(message);
  }

  /**
   * @description obtiene un mensaje de chat por su id
   * @param id Id del mensaje a obtener
   * @returns El mensaje de chat encontrado o null si no existe
   */
  public async getById(id: string): Promise<ChatMessage | null> {
    return await this.session.load<ChatMessage>(id);
  }

  /**
   * @description obtiene los mensajes de chat mas recientes, ordenados por fecha de creacion descendente
   * @param limit Cantidad maxima de mensajes a obtener (default: 50)
   * @returns Un array de mensajes de chat recientes, ordenados por fecha de creacion descendente
   */
  public async getRecent(limit: number = 50): Promise<ChatMessage[]> {
    const messages = await this.session
      .query<ChatMessage>("ChatMessages")
      .orderByDescending("createdAt")
      .take(limit)
      .all();

    // para mostrar los mensajes en orden cronologico,
    // simplemente invertimos el orden del array.
    return messages.reverse();
  }

  /**
   * @description elimina un mensaje de chat por su id
   * @param id Id del mensaje a eliminar
   */
  public async delete(id: string): Promise<void> {
    await this.session.delete(id);
  }

  /**
   * @description obtiene las estadisticas de actividad de los usuarios, ordenados por cantidad de mensajes descendente
   * @returns Un array de objetos UserActivityStats con las estadisticas de actividad de los usuarios, ordenados por cantidad de mensajes descendente.
   */
  public async getActiveUsersStats(): Promise<UserActivityStats[]> {
    return await this.session
      .query<UserActivityStats>({ indexName: "Messages/ByUserStats" })
      .orderByDescending("totalMessages")
      .take(10)
      .all();
  }
}
