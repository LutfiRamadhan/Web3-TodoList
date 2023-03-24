// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.5.16;

contract TodoList {
    uint public taskCount = 0;

    struct Task {
        uint id;
        string content;
        bool completed;
    }

    mapping(uint => Task) public tasks;

    constructor() public {
        createTask("My First Task!");
    }

    event TaskCreated(uint id, string content, bool completed);

    function createTask(string memory _content) public {
        taskCount++;
        tasks[taskCount] = Task(taskCount, _content, false);
        emit TaskCreated(taskCount, _content, false);
    }

    function toggleCompleted(uint _id) public {
        Task memory _task = tasks[_id];
        _task.completed = !_task.completed;
        tasks[_id] = _task;
        emit TaskCreated(_id, _task.content, _task.completed);
    }

    function editTask(uint _id, string memory _content) public {
        Task memory _task = tasks[_id];
        _task.content = _content;
        tasks[_id] = _task;
    }

    function deleteTask(uint _id) public {
        delete tasks[_id];
    }
}
