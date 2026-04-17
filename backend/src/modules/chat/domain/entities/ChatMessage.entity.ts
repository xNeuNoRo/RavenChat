export class ChatMessage {
  // Es opcional para que ravenDB lo genere automáticamente al guardar el documento
  public id?: string;

  public content: string;
  public readonly username: string;
  public readonly createdAt: string;

  // Constructor privado para usar el patron factory method
  private constructor(content: string, username?: string) {
    this.username = username?.trim() || "Usuario Anónimo";
    this.content = content.trim();
    this.createdAt = new Date().toISOString();
  }

  public static create(username: string, content: string): ChatMessage {
    if (username?.trim().length === 0) {
      throw new Error("El nombre de usuario es obligatorio.");
    }

    if (!content || content.trim().length === 0) {
      throw new Error("El contenido del mensaje es obligatorio.");
    }

    if (content.length > 5000) {
      throw new Error(
        "El contenido del mensaje no puede exceder los 5000 caracteres.",
      );
    }

    return new ChatMessage(content, username);
  }

  public updateContent(newContent: string): void {
    if (newContent.trim().length === 0) {
      throw new Error("El contenido del mensaje no puede estar vacío.");
    }
    this.content = newContent.trim();
  }
}
