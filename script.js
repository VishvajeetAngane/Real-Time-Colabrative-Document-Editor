const socket = io();

// Get document ID from URL or generate a new one
const docId = window.location.pathname.split("/")[1] || Math.random().toString(36).substring(2, 8);
document.getElementById("document-url").value = window.location.origin + "/" + docId;

const editor = document.getElementById("editor");

// Load existing document content
socket.emit("get-document", docId);
socket.on("load-document", (content) => {
    editor.value = content;
});

// Listen for text changes
editor.addEventListener("input", () => {
    socket.emit("save-document", editor.value);
    socket.emit("send-changes", editor.value);
});

// Receive real-time changes
socket.on("receive-changes", (data) => {
    editor.value = data;
});
