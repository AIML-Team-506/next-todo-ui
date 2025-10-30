'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Tab } from '@headlessui/react';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import {
  Inter,
  Caveat,
  Indie_Flower,
  Shadows_Into_Light,
  Dancing_Script,
  Sacramento,
  Reenie_Beanie,
  Pacifico,
} from 'next/font/google';

/* ────────────────────── FONT DEFINITIONS ────────────────────── */
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const caveat = Caveat({ subsets: ['latin'], variable: '--font-caveat', weight: '400' });
const indie = Indie_Flower({ subsets: ['latin'], variable: '--font-indie', weight: '400' });
const shadows = Shadows_Into_Light({ subsets: ['latin'], variable: '--font-shadows', weight: '400' });
const dancing = Dancing_Script({ subsets: ['latin'], variable: '--font-dancing', weight: '400' });
const sacramento = Sacramento({ subsets: ['latin'], variable: '--font-sacramento', weight: '400' });
const reenie = Reenie_Beanie({ subsets: ['latin'], variable: '--font-reenie', weight: '400' });
const pacifico = Pacifico({ subsets: ['latin'], variable: '--font-pacifico', weight: '400' });

const fontList = [
  { name: 'Sans Serif', value: 'inter', class: inter.className },
  { name: 'Caveat', value: 'caveat', class: caveat.className },
  { name: 'Indie Flower', value: 'indie', class: indie.className },
  { name: 'Shadows Into Light', value: 'shadows', class: shadows.className },
  { name: 'Dancing Script', value: 'dancing', class: dancing.className },
  { name: 'Sacramento', value: 'sacramento', class: sacramento.className },
  { name: 'Reenie Beanie', value: 'reenie', class: reenie.className },
  { name: 'Pacifico', value: 'pacifico', class: pacifico.className },
];

/* ────────────────────── API ────────────────────── */
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL  || 'http://localhost:3000/todo';

interface Todo {
  id: string;
  title: string;
  description?: string;
  done: boolean;
  createdAt: string;
}

/* ────────────────────── COMPONENT ────────────────────── */
export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filtered, setFiltered] = useState<Todo[]>([]);
  const [search, setSearch] = useState('');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [editing, setEditing] = useState<Todo | null>(null);
  const [font, setFont] = useState('inter'); // default
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---- font class for the selected font ---- */
  const selectedFontClass = fontList.find((f) => f.value === font)?.class ?? inter.className;

  /* ---- fetch todos ---- */
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get<Todo[]>(API_BASE_URL);
        setTodos(data.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)));
      } catch {
        setError('Failed to load todos');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  /* ---- search filter ---- */
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      todos.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description?.toLowerCase().includes(q) ?? false)
      )
    );
  }, [search, todos]);

  /* ---- CRUD helpers ---- */
  const create = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const { data } = await axios.post<Todo>(API_BASE_URL, {
        title,
        description: desc,
        done: false,
      });
      setTodos([data, ...todos]);
      setTitle('');
      setDesc('');
    } catch {
      setError('Create failed');
    } finally {
      setLoading(false);
    }
  };

  const update = async () => {
    if (!editing || !title.trim()) return;
    setLoading(true);
    try {
      const { data } = await axios.patch<Todo>(`${API_BASE_URL}/${editing.id}`, {
        title,
        description: desc,
      });
      setTodos(todos.map((t) => (t.id === editing.id ? data : t)));
      setEditing(null);
      setTitle('');
      setDesc('');
    } catch {
      setError('Update failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleDone = async (id: string, done: boolean) => {
    setLoading(true);
    try {
      const { data } = await axios.patch<Todo>(`${API_BASE_URL}/${id}`, { done });
      setTodos(todos.map((t) => (t.id === id ? data : t)));
    } catch {
      setError('Toggle failed');
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/${id}`);
      setTodos(todos.filter((t) => t.id !== id));
      if (editing?.id === id) {
        setEditing(null);
        setTitle('');
        setDesc('');
      }
    } catch {
      setError('Delete failed');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (t: Todo) => {
    setEditing(t);
    setTitle(t.title);
    setDesc(t.description ?? '');
  };

  const cancelEdit = () => {
    setEditing(null);
    setTitle('');
    setDesc('');
  };

  const filteredByTab = (tab: string) => {
    if (tab === 'All') return filtered;
    if (tab === 'Completed') return filtered.filter((t) => t.done);
    return filtered.filter((t) => !t.done);
  };

  /* ────────────────────── UI ────────────────────── */
  return (
    <div
      className={`${selectedFontClass} min-h-screen bg-black p-6 text-white`}
    >
      {/* Header + Font selector */}
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold">Todo App</h1>

        <div className="flex items-center gap-2">
          <label className="text-sm">Font:</label>
          <select
            value={font}
            onChange={(e) => setFont(e.target.value)}
            className="bg-black border border-white rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-white"
          >
            {fontList.map((f) => (
              <option key={f.value} value={f.value}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      {error && <p className="text-red-400 text-center mb-4">{error}</p>}

      <div className="grid grid-cols-3 gap-8">
        {/* ───── LEFT: LIST (2/3) ───── */}
        <section className="col-span-2">
          {/* Search */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black border border-white rounded px-10 py-2 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-white" />
          </div>

          {/* Tabs */}
          <Tab.Group>
            <Tab.List className="flex gap-1 mb-6 border border-white rounded p-1 bg-black">
              {['All', 'Completed', 'Incomplete'].map((t) => (
                <Tab
                  key={t}
                  className={({ selected }) =>
                    `flex-1 py-2 text-sm rounded transition-colors ${
                      selected ? 'bg-white text-black' : 'text-white hover:bg-gray-900'
                    }`
                  }
                >
                  {t}
                </Tab>
              ))}
            </Tab.List>

            <Tab.Panels>
              {['All', 'Completed', 'Incomplete'].map((tab) => (
                <Tab.Panel key={tab}>
                  {loading ? (
                    <p className="text-gray-400">Loading…</p>
                  ) : filteredByTab(tab).length === 0 ? (
                    <p className="text-center py-8 text-gray-400">No todos.</p>
                  ) : (
                    <ul className="space-y-3">
                      {filteredByTab(tab).map((todo) => (
                        <li
                          key={todo.id}
                          className="flex items-start gap-3 p-4 border border-white rounded hover:bg-gray-950 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={todo.done}
                            onChange={() => toggleDone(todo.id, !todo.done)}
                            className="mt-1 h-5 w-5 rounded border-white focus:ring-white"
                          />
                          <div className="flex-1">
                            <h3
                              className={`text-lg font-medium ${
                                todo.done ? 'line-through opacity-60' : ''
                              }`}
                            >
                              {todo.title}
                            </h3>
                            {todo.description && (
                              <p
                                className={`text-sm mt-1 ${
                                  todo.done ? 'line-through opacity-60' : 'text-gray-300'
                                }`}
                              >
                                {todo.description}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(todo.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEdit(todo)}
                              className="bg-white text-black px-3 py-1 rounded text-sm hover:bg-gray-200 flex items-center"
                            >
                              <PencilIcon className="h-4 w-4 mr-1" /> Edit
                            </button>
                            <button
                              onClick={() => remove(todo.id)}
                              className="bg-white text-black px-3 py-1 rounded text-sm hover:bg-gray-200 flex items-center"
                            >
                              <TrashIcon className="h-4 w-4 mr-1" /> Delete
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>
        </section>

        {/* ───── RIGHT: FORM (1/3) ───── */}
        <aside className="col-span-1 bg-black border border-white rounded p-6 sticky top-6">
          <h2 className="text-2xl font-bold mb-5">
            {editing ? 'Edit Todo' : 'New Todo'}
          </h2>

          <input
            type="text"
            placeholder="Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full mb-4 bg-black border border-white rounded p-3 focus:outline-none focus:ring-2 focus:ring-white"
          />

          <textarea
            placeholder="Description (optional)"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={4}
            className="w-full mb-6 bg-black border border-white rounded p-3 focus:outline-none focus:ring-2 focus:ring-white resize-none"
          />

          {editing ? (
            <div className="flex gap-2">
              <button
                onClick={update}
                disabled={loading || !title.trim()}
                className="flex-1 bg-white text-black py-2 rounded font-medium hover:bg-gray-200 disabled:opacity-50"
              >
                Update
              </button>
              <button
                onClick={cancelEdit}
                className="flex-1 bg-gray-800 text-white py-2 rounded font-medium hover:bg-gray-700 flex items-center justify-center"
              >
                <XMarkIcon className="h-5 w-5 mr-1" /> Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={create}
              disabled={loading || !title.trim()}
              className="w-full bg-white text-black py-3 rounded font-medium hover:bg-gray-200 disabled:opacity-50 flex items-center justify-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" /> Add Todo
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}