
const itemsToobar = require('../scripts/commandList.js')
function initEditor() {
    vdre_editor.document.designMode = "On";
    vdre_editor.document.body.style.fontFamily = "Dank Mono";
    let toolbar = document.createElement("div");
    toolbar.classList.add("editor_toolbar");
    itemsToobar.forEach(item => {
        toolbar.appendChild(createElement('button', {
            class: 'btn_control',
            id: `id_${item.command}`
        }, `<i id="${item.icon}" class="fas fa-${item.icon}"></i>`, {
            click: () => {
                document.querySelectorAll('.btn_control').forEach(btn => {
                    const id = btn.getAttribute('id');
                    if (id === "id_" + item.command) btn.classList.toggle('active');

                })
                executeCommand(item)
            }
        }))
    })


    document.querySelector("#toolbar").appendChild(toolbar);

}
const containerModal = document.createElement('div');
containerModal.classList.add('modal-hidden');
document.querySelector("#toolbar ").appendChild(containerModal);

function createElement(elem, attributes, inner, events) {
    const element = document.createElement(elem);

    if (inner != null) element.innerHTML = inner;
    if (events != null) for (let [key, value] of Object.entries(events)) {
        element.addEventListener(key, value);

    }
    if (attributes != null) for (let [key, value] of Object.entries(attributes)) {
        element.setAttribute(key, value);

    }

    return element;
}
let insert = true;
let insertPre = true;
function executeCommand(item) {

    const modalSelect = document.querySelector("#modal_" + item.command)
    if (item.command == "quote") {
        if (insert) {
            vdre_editor.document.execCommand('formatBlock', false, "blockquote")
            insert = false;
        } else {
            vdre_editor.document.execCommand('formatBlock', false, "p")
            insert = true;
        }
    }
    if (item.command == "pre") {
        if (insertPre) {
            vdre_editor.document.execCommand('formatBlock', false, "pre")
            insertPre = false;
        } else {
            vdre_editor.document.execCommand('formatBlock', false, "p")
            insertPre = true;
        }
    }
    if (!item.modal) vdre_editor.document.execCommand(item.command, false, item.value)
    else {
        let modal = null;


        if (modalSelect === null) {
            containerModal.classList.add("modal")
            containerModal.classList.remove("modal-hidden")
            if (item.type == 'select') {
                modal = createElement('select', { class: "select_modal_command", id: "modal_" + item.command }, null, {
                    blur: () => {
                        containerModal.classList.remove("modal");
                        containerModal.removeChild(containerModal.children[0])
                    },
                    change: (e) => vdre_editor.document.execCommand(item.command, false, e.target.value)
                });
                item.options.forEach(option => {
                    modal.appendChild(createElement('option', { value: option.value }, option.label, null, null))
                })
                containerModal.appendChild(modal);
            }
            if (item.type == 'input') {
                modal = createElement('input', { class: "input_modal_command", id: "modal_" + item.command, type: "color" }, null, {
                    change: (e) => vdre_editor.document.execCommand(item.command, false, e.target.value),
                    blur: () => {
                        containerModal.classList.remove("modal")
                        containerModal.removeChild(containerModal.children[0])
                    }
                });
                containerModal.appendChild(modal);


            }

        } else {
            containerModal.removeChild(modalSelect);
            containerModal.classList.remove("modal")
            containerModal.classList.add("modal-hidden")
        }



    }
}

async function saveTask() {
    newTask.content = vdre_editor.document.body.outerHTML;
    const result = await ipcRenderer.invoke('create-task', JSON.stringify(newTask));
    console.log(result);
}
async function initEditTask() {
    initEditor();

    const date = document.getElementById("date");
    const time = document.getElementById("time");
    const category = document.getElementById("select_category_span");
    const res = await ipcRenderer.invoke("data-edit-task", "Tarefa Atual")
    const categories = await ipcRenderer.invoke("get-categories", "all")
    let categoryHtml = null;
    date.value = res.date
    time.value = res.time
    categories.forEach(cat => {
        if (cat.id === res.category) {
            category.innerHTML = `<span style="${cat.style}"> <i class="fas fa-${cat.icon}"></i> </span> <span>${cat.name}</span>`
            newTask.category = cat.id
            categoryHtml = cat;

        }
    })

    vdre_editor.document.body.innerHTML = res.content

    document.getElementById('saveEditTask').addEventListener("click", async () => {
        newTask.content = vdre_editor.document.body.outerHTML;
        newTask.date = document.querySelector("#date").value;
        newTask.id = res.id;
        newTask.time = document.querySelector("#time").value;
        Swal.fire({
            html: `
                <h2 class="swal-title"> Você vai alterar a tarefa: </h2>
                <div class="swal-content-1">
                <header>
                    <p class="swal-category"><span style="${categoryHtml != null ? categoryHtml.style : ''}"> <i class="fas fa-${categoryHtml != null ? categoryHtml.icon : ''}"></i> </span> <span>${categoryHtml != null ? categoryHtml.name : ''}</span></p>
                    <p class="swal-time"><i class="fas fa-clock"></i><span>${res.time}</span></p>
                    <p class="swal-date"><i class="fas fa-calendar"></i><span>${res.date}</span></p>
                </header>
                ${res.content}</div>
                <h2 class="swal-text"> para: </h2>
                <div class="swal-content-2">
                <header>
                    ${category.innerHTML}
                    <p class="swal-time"><i class="fas fa-clock"></i><span>${newTask.time}</span></p>
                    <p class="swal-date"><i class="fas fa-calendar"></i><span>${newTask.date}</span></p>
                </header>
                ${newTask.content}</div>
            `,

            showCancelButton: true,
            confirmButtonColor: 'rgb(221, 15, 80)',
            cancelButtonColor: '#424242',
            confirmButtonText: 'Confirmar?',
            cancelButtonText: "Cancelar",
        }).then(async (result) => {
            if (result.isConfirmed) {

                const update = {
                    name: "update",
                    id: res.id,
                    content: newTask
                }
                const result = await ipcRenderer.invoke('update-task', JSON.stringify(update));
                Swal.fire(
                    'Tarefa Atualizada!',
                    '',
                    'success'
                )
                await ipcRenderer.invoke('close_edit-window', 'close');
            }
        })


    })
}
