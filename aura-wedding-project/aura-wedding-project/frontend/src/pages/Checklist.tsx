import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Trash2, Plus } from 'lucide-react';
import axios from 'axios';
import LuxuryPageHeader from '../components/LuxuryPageHeader';
// pageImages unused

interface ChecklistItemType {
  _id: string;
  timeline: string;
  task: string;
  completed: boolean;
}

const timelineInfo = {
  '12_months': { title: '12 Months Out', icon: '📅', color: 'from-blue-500 to-cyan-500' },
  '6_months': { title: '6 Months Out', icon: '📆', color: 'from-purple-500 to-pink-500' },
  '3_months': { title: '3 Months Out', icon: '🗓️', color: 'from-orange-500 to-red-500' },
  '1_month': { title: '1 Month Out', icon: '⏰', color: 'from-gold to-yellow-600' },
};

export default function Checklist() {
  const [items, setItems] = useState<ChecklistItemType[]>([]);
  const [newTaskTexts, setNewTaskTexts] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get('/api/checklist');
      if (res.data.length === 0) {
          // If empty, auto populate some defaults
          await autoSeed();
      } else {
          setItems(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const autoSeed = async () => {
      const defaults = [
          { timeline: '12_months', task: 'Set wedding budget', completed: false },
          { timeline: '12_months', task: 'Draft guest list', completed: false },
          { timeline: '6_months', task: 'Book photographer', completed: false },
          { timeline: '3_months', task: 'Send invitations', completed: false },
          { timeline: '1_month', task: 'Final dress fitting', completed: false }
      ];
      try {
          for (let d of defaults) {
              await axios.post('/api/checklist', d);
          }
          const res = await axios.get('/api/checklist');
          setItems(res.data);
      } catch (err) { console.error(err); }
  }

  const toggleItem = async (item: ChecklistItemType) => {
    try {
      const updated = { ...item, completed: !item.completed };
      await axios.put(`/api/checklist/${item._id}`, updated);
      setItems(items.map(i => (i._id === item._id ? updated : i)));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await axios.delete(`/api/checklist/${id}`);
      setItems(items.filter(i => i._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const addItem = async (timeline: string) => {
    const task = newTaskTexts[timeline];
    if (!task) return;
    try {
      const res = await axios.post('/api/checklist', {
        timeline,
        task,
        completed: false
      });
      setItems([...items, res.data]);
      setNewTaskTexts({ ...newTaskTexts, [timeline]: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const totalTasks = items.length;
  const completedTasks = items.filter(i => i.completed).length;
  const overallProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-pink/20 to-white py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <LuxuryPageHeader
          kicker="Planning Rituals"
          title="A Calm Path to the Wedding Day"
          subtitle="Track the moments that matter, from first booking to final fitting."
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-gradient-to-br from-gold to-yellow-600 rounded-3xl p-8 text-white mb-8 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-playfair text-3xl font-bold mb-2">Overall Progress</h2>
              <p className="text-white/90">
                {completedTasks} of {totalTasks} tasks completed
              </p>
            </div>
            <div className="text-5xl font-bold">
              {overallProgress}%
            </div>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-white rounded-full"
            />
          </div>
        </motion.div>

        <div className="space-y-6">
          {Object.entries(timelineInfo).map(([timeline, info], index) => {
            const timelineItems = items.filter(i => i.timeline === timeline);
            const tCompleted = timelineItems.filter((item) => item.completed).length;
            const progress = timelineItems.length === 0 ? 0 : (tCompleted / timelineItems.length) * 100;

            return (
              <motion.div
                key={timeline}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.6 }}
                className="bg-white rounded-3xl p-8 shadow-lg"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center text-2xl mr-4`}
                    >
                      {info.icon}
                    </div>
                    <div>
                      <h3 className="font-playfair text-2xl font-bold text-gray-900">
                        {info.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {tCompleted} of {timelineItems.length} completed
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-gold">
                      {Math.round(progress)}%
                    </span>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${progress}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full bg-gradient-to-r ${info.color}`}
                  />
                </div>

                <div className="space-y-3 mb-4">
                  {timelineItems.map((item) => (
                    <motion.div
                      key={item._id}
                      whileHover={{ x: 5 }}
                      className="flex items-center justify-between group cursor-pointer"
                      onClick={() => toggleItem(item)}
                    >
                      <div className="flex items-center">
                        {item.completed ? (
                          <CheckCircle2 className="w-6 h-6 text-gold mr-3 flex-shrink-0" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-300 group-hover:text-gold transition-colors mr-3 flex-shrink-0" />
                        )}
                        <span
                          className={`text-gray-700 group-hover:text-gray-900 transition-colors ${
                            item.completed ? 'line-through opacity-60' : ''
                          }`}
                        >
                          {item.task}
                        </span>
                      </div>
                      <button onClick={(e) => deleteItem(item._id, e)} className="text-red-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
                
                <div className="flex items-center mt-4">
                    <input type="text" placeholder="Add a new task..." 
                        className="flex-1 p-2 border rounded-l-xl focus:outline-none"
                        value={newTaskTexts[timeline] || ''}
                        onChange={(e) => setNewTaskTexts({...newTaskTexts, [timeline]: e.target.value})}
                        onKeyDown={(e) => e.key === 'Enter' && addItem(timeline)}
                    />
                    <button onClick={() => addItem(timeline)} className="bg-gold text-white p-2 px-4 rounded-r-xl flex items-center">
                        <Plus className="w-5 h-5 mr-1" /> Add
                    </button>
                </div>

              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

