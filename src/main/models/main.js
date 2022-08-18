const { ipcMain, BrowserWindow } = require('electron');
const createWindow = require('../electron/createWindow.js');
const { data } = require('jquery');
const knex = require('./connect.js')
let editTaskWindow = null;
//Criar tabelas

knex.schema.hasTable('tasks').then(function (exists) {
    if (!exists) {
        return knex.schema.createTable('tasks', function (t) {
            t.increments('id').primary();
            t.text('content');
            t.date('date');
            t.time('time');
            t.integer('category');
            t.integer('completed').defaultTo(0);
            t.timestamps(true);
        });
    }
});
knex.schema.hasTable('categories').then(function (exists) {
    if (!exists) {
        return knex.schema.createTable('categories', function (t) {
            t.increments('id').primary();
            t.text('name');
            t.text('style');
            t.text('icon');
            t.boolean('selected').defaultTo(false);
            t.timestamps(true);
        });
    }
});

const tasksArray = [
    { id: "1", content: "Tarefa numero 1", date: "2022-08-10", time: "07:00", completed: 0, category: 2 },
    { id: "2", content: "Tarefa numero 2", date: "2022-08-08", time: "05:00", completed: 0, category: 3 },
    { id: "3", content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque pellentesque lorem nisl, vel malesuada sem finibus quis. Ut ullamcorper auctor neque, eget accumsan justo lacinia quis. Donec aliquam magna ac rhoncus rutrum. Ut convallis lacinia ante. Morbi volutpat ornare mi, non facilisis lacus maximus eget. Aliquam ultricies venenatis mi, eu aliquet enim molestie eu. Mauris quis turpis tempor, mattis elit vel, vestibulum nulla. In id maximus augue. Duis finibus, elit eget posuere tristique, neque magna volutpat dui, nec efficitur lectus ante nec nulla. Aliquam hendrerit finibus dui, a pharetra velit interdum in. Curabitur mollis euismod libero at ullamcorper. Sed ultricies ante a nunc vestibulum, eu lobortis augue aliquet. Donec a efficitur neque. Proin finibus lorem at massa rhoncus feugiat.", date: "2022-08-09", time: "08:45", completed: 0, category: 1 },
    { id: "4", content: "Tarefa numero 4", date: "2022-08-12", time: "11:38", completed: 0, category: 2 },
    { id: "5", content: "Tarefa numero 5", date: "2022-08-11", time: "10:00", completed: 0, category: 4 },
    { id: "6", content: "Tarefa numero 6", date: "2022-08-11", time: "14:00", completed: 0, category: 1 },
    { id: "7", content: "Tarefa numero 7", date: "2022-08-12", time: "08:55", completed: 0, category: 2 },
    { id: "8", content: "Tarefa numero 8", date: "2022-08-14", time: "08:00", completed: 0, category: 3 },
    { id: "9", content: "Tarefa numero 9", date: "2022-08-11", time: "08:00", completed: 0, category: 3 },
    { id: "10", content: "Tarefa numero 10", date: "2022-08-18", time: "08:00", completed: 0, category: 2 },
    { id: "11", content: "Tarefa numero 11", date: "2022-08-18", time: "08:00", completed: 0, category: 4 },
    { id: "12", content: "Tarefa numero 12", date: "2022-08-20", time: "08:00", completed: 0, category: 2 },
    { id: "13", content: "Tarefa numero 13", date: "2022-09-11", time: "08:00", completed: 0, category: 1 },
    { id: "14", content: "Tarefa numero 14", date: "2022-09-11", time: "08:00", completed: 0, category: 2 },
    { id: "15", content: "Tarefa numero 15", date: "2022-08-05", time: "08:00", completed: 0, category: 2 },
    { id: "16", content: "Tarefa numero 16", date: "2022-08-29", time: "08:00", completed: 0, category: 1 },
    { id: "17", content: "Tarefa numero 17", date: "2022-08-14", time: "08:00", completed: 0, category: 2 },
    { id: "18", content: "Tarefa numero 18", date: "2022-08-11", time: "08:00", completed: 0, category: 2 },
    { id: "19", content: "Tarefa numero 19", date: "2022-08-13", time: "08:00", completed: 0, category: 2 },
    { id: "20", content: "Tarefa numero 20", date: "2022-08-12", time: "08:00", completed: 0, category: 2 },
]
const dategories = [
    { id: 1, name: "trabalho", style: "color:red", icon: "user", selected: false },
    { id: 2, name: "casa", style: "color:blue", icon: "house", selected: false },
    { id: 3, name: "faculdade", style: "color:purple", icon: "star", selected: true },
    { id: 4, name: "pessoal", style: "color:yellow", icon: "calendar", selected: false },
    { id: 5, name: "banana", style: "color:yellow", icon: "pen", selected: false },
    { id: 6, name: "maça", style: "color:yellow", icon: "star", selected: false },
    { id: 7, name: "caneta", style: "color:yellow", icon: "user", selected: false },
    { id: 8, name: "papel", style: "color:yellow", icon: "cog", selected: false },
    { id: 9, name: "caderno", style: "color:yellow", icon: "clock", selected: false },
]

ipcMain.handle('control-window', (event, args) => {
    let result = false;
    BrowserWindow.getAllWindows().forEach(win => {
        if (win.isFocused()) {
            if (args == 'minimize') win.minimize();
            if (args == 'close') win.hide();
            if (args == 'maximize') {
                if (win.isMaximized()) {
                    win.restore();
                    result = 'maximize';
                }
                else {
                    win.maximize();
                    result = 'restore'
                }
            }


        }
    })

    return result;
});
ipcMain.handle('create-task', async (event, args) => {
    const data = JSON.parse(args);
    const result = await knex('tasks').insert(data);
    return result;
})
ipcMain.handle('get-restore', (event, args) => {
    let result;
    BrowserWindow.getAllWindows().forEach(win => {
        if (win.isVisible()) {
            if (win.isMaximized()) {
                console.log('oi')
                result = 'restore';
            }
            else {
                result = 'maximize'
            }


        }
    })
    return result;
})
let editTask = {}
ipcMain.handle('get-tasks', async (event, args) => {
    if (args == 'all') {
        return await knex("tasks")
    };
})
ipcMain.handle('get-categories', async (event, args) => {
    if (args == 'all') return await knex("categories");
})

ipcMain.handle('update-task', async (event, args) => {
    const data = JSON.parse(args);
    if (data.name == 'conclude') {
        return await knex("tasks").update({ completed: data.conclude }).where({ id: data.id });
    }
    if (data.name == 'delete') {
        return await knex("tasks").where({ id: data.id }).del();
    }
    if (data.name == 'edit') {
        editTask = data.content
        editTaskWindow = createWindow({ width: 480, height: 320 }, 'editar-tarefa')
        editTaskWindow.show();
        editTaskWindow.webContents.openDevTools();
    }
    if (data.name == 'update') {
        return await knex("tasks").update(data.content).where({ id: data.id });
    }
})

ipcMain.handle("data-edit-task", (event, args) => {
    console.log(args + " -> " + JSON.stringify(editTask));

    return editTask;
})
ipcMain.handle('close_edit-window', (event, args) => {
    editTaskWindow.close();
    return "Success!";
})