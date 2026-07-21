# SigMap Query Context
Generated: 2026-07-20T15:12:26.354Z

## src/task-store.js
```
export class Task  :3-9
constructor(id, title, done = false)  :4-8
export class TaskStore  :11-63
constructor(initialTasks = [])  :14-16
tasks()  :18-20
createTask(text)  :22-29
toggleTask(id)  :31-40
updateTask(id, text)  :42-53
deleteTask(id)  :55-62
```

## src/task-shortcut-controller.js
```
export class TaskShortcutController  :7-47
constructor(host, onCommand)  :30-34
hostConnected()  :36-40
hostDisconnected()  :42-46
```

## src/task-change-log.js
```
export class TaskChangeLog  :8-99
constructor()  :26-30
willUpdate(changedProperties)  :38-50
if(!container)  :42-45
updated(changedProperties)  :55-71
if(!container)  :61-64
if(snapshot.top > 0)  :67-69
render()  :73-98
```

## src/practice-shell.js
```
export class EventLog  :7-15
export class PracticeShell  :20-75
constructor()  :29-35
if(action === 'created')  :44-49
switch(command)  :53-60
render()  :63-74
```
