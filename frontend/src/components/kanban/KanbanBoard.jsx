import React, { useState } from 'react';

const KanbanBoard = () => {
  const [tasks, setTasks] = useState({
    todo: [
      {
        id: 1,
        title: "Design landing page",
        description: "Finalize visuals and layout for the new landing page.",
        dueDate: "Oct 25",
        assignee: { name: "John", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=160&h=160&q=80" }
      },
      {
        id: 2,
        title: "Create wireframes",
        description: "Develop initial wireframes for the user dashboard.",
        dueDate: "Oct 28",
        assignee: { name: "Sarah", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=160&h=160&q=80" }
      },
      {
        id: 3,
        title: "Gather content",
        description: "Collect all necessary text and images for website.",
        dueDate: "Nov 2",
        assignee: { name: "Mike", avatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=160&h=160&q=80" }
      }
    ],
    inProgress: [
      {
        id: 4,
        title: "Develop user authentication",
        description: "Build secure login and registration functionality.",
        dueDate: "Nov 10",
        priority: "High Priority",
        assignee: { name: "Alex", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=160&h=160&q=80" }
      },
      {
        id: 5,
        title: "Implement task management",
        description: "Create core features for task creation and tracking.",
        dueDate: "Nov 10",
        assignee: { name: "Emma", avatar: "https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=160&h=160&q=80" }
      }
    ],
    done: [
      {
        id: 6,
        title: "Deploy application",
        description: "Push final build to production servers.",
        status: "Completed",
        assignee: { name: "David", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=160&h=160&q=80" }
      },
      {
        id: 7,
        title: "Test application",
        description: "Conduct thorough QA and bug fixing.",
        status: "Completed",
        assignee: { name: "Lisa", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=160&h=160&q=80" }
      }
    ]
  });

  const TaskCard = ({ task }) => (
    <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer">
      <h4 className="font-semibold text-gray-900 text-sm mb-2 leading-5">{task.title}</h4>
      <p className="text-xs text-gray-600 mb-4 leading-4">{task.description}</p>
      
      {task.priority && (
        <div className="mb-3">
          <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-md">
            {task.priority}
          </span>
        </div>
      )}
      
      {task.status && (
        <div className="mb-3">
          <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-md">
            {task.status}
          </span>
        </div>
      )}
      
      <div className="flex items-center justify-between mt-3">
        {task.dueDate && (
          <span className="text-xs text-gray-500 font-medium">Due: {task.dueDate}</span>
        )}
        <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-200">
          <img
            className="w-full h-full object-cover"
            src={task.assignee.avatar}
            alt={task.assignee.name}
            title={task.assignee.name}
          />
        </div>
      </div>
    </div>
  );

  const Column = ({ title, tasks, onAddTask }) => (
    <div className="bg-gray-50 rounded-lg p-4 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
        <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>
      
      <div className="space-y-0">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
        
        <button
          onClick={onAddTask}
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-300 hover:text-blue-600 text-sm font-medium transition-colors duration-200 bg-white"
        >
          + Add task
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 py-6">
        {/* Project Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Project Alpha Board</h1>
              <p className="text-sm text-gray-600">Manage tasks and track progress across different stages of the project.</p>
            </div>
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Column
            </button>
          </div>
          
          {/* View Tabs */}
          <div className="flex items-center space-x-8 border-b border-gray-200">
            <button className="text-sm font-medium text-gray-600 pb-3 hover:text-gray-900 transition-colors">List</button>
            <button className="text-sm font-medium text-blue-600 pb-3 border-b-2 border-blue-600">Board</button>
            <button className="text-sm font-medium text-gray-600 pb-3 hover:text-gray-900 transition-colors">Calendar</button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Column 
            title="To Do" 
            tasks={tasks.todo}
            onAddTask={() => console.log('Add task to To Do')}
          />
          <Column 
            title="In Progress" 
            tasks={tasks.inProgress}
            onAddTask={() => console.log('Add task to In Progress')}
          />
          <Column 
            title="Done" 
            tasks={tasks.done}
            onAddTask={() => console.log('Add task to Done')}
          />
          
          {/* Add New Column */}
          <div className="bg-gray-50 rounded-lg p-4 min-h-96 flex items-center justify-center border-2 border-dashed border-gray-300">
            <button className="flex flex-col items-center justify-center text-gray-500 hover:text-gray-700 transition-colors">
              <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-medium">Add New Column</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;