"use client";
import React, { useState, useEffect, useRef } from 'react';
import useWorkspaceStore from '../store/useWorkspaceStore';
import { cn } from '../lib/utils';
import { User } from 'lucide-react';

export default function MentionInput({ value, onChange, placeholder, className, onKeyDown }) {
  const { currentWorkspace, fetchWorkspaceMembers } = useWorkspaceStore();
  const [members, setMembers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPos, setCursorPos] = useState(0);
  const [mentionQuery, setMentionQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (currentWorkspace) {
      fetchWorkspaceMembers(currentWorkspace.id).then(data => {
        setMembers(Array.isArray(data) ? data.map(m => m.user) : []);
      });
    }
  }, [currentWorkspace?.id]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    const selectionStart = e.target.selectionStart;
    onChange(newValue);
    setCursorPos(selectionStart);

    // Check for @ mention
    const textBeforeCursor = newValue.slice(0, selectionStart);
    const lastAtIdx = textBeforeCursor.lastIndexOf('@');

    if (lastAtIdx !== -1) {
      const query = textBeforeCursor.slice(lastAtIdx + 1);
      // Ensure there's no space between @ and cursor
      if (!query.includes(' ')) {
        setMentionQuery(query);
        const filtered = members.filter(m => 
          m.name.toLowerCase().includes(query.toLowerCase())
        );
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
        setSelectedIndex(0);
        return;
      }
    }
    setShowSuggestions(false);
  };

  const handleSelectSuggestion = (user) => {
    const textBeforeAt = value.slice(0, value.lastIndexOf('@', cursorPos - 1));
    const textAfterCursor = value.slice(cursorPos);
    const newValue = `${textBeforeAt}@${user.name.replace(/\s+/g, '')} ${textAfterCursor}`;
    
    onChange(newValue);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (showSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        handleSelectSuggestion(suggestions[selectedIndex]);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    } else if (onKeyDown) {
      onKeyDown(e);
    }
  };

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all",
          className
        )}
      />

      {showSuggestions && (
        <div 
          ref={dropdownRef}
          className="absolute bottom-full mb-2 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c0c] shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 z-[100]"
        >
          <div className="border-b border-white/10 bg-white/5 px-3 py-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-primary">Mention Teammate</p>
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {suggestions.map((user, index) => (
              <button
                key={user.id}
                onClick={() => handleSelectSuggestion(user)}
                className={cn(
                  "flex w-full items-center space-x-3 rounded-xl px-3 py-2 text-left transition-all",
                  index === selectedIndex ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <div className="h-7 w-7 rounded-lg overflow-hidden bg-white/10 border border-white/10 shrink-0">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary/20 text-primary text-[10px] font-black">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold">{user.name}</p>
                  <p className={cn(
                    "truncate text-[9px] opacity-60",
                    index === selectedIndex ? "text-white" : "text-slate-500"
                  )}>{user.email}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
