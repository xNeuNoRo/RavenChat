export class ChatMessage {
  public id?: string;

  public content: string;
  public readonly username: string;
  public readonly createdAt: string;

  // Constructor público para permitir la hidratación de RavenDB
  public constructor(data?: Partial<ChatMessage>) {
    // Si no hay data (instanciación de prueba de RavenDB), inicializamos vacío y salimos
    if (!data) {
      this.username = "Usuario Anónimo";
      this.content = "";
      this.createdAt = new Date().toISOString();
      return;
    }

    const username = data.username?.trim() || "Usuario Anónimo";
    const content = data.content?.trim() ?? "";

    // Solo validamos si estamos "creando" o si los datos vienen de la DB
    this.validate(username, content);

    this.id = data.id;
    this.username = username;
    this.content = content;
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  // Método de validación compartido
  private validate(username: string, content: string): void {
    if (username.length === 0) {
      throw new Error("El nombre de usuario es obligatorio.");
    }

    if (content.length === 0) {
      throw new Error("El contenido del mensaje es obligatorio.");
    }

    if (content.length > 5000) {
      throw new Error(
        "El contenido del mensaje no puede exceder los 5000 caracteres.",
      );
    }
  }

  public static create(username: string, content: string): ChatMessage {
    return new ChatMessage({ username, content });
  }

  public updateContent(newContent: string): void {
    if (newContent.trim().length === 0) {
      throw new Error("El contenido del mensaje no puede estar vacío.");
    }
    this.content = newContent.trim();
  }
}
