const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

if (!code.includes("mediaFolders?: any[];")) {
  code = code.replace(
    "analytics: AnalyticsMetric[];",
    "analytics: AnalyticsMetric[];\n  mediaFolders?: any[];"
  );
}

if (!code.includes("type: 'ADD_MEDIA_FOLDER'")) {
  code = code.replace(
    "| { type: 'REMOVE_MEDIA_ASSET'; payload: string }",
    "| { type: 'REMOVE_MEDIA_ASSET'; payload: string }\n  | { type: 'ADD_MEDIA_FOLDER'; payload: any }\n  | { type: 'UPDATE_MEDIA_FOLDER'; payload: any }\n  | { type: 'DELETE_MEDIA_FOLDER'; payload: string }\n  | { type: 'UPDATE_MEDIA_ASSET'; payload: MediaAsset }"
  );
}

fs.writeFileSync('src/context/AppContext.tsx', code);
