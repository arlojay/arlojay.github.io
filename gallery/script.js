const images = blender.querySelectorAll("img");

for (let el of images) {
    let loadingEl = document.createElement("a");
    loadingEl.classList.add("loading");
    loadingEl.setAttribute("src", el.src);
    loadingEl.innerText = "Loading..."

    el.parentElement.insertBefore(loadingEl, el);

    el.hidden = true;
    loadingEl.hidden = false;

    el.addEventListener("load", e => {
        el.hidden = false;
        loadingEl.hidden = true;
    })
    el.addEventListener("click", e => {
        document.location = el.src;
    })
}