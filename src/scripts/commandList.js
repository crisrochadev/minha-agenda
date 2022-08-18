module.exports = [
    { command: "bold", icon: "bold" },
    { command: "italic", icon: "italic" },
    { command: "underline", icon: "underline" },
    { command: "strikethrough", icon: "strikethrough" },
    { command: "quote", icon: "quote-right" },
    { command: "pre", icon: "code" },
    { command: "outdent", icon: "outdent" },
    { command: "indent", icon: "indent" },
    { command: "insertOrderedList", icon: "list-ol" },
    { command: "insertUnorderedList", icon: "list-ul" },
    { command: "justifyLeft", icon: "align-left" },
    { command: "justifyCenter", icon: "align-center" },
    { command: "justifyRight", icon: "align-right" },
    { command: "justifyFull", icon: "align-justify" },
    { command: "insertHorizontalRule", icon: "horizontal-rule" },
    {
        command: "fontSize", icon: "text-size", modal: true, type: "select", options: [
            { label: "Extra-Pequeno", value: 1 },
            { label: "Pequeno", value: 2 },
            { label: "Regular", value: 3 },
            { label: "Médio", value: 4 },
            { label: "Grande", value: 5 },
            { label: "Extra-Grande", value: 6 },
        ]
    },
    { command: "foreColor", icon: "palette", modal: true, type: "input" },
    { command: "hiliteColor", icon: "highlighter", modal: true, type: "input" },
]