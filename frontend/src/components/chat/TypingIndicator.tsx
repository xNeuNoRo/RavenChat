export function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1 p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl w-fit shadow-sm">
      <div 
        className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" 
        style={{ animationDelay: '0ms' }} 
      />
      <div 
        className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" 
        style={{ animationDelay: '150ms' }} 
      />
      <div 
        className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" 
        style={{ animationDelay: '300ms' }} 
      />
    </div>
  );
}