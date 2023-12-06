import { useState } from 'react';

function Dropdown({ deleteTask, task }) {
    const [deleteTaskId, setDeleteTaskId] = useState({})

    const DeletePopUp = (taskId) => {
        setDeleteTaskId(prevState => ({
            ...prevState,
            [taskId]: !prevState[taskId]
        }));
    };

    const taskId = task._id.$oid;



    return (
        <div className='relative'>
            <div onClick={() => DeletePopUp(task._id.$oid)} className="text-blue-600 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-three-dots-vertical mt-[2px] cursor-pointer" viewBox="0 0 16 16"> <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" /></svg>
            </div>
            {deleteTaskId[taskId] && <div className="absolute mt-2 py-2 lg:w-[300px] w-[200px] bg-white rounded-md shadow-lg z-10">
                <ul>
                    <li onClick={() => deleteTask(task._id.$oid)} className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Delete</li>
                </ul>
            </div>}
        </div>
    );
}

export default Dropdown;


