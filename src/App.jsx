import React, { useState, useEffect } from 'react';
import { Clock, Edit2, Save, X, Trash2, Calendar, ArrowLeft } from 'lucide-react';

const App = () => {
  const [records, setRecords] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingField, setEditingField] = useState(null);
  const [tempTime, setTempTime] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [page, setPage] = useState('dashboard');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const key = `work-time-${currentYear}-${currentMonth + 1}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      setRecords(JSON.parse(saved));
    }
  }, [currentMonth, currentYear]);

  const saveRecords = (newRecords) => {
    const key = `work-time-${currentYear}-${currentMonth + 1}`;
    localStorage.setItem(key, JSON.stringify(newRecords));
    setRecords(newRecords);
  };

  const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  const quickClock = (type) => {
    const time = getCurrentTime();
    const today = new Date().toISOString().split('T')[0];
    const newRecords = {
      ...records,
      [today]: {
        ...records[today],
        [type]: time,
        date: today
      }
    };
    saveRecords(newRecords);
  };

  const startEdit = (field) => {
    const currentValue = records[selectedDate]?.[field] || '';
    setTempTime(currentValue);
    setEditingField(field);
  };

  const saveEdit = () => {
    if (!tempTime.match(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)) {
      alert('請輸入正確的時間格式 (HH:MM)');
      return;
    }
    const newRecords = {
      ...records,
      [selectedDate]: {
        ...records[selectedDate],
        [editingField]: tempTime,
        date: selectedDate
      }
    };
    saveRecords(newRecords);
    setEditingField(null);
    setTempTime('');
  };

  const cancelEdit = () => {
    setEditingField(null);
    setTempTime('');
  };

  const calculateMinutes = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    return (endH * 60 + endM) - (startH * 60 + startM);
  };

  const minutesToTime = (minutes) => {
    const absMinutes = Math.abs(minutes);
    const hours = Math.floor(absMinutes / 60);
    const mins = absMinutes % 60;
    const sign = minutes >= 0 ? '+' : '-';
    return `${sign}${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  const minutesToWorkTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  const deleteRecord = (date) => {
    if (window.confirm('確定要刪除這筆記錄嗎?')) {
      const newRecords = { ...records };
      delete newRecords[date];
      saveRecords(newRecords);
    }
  };

  const getStats = () => {
    const today = records[selectedDate];
    const todayMinutes = today ? calculateMinutes(today.clockIn, today.clockOut) : 0;
    const todayDiff = todayMinutes - 570;

    let monthTotal = 0;
    Object.keys(records).forEach(date => {
      const record = records[date];
      if (record.clockIn && record.clockOut) {
        const minutes = calculateMinutes(record.clockIn, record.clockOut);
        monthTotal += (minutes - 570);
      }
    });

    return { todayMinutes, todayDiff, monthTotal };
  };

  const stats = getStats();
  const todayRecord = records[new Date().toISOString().split('T')[0]];

  const getDatesInMonth = () => {
    const dates = [];
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      dates.push(date);
    }
    return dates.reverse();
  };

  const getWeekday = (date) => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return days[date.getDay()];
  };

  const getWeekdayChinese = (date) => {
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    return days[date.getDay()];
  };

  if (page === 'dashboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
        <div className="max-w-md mx-auto pt-8">
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl shadow-2xl p-8 mb-6 border-4 border-gray-700">
            <div className="bg-black rounded-xl p-6 shadow-inner border-2 border-gray-900">
              <div className="text-center mb-4">
                <div className="font-mono text-7xl font-bold text-green-400 tracking-wider filter drop-shadow-lg" style={{textShadow: '0 0 20px rgba(34, 197, 94, 0.8)'}}>
                  {String(currentTime.getHours()).padStart(2, '0')}:{String(currentTime.getMinutes()).padStart(2, '0')}
                </div>
                <div className="font-mono text-2xl text-green-400 mt-2 opacity-70">
                  {String(currentTime.getSeconds()).padStart(2, '0')}
                </div>
              </div>
              <div className="border-t border-green-900 pt-4 mt-4">
                <div className="font-mono text-xl text-green-400 text-center opacity-80">
                  {currentTime.getFullYear()}-{String(currentTime.getMonth() + 1).padStart(2, '0')}-{String(currentTime.getDate()).padStart(2, '0')}
                </div>
                <div className="font-mono text-lg text-green-400 text-center mt-2 opacity-70">
                  星期{getWeekdayChinese(currentTime)} {getWeekday(currentTime)}
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-2xl shadow-xl p-6 mb-4 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-lg font-semibold">今日打卡</h2>
              <Calendar className="text-green-400" size={24} />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-black rounded-lg p-4 border border-gray-700">
                <div className="text-green-400 text-xs mb-1 opacity-70">上班</div>
                <div className="font-mono text-2xl text-green-400">
                  {todayRecord?.clockIn || '--:--'}
                </div>
              </div>
              <div className="bg-black rounded-lg p-4 border border-gray-700">
                <div className="text-green-400 text-xs mb-1 opacity-70">下班</div>
                <div className="font-mono text-2xl text-green-400">
                  {todayRecord?.clockOut || '--:--'}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => quickClock('clockIn')} disabled={todayRecord?.clockIn} className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors">
                上班打卡
              </button>
              <button onClick={() => quickClock('clockOut')} disabled={!todayRecord?.clockIn || todayRecord?.clockOut} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors">
                下班打卡
              </button>
            </div>
          </div>
          <div className="bg-gray-800 rounded-2xl shadow-xl p-6 mb-4 border border-gray-700">
            <div className="text-green-400 text-sm mb-2 opacity-70">本月累計差異</div>
            <div className={`font-mono text-5xl font-bold ${stats.monthTotal >= 0 ? 'text-green-400' : 'text-red-400'}`} style={{textShadow: `0 0 20px ${stats.monthTotal >= 0 ? 'rgba(34, 197, 94, 0.5)' : 'rgba(248, 113, 113, 0.5)'}`}}>
              {minutesToTime(stats.monthTotal)}
            </div>
            <div className="text-gray-400 text-xs mt-2">
              {stats.monthTotal >= 0 ? '多出時數' : '需補時數'}
            </div>
          </div>
          <button onClick={() => setPage('detail')} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-4 rounded-xl transition-colors border border-gray-600">
            查看詳細記錄
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <button onClick={() => setPage('dashboard')} className="flex items-center gap-2 text-gray-600 mb-4 hover:text-gray-800">
          <ArrowLeft size={20} />
          返回儀表盤
        </button>
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={24} />
            <h1 className="text-xl font-bold">打卡記錄</h1>
          </div>
          <div className="text-sm text-gray-600">
            {currentYear}年{currentMonth + 1}月
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <label className="block text-sm text-gray-600 mb-2">選擇日期</label>
          <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full p-2 border rounded">
            {getDatesInMonth().map(date => (
              <option key={date} value={date}>
                {date} {date === new Date().toISOString().split('T')[0] && '(今天)'}
              </option>
            ))}
          </select>
        </div>
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">上班時間</span>
              {editingField !== 'clockIn' && (
                <button onClick={() => startEdit('clockIn')} className="text-blue-600 hover:text-blue-700">
                  <Edit2 size={16} />
                </button>
              )}
            </div>
            {editingField === 'clockIn' ? (
              <div className="flex gap-2">
                <input type="text" value={tempTime} onChange={(e) => setTempTime(e.target.value)} placeholder="HH:MM" className="flex-1 p-2 border rounded text-center text-2xl font-mono" autoFocus />
                <button onClick={saveEdit} className="px-3 bg-green-600 text-white rounded">
                  <Save size={20} />
                </button>
                <button onClick={cancelEdit} className="px-3 bg-gray-400 text-white rounded">
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="flex-1 p-3 bg-gray-50 rounded text-center text-2xl font-mono">
                  {records[selectedDate]?.clockIn || '--:--'}
                </div>
                <button onClick={() => { const time = getCurrentTime(); const newRecords = { ...records, [selectedDate]: { ...records[selectedDate], clockIn: time, date: selectedDate } }; saveRecords(newRecords); }} className="px-4 bg-blue-600 text-white rounded hover:bg-blue-700">
                  現在
                </button>
              </div>
            )}
          </div>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">下班時間</span>
              {editingField !== 'clockOut' && (
                <button onClick={() => startEdit('clockOut')} className="text-blue-600 hover:text-blue-700">
                  <Edit2 size={16} />
                </button>
              )}
            </div>
            {editingField === 'clockOut' ? (
              <div className="flex gap-2">
                <input type="text" value={tempTime} onChange={(e) => setTempTime(e.target.value)} placeholder="HH:MM" className="flex-1 p-2 border rounded text-center text-2xl font-mono" autoFocus />
                <button onClick={saveEdit} className="px-3 bg-green-600 text-white rounded">
                  <Save size={20} />
                </button>
                <button onClick={cancelEdit} className="px-3 bg-gray-400 text-white rounded">
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="flex-1 p-3 bg-gray-50 rounded text-center text-2xl font-mono">
                  {records[selectedDate]?.clockOut || '--:--'}
                </div>
                <button onClick={() => { const time = getCurrentTime(); const newRecords = { ...records, [selectedDate]: { ...records[selectedDate], clockOut: time, date: selectedDate } }; saveRecords(newRecords); }} className="px-4 bg-blue-600 text-white rounded hover:bg-blue-700">
                  現在
                </button>
              </div>
            )}
          </div>
          {records[selectedDate]?.clockIn && records[selectedDate]?.clockOut && (
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">當日工時</span>
                <span className="font-mono font-semibold">
                  {minutesToWorkTime(calculateMinutes(records[selectedDate].clockIn, records[selectedDate].clockOut))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">當日差異</span>
                <span className={`font-mono font-semibold ${calculateMinutes(records[selectedDate].clockIn, records[selectedDate].clockOut) - 570 >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {minutesToTime(calculateMinutes(records[selectedDate].clockIn, records[selectedDate].clockOut) - 570)}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="text-sm text-gray-600 mb-1">本月累計差異</div>
          <div className={`text-3xl font-mono font-bold ${stats.monthTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {minutesToTime(stats.monthTotal)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.monthTotal >= 0 ? '多出時數' : '需補時數'}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-3">本月記錄</h2>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {Object.keys(records).sort((a, b) => b.localeCompare(a)).map(date => {
              const record = records[date];
              const minutes = calculateMinutes(record.clockIn, record.clockOut);
              const diff = minutes - 570;
              return (
                <div key={date} className="border rounded p-3 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{date}</div>
                      <div className="text-xs text-gray-600">
                        {record.clockIn} - {record.clockOut || '未打卡'}
                      </div>
                    </div>
                    <button onClick={() => deleteRecord(date)} className="text-red-500 hover:text-red-700 ml-2">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  {record.clockOut && (
                    <div className="flex justify-between text-xs mt-2">
                      <span className="text-gray-500">工時: {minutesToWorkTime(minutes)}</span>
                      <span className={`font-mono ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {minutesToTime(diff)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;