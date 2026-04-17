export function UserAvatar({ username }: Readonly<{ username: string }>) {
  // Extraemos la primera o primeras dos letras
  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

  // Convierte el nombre en un color HEX consistente
  const stringToColor = (str: string) => {
    // Genera un hash a partir del string
    let hash = 0;
    // Itera sobre cada carácter del string para calcular el hash
    for (const char of str) {
      // Actualiza el hash usando el código del carácter y una operación de desplazamiento
      hash = (char.codePointAt(0) ?? 0) + ((hash << 5) - hash);
    }
    // Convierte el hash a un color HEX, asegurándose de que tenga 6 dígitos
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();
    // Rellena con ceros a la izquierda si el color es más corto que 6 dígitos
    return "#" + "00000".substring(0, 6 - c.length) + c;
  };

  return (
    <div
      className="flex shrink-0 items-center justify-center w-8 h-8 rounded-full text-white font-bold text-xs shadow-sm"
      style={{ backgroundColor: stringToColor(username) }}
      title={username}
    >
      {getInitials(username)}
    </div>
  );
}
