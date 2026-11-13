function getInitials(name) {
    return name.split(" ").filter(Boolean).map(word => Array.from(word)[0]).join("").toUpperCase();
}
