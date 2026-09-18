const fs = require('fs');

let calendarCode = fs.readFileSync('src/pages/CalendarPage.tsx', 'utf8');
calendarCode = calendarCode.replace(
  "const DroppableCell = ({ id, className, children, onClick }: { id: string, className: string, children: React.ReactNode, onClick?: () => void }) => {",
  "const DroppableCell: React.FC<{ id: string, className: string, children: React.ReactNode, onClick?: () => void }> = ({ id, className, children, onClick }) => {"
);
calendarCode = calendarCode.replace(
  "const DraggablePost = ({ post, onClick, mediaAssets, socialAccounts }: { post: Post, onClick: () => void, mediaAssets: any[], socialAccounts: any[] }) => {",
  "const DraggablePost: React.FC<{ post: Post, onClick: () => void, mediaAssets: any[], socialAccounts: any[] }> = ({ post, onClick, mediaAssets, socialAccounts }) => {"
);
fs.writeFileSync('src/pages/CalendarPage.tsx', calendarCode);

let mediaCode = fs.readFileSync('src/pages/MediaLibraryPage.tsx', 'utf8');
mediaCode = mediaCode.replace(
  "Array.from(e.target.files).forEach(file => {",
  "Array.from(e.target.files).forEach((file: File) => {"
);
fs.writeFileSync('src/pages/MediaLibraryPage.tsx', mediaCode);

