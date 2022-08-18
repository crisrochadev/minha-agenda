require('../scripts/functions.js')
const moment = require('moment');
const Swal = require('sweetalert2')
const { ipcRenderer } = require("electron");
function init() {
    //Funcção criadora de Elementos DOM
    function createNewElement(element, attribues, inner = null, events = null) {
        const elem = document.createElement(element);
        Object.entries(attribues).forEach(([key, value]) => {
            elem.setAttribute(key, value);
        });
        if (inner !== null) elem.innerHTML = inner;
        if (events !== null) Object.entries(events).forEach(([key, value]) => {
            elem.addEventListener(key, value);
        });

        return elem;

    }

    const modalSM = document.querySelectorAll('.modal_sm');
    let open = 'display';
    modalSM.forEach(modal => {
        const idModal = modal.getAttribute('data-modal-id');
        const buttonOpenModalSM = document.querySelector(`button[data-modal='${idModal}']`)
        const idButton = buttonOpenModalSM.getAttribute('data-modal')
        buttonOpenModalSM.addEventListener('click', () => {
            if (buttonOpenModalSM !== null) {
                if (idButton === idModal) {
                    const modalShow = modal.getAttribute('data-display');
                    if (modalShow == 'hidden') modal.setAttribute('data-display', 'display')
                    else modal.setAttribute('data-display', 'hidden')
                }
            }
        })
        if (document.querySelector(`div[data-modal-id=${idModal}] input`)) document.querySelector(`div[data-modal-id=${idModal}] input`).addEventListener('blur', () => {
            modal.setAttribute('data-display', 'hidden')
        })
        if (document.querySelector(`div[data-modal-id=${idModal}] select`)) document.querySelector(`div[data-modal-id=${idModal}] select`).addEventListener('blur', () => {
            modal.setAttribute('data-display', 'hidden')
        })

    })



    /* ===============================Lista de Tarefas============================ */

    const allTasksElement = document.querySelectorAll('.all_tasks')
    const todayTasksElement = document.querySelectorAll('.today_tasks')
    const tomorrowTasksElement = document.querySelectorAll('.tomorrow_tasks')
    const penddingTasksElement = document.querySelectorAll('.pendding_tasks')
    const completedTasksElement = document.querySelectorAll('.completed_tasks')



    allTasksElement.forEach(elListTask => {
        includeTaks('all').then(element => {
            elListTask.appendChild(element)
        })
    })

    tomorrowTasksElement.forEach(elListTask => {
        includeTaks('tomorrow').then(element => {
            elListTask.appendChild(element)
        })
    })

    penddingTasksElement.forEach(elListTask => {
        includeTaks('pendding').then(element => {
            elListTask.appendChild(element)
        })
    })

    completedTasksElement.forEach(elListTask => {
        includeTaks('completed').then(element => {
            elListTask.appendChild(element)
        })
    })

    todayTasksElement.forEach(elListTask => {
        includeTaks('today').then(element => {
            elListTask.appendChild(element)
        })
    })

    async function includeTaks(args) {
        const tasks = await ipcRenderer.invoke('get-tasks', 'all');
        const categories = await ipcRenderer.invoke('get-categories', 'all');

        const containerAllTasks = document.createElement('div');
        containerAllTasks.classList.add('container_all_tasks');
        containerAllTasks.addEventListener('wheel', () => {
            containerAllTasks.style.overflowY = 'scroll'
        })
        containerAllTasks.addEventListener('mouseleave', () => {
            containerAllTasks.style.overflowY = 'hidden'
        })
        if (args == 'all') listAllTasks(containerAllTasks, tasks, categories);
        if (args == 'today') listTodayTasks(containerAllTasks, tasks, categories);
        if (args == 'pendding') listPenndingTasks(containerAllTasks, tasks, categories);
        if (args == 'completed') listCompletedTasks(containerAllTasks, tasks, categories);
        if (args == 'tomorrow') listTomorrowTask(containerAllTasks, tasks, categories);


        return containerAllTasks;
    }
    function returnTwoDigits(num) {
        if (num <= 9) return '0' + num
        else return num
    }
    function orderByTimeTasks(tasks) {
        const newArrayTasks = tasks.map(task => {
            const timeMin = task.time != null ? (parseInt(task.time.split(':')[0]) * 60) + parseInt(task.time.split(':')[1]) : ""
            return {
                id: task.id,
                content: task.content,
                date: task.date,
                time: timeMin,
                category: task.category,
                completed: task.completed,
            }
        })
        newArrayTasks.sort((a, b) => {
            if (a.time < b.time) return -1
            else return true
        })


        const tasksOrdenedList = newArrayTasks.map(t => {
            const timeInHours = (t.time / 60).toFixed(2)
            const min = timeInHours.toString().split('.')[1]
            const timeMin = Math.round((parseInt(min) * 60) / 100)
            const newTime = returnTwoDigits(timeInHours.toString().split('.')[0]) + ':' + returnTwoDigits(timeMin.toString())

            return {
                id: t.id,
                content: t.content,
                date: t.date,
                category: t.category,
                time: newTime,
                completed: t.completed,
            }
        })
        return tasksOrdenedList
    }
    async function listPenndingTasks(elem, tasks, categories) {

        const arrayTaskToday = tasks.filter(task => {
            const dtTask = new Date(task.date + "T23:59");
            const dtNow = new Date(Date.now())
            if (dtTask < dtNow) return task
        })

        orderByTimeTasks(arrayTaskToday).forEach(task => {

            if (task.completed === 0) elem.appendChild(createElements(task, categories))
        })
    }
    //Tarefas Concluidas
    async function listCompletedTasks(elem, tasks, categories) {

        const arrayTaskToday = tasks.filter(task => {
            if (task.completed === 1) return task
        })
        orderByTimeTasks(arrayTaskToday).forEach(task => {
            // console.log(task)
            elem.appendChild(createElements(task, categories))
        })

    }
    //Tarefas de Amanha
    async function listTomorrowTask(elem, tasks, categories) {

        const arrayTaskToday = tasks.filter(task => {
            const dt = new Date(Date.now())
            const dtNow = dt.getFullYear() + "-" + returnTwoDigits(dt.getMonth() + 1) + "-" + returnTwoDigits(dt.getDate() + 1)
            if (dtNow == task.date && task.completed === 0) return task
        })

        orderByTimeTasks(arrayTaskToday).forEach(task => {

            elem.appendChild(createElements(task, categories))
        })

    }
    //Tarefas de Hoje
    async function listTodayTasks(elem, tasks, categories) {

        const arrayTaskToday = tasks.filter(task => {
            const dt = new Date(Date.now())
            const dtNow = dt.getFullYear() + "-" + returnTwoDigits(dt.getMonth() + 1) + "-" + returnTwoDigits(dt.getDate())
            if (dtNow == task.date && task.completed === 0) return task
        })

        orderByTimeTasks(arrayTaskToday).forEach(task => {
            elem.appendChild(createElements(task, categories))

        })

    }

    //Todas as Tarefas
    async function listAllTasks(elem, tasks, categories) {
        orderByTimeTasks(tasks).forEach(task => elem.appendChild(createElements(task, categories)))

    }

    function createElements(task, categories) {
        const dtTask = new Date(task.date + "T23:59");
        const dtNow = new Date(Date.now())



        const liElement = createNewElement('li', { class: 'task_content' })
        if (dtTask < dtNow) liElement.appendChild(createNewElement('span', { class: 'alert_content' }, '<i class="fa fa-exclamation-circle"></i>'));
        liElement.appendChild(createNewElement('input', {
            class: 'conclude_task',
            type: "checkbox",
        }, null, {
            click: (e) => concludeTaskFunction(e, task)
        }));
        categories.forEach(cat => {
            if (cat.id === task.category) {
                liElement.appendChild(createNewElement('p', { class: 'category_content fas' }, `<span style="${cat.style}"> <i class="fas fa-${cat.icon}"></i> </span> <span>${cat.name}</span>`));
                categoryHtml1 = cat
            }
        })

        liElement.appendChild(createNewElement('p', {
            class: 'content_task'
        }, task.content))
        liElement.appendChild(createNewElement('p', { class: 'content_date' }, '<i class="fas fa-calendar"></i><span>' + moment(task.date).format('DD/MM/YYYY') + '</span>'))
        liElement.appendChild(createNewElement('p', { class: 'content_time' }, '<i class="fas fa-clock"></i><span>' + task.time + '</span>'))
        liElement.appendChild(createNewElement('button', { class: 'edit_content' }, '<i class="fas fa-pen"></i>', {
            click: () => editContentFunction(task)
        }))

        liElement.appendChild(createNewElement('button', { class: 'delete_content' }, '<i class="fas fa-trash"></i>', {
            click: () => deleteContentFunction(task)
        }))

        return liElement;

    }



    async function concludeTaskFunction(e, task) {
        const conclude = {
            name: "conclude",
            conclude: task.completed === 0 ? 1 : 0,
            id: task.id
        }
        const result = await ipcRenderer.invoke('update-task', JSON.stringify(conclude))
        console.log(result)
    }
    async function editContentFunction(task) {
        const edit = {
            name: "edit",
            id: task.id,
            content: task
        }
        const result = await ipcRenderer.invoke('update-task', JSON.stringify(edit))
        console.log(result)
    }
    function deleteContentFunction(item) {
        const args = {
            name: "delete",
            id: item.id
        }
        Swal.fire({
            html: `
            <h2 class="swal-title title-delete"> Você deseja deletar esta tarefa?</h2>
            <div class="swal-content-1 content-delete">
            <header>
                <p class="swal-category"><span style="${categoryHtml1.style}"> <i class="fas fa-${categoryHtml1.icon}"></i> </span> <span>${categoryHtml1.name}</span></p>
                <p class="swal-time"><i class="fas fa-clock"></i><span>${item.time}</span></p>
                <p class="swal-date"><i class="fas fa-calendar"></i><span>${item.date}</span></p>
            </header>
            ${item.content}</div>
        `,

            showCancelButton: true,
            confirmButtonColor: 'rgb(221, 15, 80)',
            cancelButtonColor: '#424242',
            confirmButtonText: 'Deletar?',
            cancelButtonText: "Cancelar",
        }).then(async (result) => {
            if (result.isConfirmed) {
                const result = await ipcRenderer.invoke('update-task', JSON.stringify(args))
                Swal.fire(
                    'Tarefa Deletada!',
                    '',
                    'success'
                )
            }
        })
        // Swal.fire({
        //     title: `Deseja deletar a tarefa?`,
        //     text: "Esta ação não pode ser desfeita!",
        //     icon: 'warning',
        //     showCancelButton: true,
        //     confirmButtonColor: 'rgb(221, 15, 80)',
        //     cancelButtonColor: '#424242',
        //     confirmButtonText: 'Yes, delete it!'
        // })
    }
    // async function initEditTask() {
    //     const date = document.getElementById("date");
    //     const time = document.getElementById("time");
    //     const category = document.getElementById("select_category_span");
    //     const editor = document.getElementById("editor");
    //     const res = await ipcRenderer.invoke("data-edit-task", "Aqui os dados das tarefas")

    //     date.value = res.date
    //     time.value = res.time,
    //         category.innerHTML = res.category,
    //         editor.document.body = res.content
    // }

}
init();

/* ===============================Frame da Janela============================ */

const frames = document.querySelectorAll('.frame');
frames.forEach(async (frame, i) => {
    const titleBox = document.createElement('div')
    titleBox.setAttribute('class', 'title_frame');
    titleBox.style = '-webkit-app-region: drag';
    titleBox.innerHTML = `<img src="../main/electron/assets/tray.png"/><h1>Minha Agenda  <span>${document.title}</span></h1>`;
    const menus = document.createElement('ul');
    menus.setAttribute('class', 'menu_frame')
    const itemMenu1 = document.createElement('li');
    const itemMenu2 = document.createElement('li');
    const itemMenu3 = document.createElement('li');
    itemMenu1.addEventListener('click', () => minimizeFunction());
    itemMenu2.addEventListener('click', () => maximizeFunction(i));
    itemMenu3.addEventListener('click', () => closeFunction());
    itemMenu1.innerHTML = '<i class="fas fa-window-minimize"></i>';
    itemMenu2.innerHTML = `<i class="fas fa-window-maximize"></i>`;
    itemMenu2.setAttribute('id', 'res_max_' + i)
    itemMenu3.innerHTML = '<i class="fas fa-times"></i>'

    menus.appendChild(itemMenu1);
    menus.appendChild(itemMenu2);
    menus.appendChild(itemMenu3);


    frame.appendChild(titleBox);
    frame.appendChild(menus);



})

function minimizeFunction() {
    return ipcRenderer.invoke('control-window', 'minimize')
}
async function maximizeFunction(id) {
    console.log(document.querySelector('#res_max_' + id))
    const result = await ipcRenderer.invoke('control-window', 'maximize')
    if (result == 'restore') document.querySelector('#res_max_' + id).innerHTML = `<i class="fas fa-window-restore"></i>`
    else document.querySelector('#res_max_' + id).innerHTML = `<i class="fas fa-window-maximize"></i>`
    console.log(result)
}
function closeFunction() {
    return ipcRenderer.invoke('control-window', 'close')
}

/* ===============================Fim do Frame da Jenela============================ */

