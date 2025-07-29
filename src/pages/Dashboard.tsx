import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTrash } from 'react-icons/fi';
import { MdDashboard } from 'react-icons/md'; // ✅ New icon

interface Note {
  _id: string;
  title: string;
  content: string;
}

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState({ title: '', content: '' });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/signin');
      return;
    }

    const userData = JSON.parse(storedUser);
    setUser(userData);

    fetch(`${import.meta.env.VITE_API_BASE}/notes?email=${userData.email}`)
      .then(res => res.json())
      .then(data => setNotes(data))
      .catch(err => console.error('Error fetching notes:', err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/signin');
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.title.trim()) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newNote,
          userEmail: user?.email,
        }),
      });

      const created = await res.json();
      setNotes(prev => [...prev, created]);
      setNewNote({ title: '', content: '' });
    } catch (err) {
      console.error('Error adding note:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE}/notes/${id}`, {
        method: 'DELETE',
      });
      setNotes(prev => prev.filter(note => note._id !== id));
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white px-4 py-6 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <MdDashboard className="text-blue-600 text-2xl" /> {/* ✅ New icon */}
          <h1 className="text-xl font-semibold">Dashboard</h1>
        </div>
        <button
          onClick={handleLogout}
          className="text-blue-600 hover:underline text-sm"
        >
          Sign Out
        </button>
      </div>

      <div className="bg-gray-100 rounded-lg p-4 shadow mb-6">
        <h2 className="text-lg font-semibold">Welcome, {user.name}!</h2>
        <p className="text-sm text-gray-600">Email: {user.email}</p>
      </div>

      <form onSubmit={handleAddNote} className="bg-blue-50 rounded-lg p-4 shadow space-y-3 mb-6">
        <input
          type="text"
          placeholder="Note Title"
          value={newNote.title}
          onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <textarea
          placeholder="Write your note..."
          value={newNote.content}
          onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Add Note
        </button>
      </form>

      <h3 className="text-md font-semibold mb-2">Your Notes</h3>
      <div className="space-y-3">
        {notes.length === 0 ? (
          <p className="text-sm text-gray-500 text-center">No notes yet. Start writing!</p>
        ) : (
          notes.map(note => (
            <div key={note._id} className="bg-gray-50 p-3 rounded-md shadow">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-medium text-gray-800">{note.title}</h4>
                <button
                  onClick={() => handleDelete(note._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FiTrash />
                </button>
              </div>
              <p className="text-sm text-gray-700">{note.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;
