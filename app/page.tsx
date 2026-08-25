"use client"

import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [taskName, setTaskName] = useState("");
  const [tasks, setTasks] = useState([]);

  const handleAddTask = () => {
    if (taskName.trim() !== "") {
      setTasks([...tasks, taskName]);
      setTaskName("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800">Trello Clone</h1>
      <div className="mt-8">
        <input
          type="text"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          placeholder="Add a new task"
          className="w-full p-2 border border-gray-300 rounded"
        />
        <button
          onClick={handleAddTask}
          className="mt-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
        >
          Add Task
        </button>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-800">Tasks</h2>
        <ul className="mt-4">
          {tasks.map((task, index) => (
            <li key={index} className="flex items-center justify-between">
              <span>{task}</span>
              <button
                onClick={() => setTasks(tasks.filter((_, i) => i !== index))}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
