const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatePostPage.tsx', 'utf8');

// Add state for AI
code = code.replace(
  "const [showMediaModal, setShowMediaModal] = useState(false);",
  "const [showMediaModal, setShowMediaModal] = useState(false);\n  const [isGeneratingAI, setIsGeneratingAI] = useState(false);"
);

// Add handleAITool
const aiFunction = `
  const handleAITool = async (tool: string) => {
    if (!currentContentText.trim()) {
      toast.error('Please enter some content first');
      return;
    }
    
    setIsGeneratingAI(true);
    const toastId = toast.loading(\`Generating \${tool}...\`);
    
    try {
      const response = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool,
          content: currentContentText,
          platform: activePreviewTab !== 'original' ? activePreviewTab : undefined
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate');
      }
      
      handleContentChange(data.result);
      toast.success('Generated successfully', { id: toastId });
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setIsGeneratingAI(false);
    }
  };
`;

code = code.replace(
  "const handleContentChange = (text: string) => {",
  aiFunction + "\n  const handleContentChange = (text: string) => {"
);

// Add AI button handlers
code = code.replace(
  "{['Improve', 'Hook', 'Rewrite', 'Shorten', 'Hashtags'].map(tool => (",
  "{['Improve', 'Hook', 'Rewrite', 'Shorten', 'Hashtags'].map(tool => ("
);

code = code.replace(
  /<button key=\{tool\} className="px-2.5 py-1 text-\[12px\] font-medium text-zinc-600 bg-white border border-zinc-200 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 rounded-\[6px\] transition-colors shadow-sm">/g,
  `<button 
                  key={tool} 
                  onClick={() => handleAITool(tool)}
                  disabled={isGeneratingAI}
                  className="px-2.5 py-1 text-[12px] font-medium text-zinc-600 bg-white border border-zinc-200 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 rounded-[6px] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">`
);

fs.writeFileSync('src/pages/CreatePostPage.tsx', code);
