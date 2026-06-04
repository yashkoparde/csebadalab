import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy, Code2 } from 'lucide-react';

interface CodeFile {
  name: string;
  language: string;
}

const getLanguageFromExtension = (filename: string) => {
  if (filename.endsWith('.c')) return 'c';
  if (filename.endsWith('.cpp')) return 'cpp';
  if (filename.endsWith('.py')) return 'python';
  return 'text';
};

export default function App() {
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<CodeFile | null>(null);
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(true);

  useEffect(() => {
    fetch('/api/files')
      .then(res => res.json())
      .then(data => {
        if (data.files && Array.isArray(data.files)) {
          const loadedFiles = data.files.map((name: string) => ({
            name,
            language: getLanguageFromExtension(name)
          }));
          setFiles(loadedFiles);
          if (loadedFiles.length > 0) {
            setSelectedFile(loadedFiles[0]);
          }
        }
        setLoadingFiles(false);
      })
      .catch(err => {
        console.error('Error fetching file list:', err);
        setLoadingFiles(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedFile) return;
    
    setCode('// Loading...');
    fetch(`/${selectedFile.name}`)
      .then(res => res.text())
      .then(text => {
          // Fallback if file isn't found (returns index.html sometimes in SPA)
          if (text.trim().startsWith('<!doctype html>')) {
              setCode('// Error: File not found in public directory');
          } else {
              setCode(text);
          }
      })
      .catch(err => console.error('Error fetching file:', err));
  }, [selectedFile]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-50">
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
              <Code2 className="w-5 h-5 text-emerald-400" />
            </div>
            <h1 className="font-semibold text-lg tracking-tight">Code Vault</h1>
          </div>
          <div className="text-sm font-semibold tracking-widest text-zinc-400 uppercase">
            CSE B™
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 flex flex-col md:flex-row gap-6">
        <nav className="w-full md:w-56 flex flex-shrink-0 flex-col gap-2">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-2">Public Directory</h2>
          {loadingFiles ? (
            <div className="text-sm text-zinc-500 px-2 animate-pulse">Loading files...</div>
          ) : files.length === 0 ? (
            <div className="text-sm text-zinc-500 px-2">No code files found in public directory.</div>
          ) : (
            files.map(file => (
              <button
                key={file.name}
                onClick={() => setSelectedFile(file)}
                className={`text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  selectedFile?.name === file.name
                    ? 'bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20'
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 border border-transparent'
                }`}
              >
                {file.name}
              </button>
            ))
          )}
        </nav>

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 border-b-0 rounded-t-xl px-4 py-3">
            <div className="font-mono text-sm text-zinc-300 flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500"></div>
              {selectedFile ? selectedFile.name : 'Select a file'}
            </div>
            <button
              onClick={handleCopy}
              disabled={!selectedFile}
              className="disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors bg-zinc-800/80 hover:bg-zinc-700 px-3 py-1.5 rounded-md border border-zinc-700 hover:border-zinc-600"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
          <div className="flex-1 border border-zinc-800 rounded-b-xl overflow-hidden bg-[#1E1E1E]">
            <SyntaxHighlighter
              language={selectedFile?.language || 'text'}
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: '1.5rem',
                minHeight: '400px',
                height: '100%',
                background: 'transparent',
                fontSize: '0.875rem',
                lineHeight: '1.6',
              }}
              codeTagProps={{
                className: "font-mono"
              }}
            >
              {code || '// Loading...'}
            </SyntaxHighlighter>
          </div>
        </div>
      </main>

      <footer className="py-8 mt-auto">
        <div className="max-w-5xl mx-auto px-4 flex flex-col items-center justify-center gap-2">
          <div className="text-zinc-500 text-sm font-medium tracking-wide">
            CSE B™
          </div>
          <p className="text-zinc-600 text-xs">
            © {new Date().getFullYear()} Code Vault Project. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
