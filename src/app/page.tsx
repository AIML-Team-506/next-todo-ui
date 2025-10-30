'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Tab } from '@headlessui/react';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { Inter, Caveat } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const caveat = Caveat({ subsets: ['latin'], variable: '--font-caveat' });

const API_BASE_URL = 'https://nest-todo-v8xx.onrender.com/todos'; // Adjust if your backend is on a different port/host

interface Todo {
  id: string;
  title: string;
  description?: string;
  done: boolean;
  createdAt: string;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [font, setFont] = useState('inter');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentFont = font === 'inter' ? inter : caveat;

  useEffect(() => {
    fetchTodos();
  }, []);

  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    setFilteredTodos(
      todos.filter(
        (todo) =>
          todo.title.toLowerCase().includes(lowerQuery) ||
          (todo.description && todo.description.toLowerCase().includes(lowerQuery))
      )
    );
  }, [searchQuery, todos]);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const res = await axios.get<Todo[]>(API_BASE_URL);
      setTodos(res.data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setError(null);
    } catch (err) {
      setError('Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  };

  const createTodo = async () => {
    if (!newTitle.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post<Todo>(API_BASE_URL, { title: newTitle, description: newDescription, done: false });
      setTodos([res.data, ...todos]);
      setNewTitle('');
      setNewDescription('');
      setError(null);
    } catch (err) {
      setError('Failed to create todo');
    } finally {
      setLoading(false);
    }
  };

  const updateTodo = async () => {
    if (!editingTodo || !newTitle.trim()) return;
    setLoading(true);
    try {
      const res = await axios.patch<Todo>(`${API_BASE_URL}/${editingTodo.id}`, {
        title: newTitle,
        description: newDescription,
      });
      setTodos(todos.map((todo) => (todo.id === editingTodo.id ? res.data : todo)));
      setEditingTodo(null);
      setNewTitle('');
      setNewDescription('');
      setError(null);
    } catch (err) {
      setError('Failed to update todo');
    } finally {
      setLoading(false);
    }
  };

  const toggleDone = async (id: string, done: boolean) => {
    setLoading(true);
    try {
      const res = await axios.patch<Todo>(`${API_BASE_URL}/${id}`, { done });
      setTodos(todos.map((todo) => (todo.id === id ? res.data : todo)));
      setError(null);
    } catch (err) {
      setError('Failed to update todo');
    } finally {
      setLoading(false);
    }
  };

  const deleteTodo = async (id: string) => {
    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/${id}`);
      setTodos(todos.filter((todo) => todo.id !== id));
      if (editingTodo?.id === id) {
        setEditingTodo(null);
        setNewTitle('');
        setNewDescription('');
      }
      setError(null);
    } catch (err) {
      setError('Failed to delete todo');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (todo: Todo) => {
    setEditingTodo(todo);
    setNewTitle(todo.title);
    setNewDescription(todo.description || '');
  };

  const cancelEditing = () => {
    setEditingTodo(null);
    setNewTitle('');
    setNewDescription('');
  };

  const getFilteredByTab = (tab: string) => {
    if (tab === 'All') return filteredTodos;
    if (tab === 'Completed') return filteredTodos.filter((todo) => todo.done);
    if (tab === 'Incomplete') return filteredTodos.filter((todo) => !todo.done);
    return [];
  };

  return (
    <div className={`${currentFont.variable} font-sans min-h-screen bg-black p-8`}>
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-4xl font-bold">Modern Todo App</h1>
        <div>
          <label className="mr-2">Font:</label>
          <select
            value={font}
            onChange={(e) => setFont(e.target.value)}
            className="bg-black text-white border border-white p-2 rounded"
          >
            <option value="inter">Sans</option>
            <option value="caveat">Handwritten</option>
          </select>
        </div>
      </header>

      {error && <p className="text-red-500 mb-4">{error}</p>} {/* Kept red for error visibility, adjust if needed */}

      <div className="grid grid-cols-3 gap-8">
        {/* Left Section: Todo List (Wider) */}
        <div className="col-span-2">
          {/* Search */}
          <div className="mb-8 relative">
            <input
              type="text"
              placeholder="Search by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 bg-black text-white rounded-md border border-white focus:outline-none focus:ring-2 focus:ring-white pl-10"
            />
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-white" />
          </div>

          {/* Tabs */}
          <Tab.Group>
            <Tab.List className="flex space-x-1 mb-6 bg-black rounded-lg p-1 border border-white">
              {['All', 'Completed', 'Incomplete'].map((tab) => (
                <Tab
                  key={tab}
                  className={({ selected }) =>
                    `w-full py-3 text-sm font-medium rounded-md ${
                      selected ? 'bg-white text-black' : 'text-white hover:bg-gray-800'
                    }`
                  }
                >
                  {tab}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels>
              {['All', 'Completed', 'Incomplete'].map((tab, idx) => (
                <Tab.Panel key={idx}>
                  {loading ? (
                    <p>Loading...</p>
                  ) : getFilteredByTab(tab).length === 0 ? (
                    <p>No todos found.</p>
                  ) : (
                    <ul className="space-y-4">
                      {getFilteredByTab(tab).map((todo) => (
                        <li
                          key={todo.id}
                          className="flex items-start p-4 bg-black border border-white rounded-md"
                        >
                          <input
                            type="checkbox"
                            checked={todo.done}
                            onChange={() => toggleDone(todo.id, !todo.done)}
                            className="mt-1 mr-4 h-5 w-5"
                          />
                          <div className="flex-1">
                            <h3 className={`text-xl font-semibold ${todo.done ? 'line-through' : ''}`}>
                              {todo.title}
                            </h3>
                            {todo.description && <p className={`${todo.done ? 'line-through' : ''}`}>{todo.description}</p>}
                            <p className="text-sm text-gray-400">
                              Created: {new Date(todo.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => startEditing(todo)}
                              className="bg-white text-black py-2 px-4 rounded-md hover:bg-gray-200 flex items-center"
                            >
                              <PencilIcon className="h-5 w-5 mr-2" /> Edit
                            </button>
                            <button
                              onClick={() => deleteTodo(todo.id)}
                              className="bg-white text-black py-2 px-4 rounded-md hover:bg-gray-200 flex items-center"
                            >
                              <TrashIcon className="h-5 w-5 mr-2" /> Delete
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
        </div>

        {/* Right Section: Add/Edit Form */}
        <div className="col-span-1 bg-black p-6 rounded-lg border border-white">
          <h2 className="text-2xl font-semibold mb-4">
            {editingTodo ? 'Edit Todo' : 'Add New Todo'}
          </h2>
          <input
            type="text"
            placeholder="Title (required)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full mb-4 p-3 bg-black text-white rounded-md border border-white focus:outline-none focus:ring-2 focus:ring-white"
          />
          <textarea
            placeholder="Description (optional)"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="w-full mb-4 p-3 bg-black text-white rounded-md border border-white focus:outline-none focus:ring-2 focus:ring-white"
          />
          {editingTodo ? (
            <div className="flex space-x-2">
              <button
                onClick={updateTodo}
                disabled={loading || !newTitle.trim()}
                className="flex-1 bg-white text-black py-3 rounded-md hover:bg-gray-200 disabled:opacity-50 flex items-center justify-center"
              >
                <PlusIcon className="h-5 w-5 mr-2" /> Update
              </button>
              <button
                onClick={cancelEditing}
                className="flex-1 bg-white text-black py-3 rounded-md hover:bg-gray-200 flex items-center justify-center"
              >
                <XMarkIcon className="h-5 w-5 mr-2" /> Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={createTodo}
              disabled={loading || !newTitle.trim()}
              className="w-full bg-white text-black py-3 rounded-md hover:bg-gray-200 disabled:opacity-50 flex items-center justify-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" /> Add Todo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}