let copiedPopupTime = 0;
let copiedPopupVisible = false;
let lastTime = 0;

function copyText(text) {
    navigator.clipboard.writeText(text);
    copiedPopupTime = lastTime + 5000;
}

window.addEventListener("load", () => {
    const copiedPopup = document.querySelector("#copied-popup");

    copiedPopup.addEventListener("mouseover", () => {
        copiedPopupTime = lastTime;
    })

    function frame(time) {
        lastTime = time;
        requestAnimationFrame(frame);

        if(copiedPopupTime > time) {
            if(!copiedPopupVisible) {
                copiedPopupVisible = true;
                copiedPopup.classList.add("show");
            }
        } else {
            if(copiedPopupVisible) {
                copiedPopupVisible = false;
                copiedPopup.classList.remove("show");
            }
        }
    }
    requestAnimationFrame(frame);

    document.querySelectorAll(".navlink").forEach(element => {
        element.addEventListener("click", e => {
            window.history.pushState(element.href, null, element.href);
            updatePage();
        })
    });

    window.addEventListener("popstate", () => {
        updatePage();
    })

    updatePage();
});

function updatePage() {
    const currentPage = document.location.hash.slice(1);

    if(currentPage == "") {
        showPage("home");
    } else {
        showPage(currentPage);
    }
}

function showPage(pageName) {
    let foundPage = false;

    for(const pageElement of Array.from(document.querySelectorAll(".page"))) {
        if(pageElement.dataset.name == pageName) {
            pageElement.hidden = false;
            foundPage = true;
        } else {
            pageElement.hidden = true;
        }
    }
    for(const navLink of Array.from(document.querySelectorAll(".navlink"))) {
        if(navLink.getAttribute("href").slice(1) == pageName) {
            navLink.classList.add("current");
        } else {
            navLink.classList.remove("current");
        }
    }

    if(!foundPage && pageName != "404") showPage("404");
}