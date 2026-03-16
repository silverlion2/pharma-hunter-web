import React, { useState } from 'react';
import { ArrowLeft, Clock, Tag, ChevronRight, BookOpen, Calendar, User } from 'lucide-react';
import { blogPosts } from '../data/blogData';

const Blog = ({ setView }) => {
  const [selectedPost, setSelectedPost] = useState(null);

  // Article View
  if (selectedPost) {
    const post = blogPosts.find(p => p.id === selectedPost);
    if (!post) return null;

    // Simple markdown-like renderer for content
    const renderContent = (content) => {
      return content.split('\n\n').map((block, i) => {
        // Headings
        if (block.startsWith('### ')) {
          return <h3 key={i} className="text-lg font-black text-white mt-8 mb-3 tracking-tight">{block.replace('### ', '')}</h3>;
        }
        if (block.startsWith('## ')) {
          return <h2 key={i} className="text-xl font-black text-white mt-10 mb-4 tracking-tight">{block.replace('## ', '')}</h2>;
        }
        
        // Tables
        if (block.includes('|') && block.includes('---')) {
          const rows = block.trim().split('\n').filter(row => !row.match(/^\|[\s-|]+\|$/));
          const headers = rows[0]?.split('|').filter(Boolean).map(h => h.trim());
          const dataRows = rows.slice(1).map(row => row.split('|').filter(Boolean).map(cell => cell.trim()));
          return (
            <div key={i} className="overflow-x-auto my-6">
              <table className="w-full text-xs border border-slate-800 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-slate-800/50">
                    {headers?.map((h, j) => <th key={j} className="px-4 py-3 text-left text-slate-300 font-black uppercase tracking-wider">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {dataRows.map((row, j) => (
                    <tr key={j} className="border-t border-slate-800/50 hover:bg-slate-800/20">
                      {row.map((cell, k) => <td key={k} className="px-4 py-3 text-slate-400">{cell}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        // Bullet lists
        if (block.match(/^[-*]\s/m)) {
          const items = block.split('\n').filter(line => line.match(/^[-*]\s/));
          return (
            <ul key={i} className="space-y-2 my-4 ml-4">
              {items.map((item, j) => {
                const text = item.replace(/^[-*]\s/, '');
                return (
                  <li key={j} className="text-slate-400 text-sm leading-relaxed flex gap-2">
                    <span className="text-cyan-500 mt-1.5 shrink-0">•</span>
                    <span dangerouslySetInnerHTML={{ __html: text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-200">$1</strong>') }} />
                  </li>
                );
              })}
            </ul>
          );
        }

        // Numbered lists
        if (block.match(/^\d+\.\s/m)) {
          const items = block.split('\n').filter(line => line.match(/^\d+\.\s/));
          return (
            <ol key={i} className="space-y-2 my-4 ml-4">
              {items.map((item, j) => {
                const text = item.replace(/^\d+\.\s/, '');
                return (
                  <li key={j} className="text-slate-400 text-sm leading-relaxed flex gap-3">
                    <span className="text-cyan-500 font-black shrink-0">{j + 1}.</span>
                    <span dangerouslySetInnerHTML={{ __html: text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-200">$1</strong>') }} />
                  </li>
                );
              })}
            </ol>
          );
        }

        // Regular paragraphs
        return (
          <p key={i} className="text-slate-400 text-sm leading-relaxed my-4"
            dangerouslySetInnerHTML={{ __html: block.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-200">$1</strong>') }}
          />
        );
      });
    };

    return (
      <article className="max-w-3xl mx-auto py-8 px-6">
        <button
          onClick={() => setSelectedPost(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-white mb-8 transition-all font-bold text-xs"
        >
          <ArrowLeft size={14} /> BACK TO ALL ARTICLES
        </button>

        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-lg">
              {post.category}
            </span>
            <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1.5">
              <Clock size={10} /> {post.readTime}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight mb-4">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <User size={12} /> {post.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={12} /> {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </header>

        <div className="prose prose-invert max-w-none">
          {renderContent(post.content)}
        </div>

        <div className="mt-12 flex flex-wrap gap-2">
          {post.tags.map(tag => (
            <span key={tag} className="text-[10px] font-bold text-slate-500 bg-slate-800/50 border border-slate-700/50 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <Tag size={10} /> {tag}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 p-8 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl text-center">
          <h3 className="text-lg font-black text-white mb-2">Want to see these signals in action?</h3>
          <p className="text-sm text-slate-400 mb-6">BioQuantix tracks all of these metrics in real-time across 150+ bio-pharma assets.</p>
          <button
            onClick={() => setView('dashboard')}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black text-sm px-8 py-3 rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/20"
          >
            ENTER TERMINAL
          </button>
        </div>
      </article>
    );
  }

  // Blog List View
  return (
    <section aria-label="BioQuantix Blog - Bio-Pharma M&A Intelligence Articles" className="max-w-5xl mx-auto py-8 px-6">
      <div className="mb-12">
        <div className="flex items-center gap-2 text-[10px] text-cyan-500 font-black uppercase tracking-widest mb-4">
          <BookOpen size={14} /> Research & Insights
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
          Bio-Pharma Intelligence Blog
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl">
          Deep-dive analyses on bio-pharma M&A trends, algorithmic deal prediction, clinical data interpretation, and institutional trading patterns.
        </p>
      </div>

      <div className="grid gap-6">
        {blogPosts.map((post, index) => (
          <article
            key={post.id}
            onClick={() => setSelectedPost(post.id)}
            className="group cursor-pointer bg-slate-900/40 hover:bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 md:p-8 transition-all duration-300"
          >
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-lg">
                    {post.category}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1.5">
                    <Clock size={10} /> {post.readTime}
                  </span>
                </div>
                <h2 className="text-xl font-black text-white tracking-tight mb-2 group-hover:text-cyan-400 transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={10} /> {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                    <span>•</span>
                    <span>{post.author}</span>
                  </div>
                  <span className="text-xs font-black text-cyan-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    READ <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            </div>

            {index === 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-800/50">
                {post.tags.map(tag => (
                  <span key={tag} className="text-[9px] font-bold text-slate-600 bg-slate-800/40 px-2 py-1 rounded-md">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

export default Blog;
